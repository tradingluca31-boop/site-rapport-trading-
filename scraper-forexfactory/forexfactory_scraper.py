"""
ForexFactory scraper — tourne sur VPS, push dans Supabase (table public.ff_calendar).

Source : https://nfs.faireconomy.media/ff_calendar_thisweek.xml (mirror officiel FF)
Fréquence conseillée : toutes les 30 min (cron ou systemd timer).

Variables d'env requises (cf .env.example) :
    SUPABASE_URL                ex: https://kzwsokuppgcbkjphecpn.supabase.co
    SUPABASE_SERVICE_ROLE_KEY   clé service_role (écriture) — NE PAS commit !

Usage :
    python forexfactory_scraper.py            # scrape + upsert + exit 0
    python forexfactory_scraper.py --dry-run  # parse + print, sans écrire Supabase
"""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests


def _load_dotenv_if_present() -> None:
    """Charge un fichier .env situé à côté du script, sans dépendance externe.
    Évite d'avoir à installer python-dotenv sur le VPS Windows.
    Variables déjà présentes dans os.environ ne sont pas écrasées."""
    env_path = Path(__file__).resolve().parent / ".env"
    if not env_path.is_file():
        return
    try:
        with env_path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v
    except OSError:
        pass


_load_dotenv_if_present()


FEEDS = [
    "https://nfs.faireconomy.media/ff_calendar_thisweek.xml",
    "https://nfs.faireconomy.media/ff_calendar_nextweek.xml",
]

USER_AGENT = "Mozilla/5.0 (compatible; EdgeFX-FF-Scraper/1.0)"
HTTP_TIMEOUT = 20


@dataclass
class FFEvent:
    event_id: str
    event_time_utc: datetime
    currency: str
    importance: str
    event_name: str
    forecast: Optional[str]
    previous: Optional[str]
    actual: Optional[str]
    url: Optional[str]


# ----------------------------------------------------------------------
# Parsing XML (regex, pas de dépendance xml/lxml — le XML FF est simple)
# ----------------------------------------------------------------------

CDATA_RE = re.compile(r"^<!\[CDATA\[([\s\S]*?)\]\]>$")
EVENT_RE = re.compile(r"<event>([\s\S]*?)</event>")
FIELD_CACHE: dict[str, re.Pattern] = {}


def _strip_cdata(s: str) -> str:
    m = CDATA_RE.match(s.strip())
    return m.group(1) if m else s.strip()


def _field(body: str, name: str) -> Optional[str]:
    pat = FIELD_CACHE.get(name)
    if pat is None:
        pat = re.compile(rf"<{name}>([\s\S]*?)</{name}>")
        FIELD_CACHE[name] = pat
    m = pat.search(body)
    if not m:
        return None
    return _strip_cdata(m.group(1))


def _parse_time_12_to_24(t: str) -> Optional[str]:
    m = re.match(r"^(\d{1,2}):(\d{2})(am|pm)$", t.strip(), re.IGNORECASE)
    if not m:
        return None
    h = int(m.group(1))
    mm = m.group(2)
    p = m.group(3).lower()
    if p == "pm" and h < 12:
        h += 12
    if p == "am" and h == 12:
        h = 0
    return f"{h:02d}:{mm}"


def _parse_ff_date(d: str) -> Optional[str]:
    # MM-DD-YYYY -> YYYY-MM-DD
    m = re.match(r"^(\d{2})-(\d{2})-(\d{4})$", d.strip())
    if not m:
        return None
    return f"{m.group(3)}-{m.group(1)}-{m.group(2)}"


def _norm_impact(s: str) -> str:
    v = s.strip().lower()
    if v == "high":
        return "high"
    if v == "medium":
        return "medium"
    return "low"


def _make_event_id(currency: str, utc_iso: str, title: str) -> str:
    raw = f"{currency}|{utc_iso}|{title}"
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:24]


def parse_xml(xml: str) -> list[FFEvent]:
    out: list[FFEvent] = []
    for m in EVENT_RE.finditer(xml):
        body = m.group(1)
        title = _field(body, "title")
        country = _field(body, "country")
        date_str = _field(body, "date")
        time_str = _field(body, "time")
        impact_str = _field(body, "impact")
        forecast = _field(body, "forecast")
        previous = _field(body, "previous")
        url = _field(body, "url")

        if not all([title, country, date_str, time_str, impact_str]):
            continue

        date = _parse_ff_date(date_str)
        if not date:
            continue

        low_t = time_str.strip().lower()
        if low_t in ("all day", "tentative", "holiday", ""):
            continue

        time24 = _parse_time_12_to_24(time_str)
        if not time24:
            continue

        utc_iso = f"{date}T{time24}:00+00:00"
        try:
            dt = datetime.fromisoformat(utc_iso).astimezone(timezone.utc)
        except ValueError:
            continue

        currency = country.strip().upper()
        title_clean = title.strip()
        event_id = _make_event_id(currency, utc_iso, title_clean)

        out.append(
            FFEvent(
                event_id=event_id,
                event_time_utc=dt,
                currency=currency,
                importance=_norm_impact(impact_str),
                event_name=title_clean,
                forecast=forecast.strip() if forecast and forecast.strip() else None,
                previous=previous.strip() if previous and previous.strip() else None,
                actual=None,
                url=url.strip() if url and url.strip() else None,
            )
        )
    return out


# ----------------------------------------------------------------------
# Fetch
# ----------------------------------------------------------------------


def fetch_all_events() -> list[FFEvent]:
    headers = {"User-Agent": USER_AGENT}
    all_evts: list[FFEvent] = []
    for url in FEEDS:
        for attempt in range(3):
            try:
                r = requests.get(url, headers=headers, timeout=HTTP_TIMEOUT)
                r.raise_for_status()
                # Le XML est en windows-1252, mais requests decode en latin-1 par défaut
                # On force utf-8 après decode (les chars accentués sont rares dans les titles)
                xml = r.content.decode("windows-1252", errors="replace")
                all_evts.extend(parse_xml(xml))
                break
            except Exception as e:
                if attempt == 2:
                    print(f"[warn] fetch {url} failed after 3 attempts: {e}", file=sys.stderr)
                else:
                    time.sleep(2 ** attempt)

    # Dédoublonnage (this week / next week peuvent se chevaucher)
    seen: set[str] = set()
    deduped: list[FFEvent] = []
    for e in all_evts:
        if e.event_id in seen:
            continue
        seen.add(e.event_id)
        deduped.append(e)

    deduped.sort(key=lambda x: x.event_time_utc)
    return deduped


# ----------------------------------------------------------------------
# Upsert Supabase (REST PostgREST avec service_role)
# ----------------------------------------------------------------------


def upsert_supabase(events: list[FFEvent], supabase_url: str, service_key: str) -> int:
    if not events:
        return 0
    url = f"{supabase_url.rstrip('/')}/rest/v1/ff_calendar"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    payload = [
        {
            "event_id": e.event_id,
            "event_time": e.event_time_utc.isoformat(),
            "currency": e.currency,
            "importance": e.importance,
            "event_name": e.event_name,
            "forecast": e.forecast,
            "previous": e.previous,
            "actual": e.actual,
            "url": e.url,
        }
        for e in events
    ]
    # POST en bulk, avec on_conflict=event_id pour faire un vrai upsert
    r = requests.post(
        url + "?on_conflict=event_id",
        headers=headers,
        json=payload,
        timeout=30,
    )
    if r.status_code >= 400:
        raise RuntimeError(f"Supabase upsert failed ({r.status_code}) : {r.text[:400]}")
    return len(events)


# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description="ForexFactory calendar scraper → Supabase")
    ap.add_argument("--dry-run", action="store_true", help="Parse + affiche, n'écrit pas en base")
    args = ap.parse_args()

    events = fetch_all_events()
    print(f"[info] {len(events)} events récupérés (this week + next week dedupliqués)")

    if args.dry_run:
        for e in events[:20]:
            print(
                f"  {e.event_time_utc.isoformat()} [{e.currency}] "
                f"{e.importance.upper():6s} {e.event_name}"
                + (f"  fc={e.forecast}" if e.forecast else "")
                + (f"  prev={e.previous}" if e.previous else "")
            )
        if len(events) > 20:
            print(f"  ... +{len(events) - 20} autres")
        return

    supabase_url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        print(
            "[error] SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises dans l'environnement",
            file=sys.stderr,
        )
        sys.exit(2)

    n = upsert_supabase(events, supabase_url, service_key)
    print(f"[ok] {n} events upserts dans ff_calendar @ {datetime.now(timezone.utc).isoformat()}")


if __name__ == "__main__":
    main()

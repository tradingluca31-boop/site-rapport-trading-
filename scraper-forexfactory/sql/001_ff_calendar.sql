-- Table ff_calendar : calendrier économique ForexFactory (miroir faireconomy.media)
-- Remplit par le scraper Python tournant sur VPS
-- Scheme : public (même logique que mt5_calendar)

create table if not exists public.ff_calendar (
  event_id     text primary key,              -- hash stable : currency+utc+title
  event_time   timestamptz not null,          -- UTC
  currency     text not null,                 -- USD, EUR, GBP, JPY, CHF, AUD, NZD, CAD, CNY
  importance   text not null check (importance in ('low','medium','high')),
  event_name   text not null,                 -- titre brut (ex: "CPI y/y")
  forecast     text,                          -- valeur brute (ex: "3.8%", "22.6K")
  previous     text,
  actual       text,                          -- rarement rempli côté FF (MT5 a souvent mieux)
  url          text,                          -- lien vers la fiche FF
  fetched_at   timestamptz not null default now()
);

create index if not exists ff_calendar_event_time_idx on public.ff_calendar (event_time);
create index if not exists ff_calendar_currency_idx   on public.ff_calendar (currency);

-- RLS : lecture publique (même pattern que mt5_calendar)
alter table public.ff_calendar enable row level security;

drop policy if exists ff_calendar_read_all on public.ff_calendar;
create policy ff_calendar_read_all on public.ff_calendar
  for select to anon, authenticated
  using (true);

-- Écriture réservée au service role (scraper VPS utilise service_role key)
-- Pas de policy INSERT/UPDATE pour anon : le scraper passe par service_role qui bypass RLS.

-- Optionnel : nettoyer les events trop vieux (>60 jours) pour éviter de gonfler la table
-- À lancer manuellement ou via cron mensuel :
-- delete from public.ff_calendar where event_time < now() - interval '60 days';

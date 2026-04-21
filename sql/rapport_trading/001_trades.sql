-- Table : rapport_trading.trades
-- Stockage unifie des trades (manuels + imports Notion + futurs MT5)
-- RLS ouverte car site perso sans auth — la cle anon peut lire/ecrire

create schema if not exists rapport_trading;

create table if not exists rapport_trading.trades (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Contexte
  date        date    not null,          -- jour du trade (filtre UI rapport journalier)
  time        text,                      -- HH:MM d'ouverture
  pair        text    not null,
  direction   text    not null check (direction in ('long','short')),

  -- Prix / taille (text pour flexibilite d'input)
  entry       text,
  sl          text,
  tp          text,
  size        text,

  -- Resultat
  status      text    not null default 'open'
              check (status in ('open','closed-win','closed-loss','cancelled')),
  pnl         text,                      -- libre : "+0.8%", "-$250", "+42R"...

  -- Contenu
  idea        text,
  notes       text,
  tags        text[]  default '{}'::text[],

  -- Provenance
  source      text    default 'manual'
              check (source in ('manual','notion','mt5')),
  notion_id   text    unique              -- pour dedup lors d'import Notion
);

create index if not exists trades_date_idx   on rapport_trading.trades (date desc);
create index if not exists trades_status_idx on rapport_trading.trades (status);
create index if not exists trades_pair_idx   on rapport_trading.trades (pair);

-- Trigger updated_at
create or replace function rapport_trading.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trades_set_updated_at on rapport_trading.trades;
create trigger trades_set_updated_at
  before update on rapport_trading.trades
  for each row execute function rapport_trading.set_updated_at();

-- RLS : site perso → policies ouvertes (cle anon)
alter table rapport_trading.trades enable row level security;

drop policy if exists "trades_public_select" on rapport_trading.trades;
drop policy if exists "trades_public_insert" on rapport_trading.trades;
drop policy if exists "trades_public_update" on rapport_trading.trades;
drop policy if exists "trades_public_delete" on rapport_trading.trades;

create policy "trades_public_select"
  on rapport_trading.trades for select
  using (true);

create policy "trades_public_insert"
  on rapport_trading.trades for insert
  with check (true);

create policy "trades_public_update"
  on rapport_trading.trades for update
  using (true) with check (true);

create policy "trades_public_delete"
  on rapport_trading.trades for delete
  using (true);

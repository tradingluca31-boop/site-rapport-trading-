-- Table : rapport_trading.scenarios
-- Stockage des scenarios (n'importe quel sujet : trading, perso, macro, EA...)
-- Classes par titre + tags pour retrouver rapidement
-- RLS ouverte (site perso, cle anon)

create schema if not exists rapport_trading;

create table if not exists rapport_trading.scenarios (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  title       text    not null,
  content     text    not null default '',
  category    text,                                         -- "trading", "perso", "macro", "EA"...
  tags        text[]  default '{}'::text[],
  pinned      boolean not null default false,
  color       text                                          -- accent libre (hex ou nom)
);

create index if not exists scenarios_updated_idx  on rapport_trading.scenarios (updated_at desc);
create index if not exists scenarios_category_idx on rapport_trading.scenarios (category);
create index if not exists scenarios_pinned_idx   on rapport_trading.scenarios (pinned) where pinned = true;

-- Trigger updated_at (reutilise la fonction de 001_trades.sql)
drop trigger if exists scenarios_set_updated_at on rapport_trading.scenarios;
create trigger scenarios_set_updated_at
  before update on rapport_trading.scenarios
  for each row execute function rapport_trading.set_updated_at();

-- RLS ouverte (site perso)
alter table rapport_trading.scenarios enable row level security;

drop policy if exists "scenarios_public_select" on rapport_trading.scenarios;
drop policy if exists "scenarios_public_insert" on rapport_trading.scenarios;
drop policy if exists "scenarios_public_update" on rapport_trading.scenarios;
drop policy if exists "scenarios_public_delete" on rapport_trading.scenarios;

create policy "scenarios_public_select"
  on rapport_trading.scenarios for select
  using (true);

create policy "scenarios_public_insert"
  on rapport_trading.scenarios for insert
  with check (true);

create policy "scenarios_public_update"
  on rapport_trading.scenarios for update
  using (true) with check (true);

create policy "scenarios_public_delete"
  on rapport_trading.scenarios for delete
  using (true);

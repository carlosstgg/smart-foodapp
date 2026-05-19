-- SmartFood — schema mínimo para el MVP
-- Ejecuta este script completo en el SQL Editor de Supabase (Project > SQL > New query)

-- ============================================================
-- 1) Tablas
-- ============================================================

create table if not exists public.categories (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  icon        text not null default '🥫',          -- emoji para UI
  shelf_days  int  not null default 7,             -- días estimados de vida útil
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id            bigint generated always as identity primary key,
  name          text not null,
  category_id   bigint references public.categories(id) on delete set null,
  quantity      numeric(10,2) not null default 1,
  unit          text not null default 'unidad',     -- "unidad", "kg", "g", "L", "ml"
  price         numeric(10,2) not null default 0,   -- precio total estimado
  purchase_date date not null default current_date,
  expiry_date   date not null,
  status        text not null default 'active'
                check (status in ('active','consumed','wasted')),
  consumed_at   timestamptz,
  note          text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_products_status      on public.products(status);
create index if not exists idx_products_expiry      on public.products(expiry_date);
create index if not exists idx_products_category    on public.products(category_id);

-- ============================================================
-- 2) Row Level Security (modo demo: lectura/escritura pública)
--    Para producción con usuarios, sustituir las políticas por
--    auth.uid() = owner_id y agregar columna owner_id.
-- ============================================================

alter table public.categories enable row level security;
alter table public.products   enable row level security;

drop policy if exists "categories_all" on public.categories;
create policy "categories_all" on public.categories
  for all using (true) with check (true);

drop policy if exists "products_all" on public.products;
create policy "products_all" on public.products
  for all using (true) with check (true);

-- ============================================================
-- 3) Seed de categorías
-- ============================================================

insert into public.categories (name, icon, shelf_days) values
  ('Frutas',       '🍎', 7),
  ('Verduras',     '🥬', 6),
  ('Lácteos',      '🥛', 10),
  ('Carnes',       '🥩', 3),
  ('Pescados',     '🐟', 2),
  ('Panadería',    '🍞', 4),
  ('Granos',       '🍚', 180),
  ('Enlatados',    '🥫', 365),
  ('Bebidas',      '🧃', 60),
  ('Congelados',   '🧊', 90),
  ('Snacks',       '🍪', 90),
  ('Condimentos',  '🧂', 365),
  ('Otros',        '🛒', 30)
on conflict (name) do nothing;

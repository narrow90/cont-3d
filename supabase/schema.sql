create extension if not exists pgcrypto;

create type public.movimento_tipo as enum ('entrata','uscita');
create type public.ruolo_utente as enum ('admin','utente');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  ruolo public.ruolo_utente not null default 'utente',
  attivo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo public.movimento_tipo not null,
  attiva boolean not null default true,
  sort_order integer not null default 0,
  unique(nome,tipo)
);

create table public.movements (
  id uuid primary key default gen_random_uuid(),
  tipo public.movimento_tipo not null,
  categoria_id uuid not null references public.categories(id),
  importo numeric(12,2) not null check (importo > 0),
  data_movimento date not null,
  descrizione text,
  controparte text,
  metodo_pagamento text,
  utente_id uuid not null references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  annullato boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  movimento_id uuid not null references public.movements(id) on delete cascade,
  storage_path text not null,
  nome_file text not null,
  mime_type text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

insert into public.categories(nome,tipo,sort_order) values
('Pagamento Contanti','entrata',10),('Versamento','entrata',20),('Altro','entrata',30),
('Filamenti','uscita',10),('Stipendi','uscita',20),('Acquisti online','uscita',30),('Trasferta','uscita',40),('Versamento','uscita',50);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.movements enable row level security;
alter table public.attachments enable row level security;

grant select on public.profiles, public.categories, public.movements, public.attachments to authenticated;
grant insert, update on public.movements, public.attachments to authenticated;

create policy "authenticated profiles read" on public.profiles for select to authenticated using (true);
create policy "authenticated categories read" on public.categories for select to authenticated using (true);
create policy "authenticated movements read" on public.movements for select to authenticated using (true);
create policy "authenticated movements insert" on public.movements for insert to authenticated with check ((select auth.uid()) = created_by);
create policy "creator movements update" on public.movements for update to authenticated using ((select auth.uid()) = created_by) with check ((select auth.uid()) = created_by);
create policy "authenticated attachments read" on public.attachments for select to authenticated using (true);
create policy "authenticated attachments insert" on public.attachments for insert to authenticated with check ((select auth.uid()) = created_by);

insert into storage.buckets (id,name,public) values ('movimenti','movimenti',false)
on conflict (id) do nothing;

create policy "authenticated attachment upload" on storage.objects for insert to authenticated
with check (bucket_id='movimenti' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy "authenticated attachment read" on storage.objects for select to authenticated
using (bucket_id='movimenti');

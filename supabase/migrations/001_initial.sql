-- ============================================================
-- Pestisit Limit Kontrol Sistemi - Supabase Migration
-- VERİSİZ VERSİYON - Sadece tablo yapıları
-- Çalıştır: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. KULLANICI PROFİLLERİ
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  email      text not null,
  full_name  text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy if not exists "Kullanıcı kendi profilini görür"
  on profiles for select using (auth.uid() = id);

create policy if not exists "Kullanıcı kendi profilini günceller"
  on profiles for update using (auth.uid() = id);

-- Yeni kullanıcı kayıt olunca otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. PESTİSİT LİMİT VERİTABANI
create table if not exists public.pesticide_limits (
  id         bigserial primary key,
  product_tr text not null,
  product_en text not null,
  category   text not null,
  pesticide  text not null,
  cas_no     text,
  eu_limit   numeric(10,4),
  tr_limit   numeric(10,4),
  ru_limit   numeric(10,4),
  group_name text,
  unique (product_tr, pesticide)
);

alter table public.pesticide_limits enable row level security;

-- Limit veritabanı herkese açık (okuma)
create policy if not exists "Herkes limit okuyabilir"
  on pesticide_limits for select using (true);

create index if not exists idx_limits_lookup
  on pesticide_limits (lower(product_tr), lower(pesticide));


-- 3. ANALİZ GEÇMİŞİ
create table if not exists public.analyses (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  file_name  text not null,
  row_count  integer not null,
  eu_fails   integer not null default 0,
  tr_fails   integer not null default 0,
  ru_fails   integer not null default 0,
  created_at timestamptz default now()
);

alter table public.analyses enable row level security;

create policy if not exists "Kullanıcı kendi analizlerini görür"
  on analyses for select using (auth.uid() = user_id);

create policy if not exists "Kullanıcı analiz ekleyebilir"
  on analyses for insert with check (auth.uid() = user_id);

create index if not exists idx_analyses_user
  on analyses (user_id, created_at desc);


-- 4. ANALİZ SATIRLARI
create table if not exists public.analysis_rows (
  id          bigserial primary key,
  analysis_id uuid references public.analyses(id) on delete cascade not null,
  product     text not null,
  pesticide   text not null,
  result      numeric(10,4) not null,
  eu_limit    numeric(10,4),
  eu_status   text check (eu_status in ('pass','fail','no_limit')),
  tr_limit    numeric(10,4),
  tr_status   text check (tr_status in ('pass','fail','no_limit')),
  ru_limit    numeric(10,4),
  ru_status   text check (ru_status in ('pass','fail','no_limit'))
);

alter table public.analysis_rows enable row level security;

create policy if not exists "Kullanıcı kendi satırlarını görür"
  on analysis_rows for select
  using (
    exists (
      select 1 from analyses a
      where a.id = analysis_id and a.user_id = auth.uid()
    )
  );

create policy if not exists "Kullanıcı satır ekleyebilir"
  on analysis_rows for insert
  with check (
    exists (
      select 1 from analyses a
      where a.id = analysis_id and a.user_id = auth.uid()
    )
  );

create index if not exists idx_rows_analysis on analysis_rows (analysis_id);

-- ============================================================
-- NOT: Veri ekleme yapılmamıştır!
-- Veriler Python scripti ile yüklenecektir.
-- ============================================================
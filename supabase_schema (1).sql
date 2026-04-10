-- ============================
-- RADIO E.P.G.B — Supabase Schema
-- ============================

-- 1. USERS / ROLES
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  phone text,
  role text not null default 'customer' 
    check (role in ('admin','cashier','bartender','bar_manager','dj','pr','vip_customer','customer')),
  notes text,
  created_at timestamp default now()
);

-- 2. EVENTS
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  date date not null,
  start_time time not null,
  description text,
  description_en text,
  image_url text,
  is_published boolean default false,
  created_at timestamp default now()
);

-- 3. TICKET TYPES (per event)
create table ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  name text not null,              -- 'basic' / 'standard' / 'premium'
  name_he text,
  price integer not null,          -- in NIS
  includes_drinks integer default 0, -- number of drinks included
  fast_entry boolean default false,
  quantity_total integer,          -- null = unlimited
  quantity_sold integer default 0,
  secret_link_token text unique,   -- for secret cheap links (yachtzanim etc)
  is_active boolean default true,
  created_at timestamp default now()
);

-- 4. ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  ticket_type_id uuid references ticket_types(id),
  user_id uuid references users(id),
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  quantity integer default 1,
  total_price integer not null,
  payment_status text default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  cardcom_transaction_id text,
  created_at timestamp default now()
);

-- 5. TICKETS (one per person)
create table tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  event_id uuid references events(id),
  ticket_type_id uuid references ticket_types(id),
  holder_name text,
  qr_code text unique not null,    -- unique QR token
  entry_scanned boolean default false,
  entry_scanned_at timestamp,
  entry_scanned_by uuid references users(id),
  created_at timestamp default now()
);

-- 6. DRINK COUPONS
create table drink_coupons (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id),
  user_id uuid references users(id),   -- for staff/dj drinks
  coupon_code text unique not null,
  drinks_total integer not null,
  drinks_used integer default 0,
  coupon_type text default 'ticket'
    check (coupon_type in ('ticket','staff','dj','vip','cost_price')),
  event_id uuid references events(id),
  scanned_by uuid references users(id),
  last_used_at timestamp,
  created_at timestamp default now()
);

-- 7. DRINK SCANS LOG (every scan recorded)
create table drink_scans (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references drink_coupons(id),
  scanned_by uuid references users(id),
  scanned_at timestamp default now(),
  drink_type text,                  -- what drink was taken
  notes text
);

-- 8. CLUB MEMBERS (imported from Eventer / Excel)
create table club_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  member_since date,
  total_events_attended integer default 0,
  total_spent integer default 0,
  tags text[],                      -- ['vip','regular','dj_crowd']
  imported_from text,               -- 'eventer' / 'excel' / 'manual'
  external_id text,                 -- original ID from Eventer
  created_at timestamp default now()
);

-- 9. SECRET LINKS (for pr / yachtzanim)
create table secret_links (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  ticket_type_id uuid references ticket_types(id),
  created_by uuid references users(id),
  max_uses integer,
  uses_count integer default 0,
  expires_at timestamp,
  label text,                       -- e.g. 'יחצן - דנה'
  is_active boolean default true,
  created_at timestamp default now()
);

-- ============================
-- ROW LEVEL SECURITY (basic)
-- ============================
alter table users enable row level security;
alter table tickets enable row level security;
alter table drink_scans enable row level security;

-- Admin sees everything
create policy "Admin full access" on tickets
  for all using (auth.jwt() ->> 'role' = 'admin');

-- Cashier: scan entry only
create policy "Cashier entry scan" on tickets
  for update using (auth.jwt() ->> 'role' in ('admin','cashier'));

-- Bartender: drink coupons only
create policy "Bartender drinks" on drink_coupons
  for update using (auth.jwt() ->> 'role' in ('admin','bartender','bar_manager'));

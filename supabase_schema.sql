-- ═══════════════════════════════════════════════
-- Radio E.P.G.B — Supabase Schema מלא
-- מוחק ישן + יוצר חדש
-- ═══════════════════════════════════════════════

-- מחיקת הכל
DROP TABLE IF EXISTS drink_scans      CASCADE;
DROP TABLE IF EXISTS drink_coupons    CASCADE;
DROP TABLE IF EXISTS club_members     CASCADE;
DROP TABLE IF EXISTS secret_links     CASCADE;
DROP TABLE IF EXISTS tickets          CASCADE;
DROP TABLE IF EXISTS orders           CASCADE;
DROP TABLE IF EXISTS ticket_types     CASCADE;
DROP TABLE IF EXISTS events           CASCADE;
DROP TABLE IF EXISTS users            CASCADE;
DROP TABLE IF EXISTS customers        CASCADE;
DROP TABLE IF EXISTS staff            CASCADE;
DROP TABLE IF EXISTS gifts            CASCADE;
DROP TABLE IF EXISTS shift_reports    CASCADE;

-- ── 1. CUSTOMERS ──
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT UNIQUE NOT NULL,
  gender        TEXT CHECK (gender IN ('M', 'F')),
  visit_count   INTEGER DEFAULT 0,
  is_vip        BOOLEAN DEFAULT FALSE,
  birthday      DATE,
  photo_url     TEXT,
  notes         TEXT,
  tags          TEXT[],
  imported_from TEXT,
  external_id   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. EVENTS ──
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  title_en        TEXT,
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  description     TEXT,
  description_en  TEXT,
  image_url       TEXT,
  is_published    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. TICKET TYPES ──
CREATE TABLE ticket_types (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID REFERENCES events(id) ON DELETE CASCADE,
  name              TEXT NOT NULL CHECK (name IN ('BASIC','STANDARD','PREMIUM')),
  price             INTEGER NOT NULL,
  includes_drinks   INTEGER DEFAULT 0,
  includes_chaser   BOOLEAN DEFAULT TRUE,
  quantity_total    INTEGER,
  quantity_sold     INTEGER DEFAULT 0,
  gender_limit_m    INTEGER,
  gender_limit_f    INTEGER,
  secret_link_token TEXT UNIQUE,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. ORDERS ──
CREATE TABLE orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id               UUID REFERENCES customers(id),
  event_id                  TEXT DEFAULT 'general',
  ticket_type               TEXT NOT NULL CHECK (ticket_type IN ('BASIC','STANDARD','PREMIUM')),
  amount                    INTEGER NOT NULL,
  name                      TEXT NOT NULL,
  email                     TEXT,
  phone                     TEXT NOT NULL,
  gender                    TEXT CHECK (gender IN ('M','F')),
  status                    TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  cardcom_low_profile_code  TEXT,
  approval_number           TEXT,
  card_last4                TEXT,
  paid_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. TICKETS / QR ──
CREATE TABLE tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id),
  type          TEXT NOT NULL CHECK (type IN ('entry','drink','chaser','gift')),
  qr_token      TEXT UNIQUE NOT NULL,
  redeemed      BOOLEAN DEFAULT FALSE,
  redeemed_at   TIMESTAMPTZ,
  redeemed_by   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. STAFF ──
CREATE TABLE staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT UNIQUE,
  role        TEXT NOT NULL CHECK (role IN ('admin','cashier','bartender','bar_manager','dj','pr','security')),
  pin         TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. DRINK COUPONS ──
CREATE TABLE drink_coupons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID REFERENCES orders(id),
  customer_id   UUID REFERENCES customers(id),
  coupon_code   TEXT UNIQUE NOT NULL,
  coupon_type   TEXT DEFAULT 'ticket' CHECK (coupon_type IN ('ticket','staff','dj','vip','gift')),
  drinks_total  INTEGER NOT NULL,
  drinks_used   INTEGER DEFAULT 0,
  event_id      TEXT,
  last_used_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. DRINK SCANS ──
CREATE TABLE drink_scans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   UUID REFERENCES drink_coupons(id),
  scanned_by  TEXT,
  drink_type  TEXT,
  notes       TEXT,
  scanned_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. GIFTS ──
CREATE TABLE gifts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID REFERENCES customers(id),
  type          TEXT NOT NULL CHECK (type IN ('birthday','manual_drink','manual_chaser','manual_gift')),
  qr_token      TEXT UNIQUE,
  note          TEXT,
  given_by      TEXT,
  redeemed      BOOLEAN DEFAULT FALSE,
  redeemed_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. SECRET LINKS ──
CREATE TABLE secret_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token         TEXT UNIQUE NOT NULL,
  ticket_type   TEXT CHECK (ticket_type IN ('BASIC','STANDARD','PREMIUM')),
  created_by    TEXT,
  max_uses      INTEGER,
  uses_count    INTEGER DEFAULT 0,
  expires_at    TIMESTAMPTZ,
  label         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. SHIFT REPORTS ──
CREATE TABLE shift_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        TEXT,
  date            DATE NOT NULL,
  opened_by       TEXT,
  closed_by       TEXT,
  total_tickets   INTEGER DEFAULT 0,
  total_revenue   INTEGER DEFAULT 0,
  drinks_served   INTEGER DEFAULT 0,
  notes           TEXT,
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──
CREATE INDEX idx_customers_phone    ON customers(phone);
CREATE INDEX idx_customers_vip      ON customers(is_vip);
CREATE INDEX idx_orders_customer    ON orders(customer_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_tickets_order      ON tickets(order_id);
CREATE INDEX idx_tickets_token      ON tickets(qr_token);
CREATE INDEX idx_tickets_redeemed   ON tickets(redeemed);
CREATE INDEX idx_drink_coupons_code ON drink_coupons(coupon_code);

-- ── ROW LEVEL SECURITY ──
ALTER TABLE customers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_customers"     ON customers     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_orders"        ON orders        FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_tickets"       ON tickets       FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_drink_coupons" ON drink_coupons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_gifts"         ON gifts         FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_staff"         ON staff         FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "anon_read_customers" ON customers     FOR SELECT USING (true);
CREATE POLICY "anon_read_tickets"   ON tickets       FOR SELECT USING (true);
CREATE POLICY "anon_read_coupons"   ON drink_coupons FOR SELECT USING (true);

-- ── AUTO updated_at ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

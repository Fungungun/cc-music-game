-- Privacy-safe funnel events and idempotent Stripe payment ledger.
CREATE TABLE IF NOT EXISTS funnel_events (
  id          TEXT PRIMARY KEY,
  event_name  TEXT NOT NULL,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  visitor_id  TEXT,
  page        TEXT,
  channel     TEXT,
  experiment  TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_funnel_events_name_date ON funnel_events(event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_funnel_events_user ON funnel_events(user_id);

CREATE TABLE IF NOT EXISTS stripe_payments (
  checkout_session_id TEXT PRIMARY KEY,
  payment_intent_id   TEXT UNIQUE,
  user_id             TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_id         TEXT,
  customer_email      TEXT,
  amount_total        INTEGER NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'aud',
  livemode            INTEGER NOT NULL DEFAULT 0,
  payment_status      TEXT NOT NULL,
  refunded_amount     INTEGER NOT NULL DEFAULT 0,
  completed_at        TEXT,
  updated_at          TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_user ON stripe_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON stripe_payments(payment_status, livemode);

CREATE TABLE IF NOT EXISTS stripe_events (
  event_id    TEXT PRIMARY KEY,
  event_type  TEXT NOT NULL,
  livemode    INTEGER NOT NULL DEFAULT 0,
  received_at TEXT DEFAULT (datetime('now'))
);

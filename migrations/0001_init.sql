-- Music Maestro — D1 schema
-- Apply with: npx wrangler d1 execute music-game --remote --file=migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id                 TEXT PRIMARY KEY,
  email              TEXT UNIQUE NOT NULL,
  password_hash      TEXT NOT NULL,
  salt               TEXT NOT NULL,
  name               TEXT,
  grade              INTEGER DEFAULT 1,
  is_unlocked        INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  created_at         TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS password_resets (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module    TEXT NOT NULL,
  concept   TEXT NOT NULL,
  correct   INTEGER DEFAULT 0,
  wrong     INTEGER DEFAULT 0,
  last_seen TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, module, concept)
);

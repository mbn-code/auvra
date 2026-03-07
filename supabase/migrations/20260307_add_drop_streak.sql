ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drop_streak integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_drop_viewed date;
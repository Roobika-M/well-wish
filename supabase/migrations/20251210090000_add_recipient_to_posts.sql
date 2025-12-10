-- Add recipient column to posts to support anonymous messages sent to a name

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS recipient text;

-- Add simple index to speed up lookups by recipient (case-sensitive)
CREATE INDEX IF NOT EXISTS posts_recipient_idx ON posts (recipient);

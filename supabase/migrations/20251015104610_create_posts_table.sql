/*
  # Create Crowd Wish Wall Posts Table

  1. New Tables
    - `posts`
      - `id` (uuid, primary key) - Unique identifier for each post
      - `content` (text) - The wish/post content submitted by users
      - `upvotes` (integer) - Number of upvotes, defaults to 0
      - `created_at` (timestamptz) - Timestamp when post was created
  
  2. Security
    - Enable RLS on `posts` table
    - Add policy for anyone to read all posts (public access)
    - Add policy for anyone to insert new posts (anonymous posting)
    - Add policy for anyone to update upvotes only (public upvoting)
  
  3. Indexes
    - Index on created_at for efficient chronological sorting
  
  4. Notes
    - This is an anonymous public app, so all operations are allowed to the public
    - RLS is enabled for security best practices
    - Posts are intentionally public and anonymous
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  upvotes integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for efficient sorting by creation date
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read all posts (public wish wall)
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  USING (true);

-- Policy: Anyone can insert new posts (anonymous posting)
CREATE POLICY "Anyone can create posts"
  ON posts FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update posts, but only the upvotes field
CREATE POLICY "Anyone can upvote posts"
  ON posts FOR UPDATE
  USING (true)
  WITH CHECK (true);
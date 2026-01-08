-- Create User Scans Table for Eco-Lens
CREATE TABLE IF NOT EXISTS user_scans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  object_name text NOT NULL,
  confidence real NOT NULL,
  scanned_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_scans ENABLE ROW LEVEL SECURITY;

-- Users can view their own scans
CREATE POLICY "Users can view own scans" 
ON user_scans FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own scans
CREATE POLICY "Users can insert own scans" 
ON user_scans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_scans_user_id_idx ON user_scans(user_id);
CREATE INDEX IF NOT EXISTS user_scans_category_idx ON user_scans(category);

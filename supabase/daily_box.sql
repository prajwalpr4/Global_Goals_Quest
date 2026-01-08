-- Add last_box_open_at column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_box_open_at timestamptz;

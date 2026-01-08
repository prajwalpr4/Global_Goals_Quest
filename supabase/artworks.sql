-- Create Artworks Table
CREATE TABLE user_artworks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  image_data text NOT NULL, -- Base64 Data URL
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_artworks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own artworks" 
ON user_artworks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own artworks" 
ON user_artworks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artworks" 
ON user_artworks FOR DELETE 
USING (auth.uid() = user_id);

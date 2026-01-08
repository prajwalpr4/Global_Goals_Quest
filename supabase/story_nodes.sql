-- Create Story Nodes Table
CREATE TABLE IF NOT EXISTS story_nodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sdg_number int NOT NULL,
  node_order int DEFAULT 0,
  content text NOT NULL,
  choice_a_text text,
  choice_b_text text,
  next_node_a_id uuid,
  next_node_b_id uuid,
  is_ending boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE story_nodes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view story nodes" ON story_nodes;

-- Public read policy
CREATE POLICY "Anyone can view story nodes" 
ON story_nodes FOR SELECT 
USING (true);

-- Insert all nodes first WITHOUT foreign key references
INSERT INTO story_nodes (id, sdg_number, node_order, content, choice_a_text, choice_b_text, is_ending) VALUES
('a1111111-1111-1111-1111-111111111111', 13, 1, 
 'You wake up to find your city covered in thick smog. The news reports that climate change is causing extreme weather. What do you do?',
 'Join a climate protest downtown',
 'Start a recycling program at school',
 false),
 
('a2222222-2222-2222-2222-222222222222', 13, 2,
 'You join thousands of people marching for climate action! The energy is incredible. A reporter asks you why you are here.',
 'Talk about renewable energy',
 'Talk about protecting forests',
 false),

('a5555555-5555-5555-5555-555555555555', 13, 2,
 'You organize a recycling drive at your school! Students are excited to help. The principal offers to support your initiative.',
 'Ask for solar panels on the roof',
 'Start a composting program',
 false),

('a3333333-3333-3333-3333-333333333333', 13, 3,
 'Your actions inspire others! The city announces a plan to go carbon neutral by 2030. You have made a real difference in fighting climate change!',
 null,
 null,
 true),

('a4444444-4444-4444-4444-444444444444', 13, 3,
 'Your dedication to protecting nature spreads across the community! Local businesses pledge to reduce their carbon footprint. Together, you are creating a sustainable future!',
 null,
 null,
 true);

-- Now update the foreign key references
UPDATE story_nodes 
SET next_node_a_id = 'a2222222-2222-2222-2222-222222222222',
    next_node_b_id = 'a5555555-5555-5555-5555-555555555555'
WHERE id = 'a1111111-1111-1111-1111-111111111111';

UPDATE story_nodes 
SET next_node_a_id = 'a3333333-3333-3333-3333-333333333333',
    next_node_b_id = 'a4444444-4444-4444-4444-444444444444'
WHERE id = 'a2222222-2222-2222-2222-222222222222';

UPDATE story_nodes 
SET next_node_a_id = 'a3333333-3333-3333-3333-333333333333',
    next_node_b_id = 'a4444444-4444-4444-4444-444444444444'
WHERE id = 'a5555555-5555-5555-5555-555555555555';

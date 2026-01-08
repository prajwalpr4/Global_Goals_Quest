-- Insert Story Nodes for SDG 14: Life Below Water
INSERT INTO story_nodes (id, sdg_number, node_order, content, choice_a_text, choice_b_text, is_ending) VALUES
('b1111111-1111-1111-1111-111111111111', 14, 1, 
 'You are a marine biologist diving in the Great Barrier Reef. You notice a large patch of coral that has turned stark white due to rising ocean temperatures. What is your immediate reaction?',
 'Collect samples for research',
 'Document the damage for a report',
 false),
 
('b2222222-2222-2222-2222-222222222222', 14, 2,
 'You collect samples of the resilient coral nearby. Back at the lab, you identify a heat-resistant gene! This could help restore reefs worldwide.',
 'Publish your findings immediately',
 'Start a restoration project',
 false),

('b3333333-3333-3333-3333-333333333333', 14, 2,
 'You take high-resolution photos and write a compelling report. It goes viral on social media, raising massive awareness about ocean warming.',
 'Partner with an NGO',
 'Petition the government',
 false),

('b4444444-4444-4444-4444-444444444444', 14, 3,
 'Your research leads to a global initiative to plant heat-resistant coral! Reefs start to recover, bringing back vibrant marine life. You have saved an ecosystem!',
 null,
 null,
 true),

('b5555555-5555-5555-5555-555555555555', 14, 3,
 'Government leaders take action based on your evidence, passing stricter carbon emission laws to protect the oceans. Your voice turned the tide!',
 null,
 null,
 true);

-- Link SDG 14 Nodes
UPDATE story_nodes 
SET next_node_a_id = 'b2222222-2222-2222-2222-222222222222',
    next_node_b_id = 'b3333333-3333-3333-3333-333333333333'
WHERE id = 'b1111111-1111-1111-1111-111111111111';

UPDATE story_nodes 
SET next_node_a_id = 'b4444444-4444-4444-4444-444444444444',
    next_node_b_id = 'b4444444-4444-4444-4444-444444444444'
WHERE id = 'b2222222-2222-2222-2222-222222222222';

UPDATE story_nodes 
SET next_node_a_id = 'b5555555-5555-5555-5555-555555555555',
    next_node_b_id = 'b5555555-5555-5555-5555-555555555555'
WHERE id = 'b3333333-3333-3333-3333-333333333333';


-- Insert Story Nodes for SDG 15: Life on Land
INSERT INTO story_nodes (id, sdg_number, node_order, content, choice_a_text, choice_b_text, is_ending) VALUES
('c1111111-1111-1111-1111-111111111111', 15, 1, 
 'You are a forest ranger in a protected sanctuary. You stumble upon a group of poachers setting traps for endangered tigers. They havnt seen you yet.',
 'Call for backup quietly',
 'Confront them immediately',
 false),
 
('c2222222-2222-2222-2222-222222222222', 15, 2,
 'You radio for backup and track them from a distance. The authorities arrive and arrest the entire gang without incident. The tigers are safe!',
 'Help relocate the tigers',
 'Set up more camera traps',
 false),

('c3333333-3333-3333-3333-333333333333', 15, 2,
 'You step out and confront them. They are startled and flee, leaving their equipment behind. You managed to stop them today, but they might return.',
 'Secure the area',
 'Track their footprints',
 false),

('c4444444-4444-4444-4444-444444444444', 15, 3,
 'With the poachers gone and new monitoring systems in place, the tiger population begins to thrive. Your vigilance has protected the heart of the forest!',
 null,
 null,
 true),

('c5555555-5555-5555-5555-555555555555', 15, 3,
 'You track them to their hideout and lead the police there later. The ring is dismantled. You are celebrated as a guardian of the wild!',
 null,
 null,
 true);

-- Link SDG 15 Nodes
UPDATE story_nodes 
SET next_node_a_id = 'c2222222-2222-2222-2222-222222222222',
    next_node_b_id = 'c3333333-3333-3333-3333-333333333333'
WHERE id = 'c1111111-1111-1111-1111-111111111111';

UPDATE story_nodes 
SET next_node_a_id = 'c4444444-4444-4444-4444-444444444444',
    next_node_b_id = 'c4444444-4444-4444-4444-444444444444'
WHERE id = 'c2222222-2222-2222-2222-222222222222';

UPDATE story_nodes 
SET next_node_a_id = 'c5555555-5555-5555-5555-555555555555',
    next_node_b_id = 'c5555555-5555-5555-5555-555555555555'
WHERE id = 'c3333333-3333-3333-3333-333333333333';

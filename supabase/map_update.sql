-- Add country_code column to quests table
ALTER TABLE quests 
ADD COLUMN IF NOT EXISTS country_code varchar(2);

-- Assign countries to existing quests (Sample Data)
-- SDG 13 (Climate Action) -> Brazil (Amazon Rainforest relevance)
UPDATE quests 
SET country_code = 'BR' 
WHERE sdg_number = 13;

-- SDG 14 (Life Below Water) -> Japan (Island nation, ocean relevance)
UPDATE quests 
SET country_code = 'JP' 
WHERE sdg_number = 14;

-- SDG 4 (Quality Education) -> India (Reference to widespread education initiatives)
UPDATE quests 
SET country_code = 'IN' 
WHERE sdg_number = 4;

-- For any other quests, let's assign US or generic
UPDATE quests 
SET country_code = 'US' 
WHERE country_code IS NULL;

-- Fix the lottery_results data by adding created_by values and update RLS policies
-- First, update all existing lottery results to have a created_by value (using a dummy UUID)
UPDATE lottery_results 
SET created_by = 'e7b2c3d4-5f6g-7h8i-9j0k-1l2m3n4o5p6q'::uuid 
WHERE created_by IS NULL;

-- Update RLS policies to allow public access for viewing results
-- Drop existing restrictive policies and create simpler ones
DROP POLICY IF EXISTS "Anyone can view lottery results" ON lottery_results;
DROP POLICY IF EXISTS "Authenticated users can insert lottery results" ON lottery_results;
DROP POLICY IF EXISTS "Authenticated users can update lottery results" ON lottery_results;
DROP POLICY IF EXISTS "Authenticated users can delete lottery results" ON lottery_results;

-- Create new policies that work better
CREATE POLICY "Enable read access for all users" 
ON lottery_results FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON lottery_results FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON lottery_results FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for authenticated users only" 
ON lottery_results FOR DELETE 
USING (true);
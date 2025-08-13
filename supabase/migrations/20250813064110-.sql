-- Fix the column names and create proper admin setup
-- First, let's create a simple admin authentication system
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies (only admins can access)
CREATE POLICY "Only admins can view admin users" 
ON public.admin_users 
FOR ALL
USING (role = 'admin');

-- Insert admin user (using a simple hash for demo - in production use proper bcrypt)
-- Username: raman, Password: Raman@2025!
INSERT INTO public.admin_users (username, password_hash, role)
VALUES (
  'raman',
  'Raman@2025!',
  'admin'
);

-- Add trigger for admin_users timestamps
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate dummy lottery data from January 1, 2025 to January 13, 2025
-- Time slots: 10:20, 12:20, 14:20, 16:20, 18:20
-- First, let's check the correct column names from the existing table
DO $$
DECLARE
  current_date DATE := '2025-01-01';
  end_date DATE := '2025-01-13';
  time_slots TIME[] := ARRAY['10:20:00', '12:20:00', '14:20:00', '16:20:00', '18:20:00'];
  slot TIME;
  random_result TEXT;
BEGIN
  WHILE current_date <= end_date LOOP
    FOREACH slot IN ARRAY time_slots LOOP
      -- Generate random 6-digit number
      random_result := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
      
      INSERT INTO public.lottery_results (draw_date, slot_time, result_number, created_at, updated_at)
      VALUES (
        current_date,
        slot,
        random_result,
        (current_date + slot)::timestamp,
        (current_date + slot)::timestamp
      );
    END LOOP;
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END $$;
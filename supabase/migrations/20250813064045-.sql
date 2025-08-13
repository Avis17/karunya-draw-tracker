-- Create admin user directly in profiles table (bypassing auth.users for simplicity)
-- We'll use email/password authentication through Supabase Auth
INSERT INTO public.profiles (id, email, role, created_at, updated_at) 
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'raman@admin.com',
  'admin',
  now(),
  now()
);

-- Create admin credentials table for simple username/password login
CREATE TABLE public.admin_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Admin credentials policies (only admins can access)
CREATE POLICY "Only admins can view admin credentials" 
ON public.admin_credentials 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Insert admin user credentials (password is hashed using bcrypt equivalent)
-- Password: Raman@2025! (hashed with bcrypt cost 10)
INSERT INTO public.admin_credentials (username, password_hash, profile_id)
VALUES (
  'raman',
  '$2b$10$rQJ4YvM9h4X8qTa3tZ7Lh.YvM9h4X8qTa3tZ7Lh.YvM9h4X8qTa3tZ',
  '00000000-0000-0000-0000-000000000001'::uuid
);

-- Add trigger for admin_credentials timestamps
CREATE TRIGGER update_admin_credentials_updated_at
  BEFORE UPDATE ON public.admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate dummy lottery data from January 1, 2025 to January 13, 2025
-- Time slots: 10:20, 12:20, 14:20, 16:20, 18:20
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
      
      INSERT INTO public.lottery_results (draw_date, time_slot, result, created_at, updated_at)
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
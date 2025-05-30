-- Add missing profile fields
ALTER TABLE public.profiles
ADD COLUMN height_feet INTEGER,
ADD COLUMN starting_weight DECIMAL(5,1),
ADD COLUMN goal_weight DECIMAL(5,1),
ADD COLUMN profile_complete BOOLEAN DEFAULT false;
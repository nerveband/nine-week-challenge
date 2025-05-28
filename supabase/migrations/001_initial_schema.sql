-- This file will be run automatically by Supabase when you connect your project
-- No manual setup needed!

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  birthdate DATE,
  height_inches INTEGER,
  location VARCHAR(255),
  profile_photo_url TEXT,
  program_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Body measurements table
CREATE TABLE public.measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number IN (1, 3, 5, 7, 9)),
  hip DECIMAL(5,2),
  waist DECIMAL(5,2),
  chest DECIMAL(5,2),
  chest_2 DECIMAL(5,2),
  thigh DECIMAL(5,2),
  bicep DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Daily tracking table
CREATE TABLE public.daily_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_sleep DECIMAL(3,1),
  ounces_water INTEGER,
  steps INTEGER,
  daily_win TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Meals table
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_tracking_id UUID REFERENCES public.daily_tracking(id) ON DELETE CASCADE,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('meal1', 'meal2', 'meal3', 'snack')),
  meal_time TIME,
  hunger_before INTEGER CHECK (hunger_before >= 1 AND hunger_before <= 10),
  fullness_after INTEGER CHECK (fullness_after >= 1 AND fullness_after <= 10),
  duration_minutes INTEGER,
  distracted BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(daily_tracking_id, meal_type)
);

-- Treats table
CREATE TABLE public.treats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_tracking_id UUID REFERENCES public.daily_tracking(id) ON DELETE CASCADE,
  treat_type VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treats ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only see their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own measurements" ON public.measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own measurements" ON public.measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own measurements" ON public.measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own measurements" ON public.measurements FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tracking" ON public.daily_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tracking" ON public.daily_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracking" ON public.daily_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tracking" ON public.daily_tracking FOR DELETE USING (auth.uid() = user_id);

-- Policies for meals and treats tables
CREATE POLICY "Users can manage own meals" ON public.meals FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.daily_tracking WHERE id = meals.daily_tracking_id)
);

CREATE POLICY "Users can manage own treats" ON public.treats FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.daily_tracking WHERE id = treats.daily_tracking_id)
);

-- Create a function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, program_start_date)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), NOW());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_measurements_user_id ON public.measurements(user_id);
CREATE INDEX idx_daily_tracking_user_id_date ON public.daily_tracking(user_id, date);
CREATE INDEX idx_meals_daily_tracking_id ON public.meals(daily_tracking_id);
CREATE INDEX idx_treats_daily_tracking_id ON public.treats(daily_tracking_id);
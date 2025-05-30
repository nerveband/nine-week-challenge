-- Create photos table for progress tracking
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(20) NOT NULL CHECK (photo_type IN ('front', 'side', 'back', 'progress', 'other')),
  week_number INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_photos_user_id_date ON public.photos(user_id, date DESC);
CREATE INDEX idx_photos_week_number ON public.photos(week_number);

-- Enable Row Level Security
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage own photos" ON public.photos FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT DO NOTHING;

-- Storage policies for photos bucket
CREATE POLICY "Users can upload own photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public access to photos (since they have unguessable URLs)
CREATE POLICY "Public photo access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'photos');
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT,
  notes TEXT,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  source TEXT CHECK (source IN ('manual', 'system')) DEFAULT 'manual',
  system_contact_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_events table
CREATE TABLE IF NOT EXISTS contact_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT CHECK (event_type IN ('birthday', 'anniversary', 'custom')) NOT NULL,
  recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift_ideas table
CREATE TABLE IF NOT EXISTS gift_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('practical', 'emotional', 'fun', 'experience')),
  context TEXT CHECK (context IN ('birthday', 'christmas', 'anniversary', 'random', 'custom')),
  status TEXT CHECK (status IN ('idea', 'bought', 'delivered')) DEFAULT 'idea',
  estimated_budget DECIMAL(10, 2),
  links TEXT[],
  related_event_id UUID REFERENCES contact_events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift_assets table
CREATE TABLE IF NOT EXISTS gift_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_idea_id UUID REFERENCES gift_ideas(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  asset_url TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('image', 'file')) DEFAULT 'image',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  event_id UUID REFERENCES contact_events(id) ON DELETE CASCADE,
  gift_idea_id UUID REFERENCES gift_ideas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_id TEXT,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_profile_id ON contacts(profile_id);
CREATE INDEX IF NOT EXISTS idx_contact_events_contact_id ON contact_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_events_profile_id ON contact_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_contact_events_event_date ON contact_events(event_date);
CREATE INDEX IF NOT EXISTS idx_gift_ideas_contact_id ON gift_ideas(contact_id);
CREATE INDEX IF NOT EXISTS idx_gift_ideas_profile_id ON gift_ideas(profile_id);
CREATE INDEX IF NOT EXISTS idx_gift_ideas_status ON gift_ideas(status);
CREATE INDEX IF NOT EXISTS idx_gift_assets_gift_idea_id ON gift_assets(gift_idea_id);
CREATE INDEX IF NOT EXISTS idx_reminders_profile_id ON reminders(profile_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_events_updated_at BEFORE UPDATE ON contact_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_ideas_updated_at BEFORE UPDATE ON gift_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (
    (auth.uid() = user_id) OR 
    (user_id IS NULL AND id IN (
      SELECT id FROM profiles WHERE user_id IS NULL
    ))
  );

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id) OR (user_id IS NULL)
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (
    (auth.uid() = user_id) OR 
    (user_id IS NULL AND id IN (
      SELECT id FROM profiles WHERE user_id IS NULL
    ))
  );

-- RLS Policies for contacts (profile-based)
CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

-- RLS Policies for contact_events
CREATE POLICY "Users can view their own contact events" ON contact_events
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

CREATE POLICY "Users can manage their own contact events" ON contact_events
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

-- RLS Policies for gift_ideas
CREATE POLICY "Users can view their own gift ideas" ON gift_ideas
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

CREATE POLICY "Users can manage their own gift ideas" ON gift_ideas
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

-- RLS Policies for gift_assets
CREATE POLICY "Users can view their own gift assets" ON gift_assets
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

CREATE POLICY "Users can manage their own gift assets" ON gift_assets
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

-- RLS Policies for reminders
CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

CREATE POLICY "Users can manage their own reminders" ON reminders
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM profiles WHERE 
        (auth.uid() = user_id) OR 
        (user_id IS NULL)
    )
  );

-- Create storage bucket for gift images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gift-images', 'gift-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for gift images
CREATE POLICY "Users can upload their own gift images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gift-images' AND
    auth.role() = 'authenticated' OR 
    auth.role() = 'anon'
  );

CREATE POLICY "Users can view gift images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gift-images');

CREATE POLICY "Users can delete their own gift images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gift-images' AND
    auth.role() = 'authenticated' OR 
    auth.role() = 'anon'
  );


-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Content table
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  genre TEXT,
  year INTEGER,
  duration TEXT,
  rating NUMERIC(3,1) DEFAULT 0,
  type TEXT CHECK (type IN ('movie', 'series', 'interactive')) NOT NULL DEFAULT 'movie',
  is_ai_powered BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content is publicly readable" ON public.content FOR SELECT USING (true);

-- Watchlist
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist" ON public.watchlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add to watchlist" ON public.watchlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from watchlist" ON public.watchlist FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Chat messages (real-time)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chat" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can send chat" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User ratings/reviews
CREATE TABLE public.user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10) NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings" ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Users can rate content" ON public.user_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rating" ON public.user_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rating" ON public.user_ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON public.user_ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Seed content data
INSERT INTO public.content (slug, title, description, image, genre, year, duration, rating, type, is_ai_powered, tags) VALUES
('nexus-chronicles', 'The Nexus Chronicles', 'An AI-powered interactive thriller where YOUR choices shape the story. Experience dynamic storytelling that adapts to your decisions in real-time.', 'nexus-chronicles', 'Sci-Fi Thriller', 2025, '1h 42m', 9.2, 'interactive', true, ARRAY['Interactive', 'AI-Powered', 'Sci-Fi']),
('echoes-eternity', 'Echoes of Eternity', 'Journey through ancient mystical realms where forgotten magic awakens. An epic saga of destiny and sacrifice.', 'echoes-eternity', 'Fantasy Adventure', 2025, '2h 15m', 8.7, 'movie', false, ARRAY['Fantasy', 'Adventure', 'Epic']),
('shadow-protocol', 'Shadow Protocol', 'A covert operative uncovers a conspiracy that threatens the very fabric of global security.', 'shadow-protocol', 'Thriller', 2024, '1h 58m', 8.9, 'movie', false, ARRAY['Thriller', 'Action', 'Espionage']),
('city-of-stars', 'City of Stars', 'Two dreamers find love amidst the dazzling lights of a city that never sleeps.', 'city-of-stars', 'Romance', 2025, '1h 45m', 8.3, 'movie', false, ARRAY['Romance', 'Drama', 'Musical']),
('deep-blue', 'Deep Blue Horizon', 'Descend into the unexplored depths of our oceans and witness life forms beyond imagination.', 'deep-blue', 'Documentary', 2024, '1h 30m', 9.0, 'series', false, ARRAY['Documentary', 'Nature', 'Ocean']),
('the-hollow', 'The Hollow', 'A family moves into a centuries-old mansion, only to discover the darkness that dwells within.', 'the-hollow', 'Horror', 2024, 'Season 1', 8.5, 'series', false, ARRAY['Horror', 'Mystery', 'Supernatural']);

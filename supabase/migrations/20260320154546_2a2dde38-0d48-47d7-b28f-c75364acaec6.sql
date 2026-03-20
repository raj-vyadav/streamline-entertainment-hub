
ALTER TABLE public.watch_parties ADD COLUMN IF NOT EXISTS party_type text NOT NULL DEFAULT 'global';

CREATE TABLE IF NOT EXISTS public.watch_party_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.watch_parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(party_id, user_id)
);

ALTER TABLE public.watch_party_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view party members" ON public.watch_party_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join parties" ON public.watch_party_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave parties" ON public.watch_party_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_members;

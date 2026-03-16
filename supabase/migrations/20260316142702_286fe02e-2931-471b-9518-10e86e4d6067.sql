
CREATE TABLE public.watch_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'scheduled'
);

ALTER TABLE public.watch_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view watch parties" ON public.watch_parties
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert watch parties" ON public.watch_parties
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update watch parties" ON public.watch_parties
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete watch parties" ON public.watch_parties
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_parties;

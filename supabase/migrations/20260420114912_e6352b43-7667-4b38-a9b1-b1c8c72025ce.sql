-- Add party_id column to chat_messages
ALTER TABLE public.chat_messages
ADD COLUMN IF NOT EXISTS party_id UUID REFERENCES public.watch_parties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_chat_messages_party_id ON public.chat_messages(party_id);

-- Drop old broad insert policy and replace with stricter one
DROP POLICY IF EXISTS "Authenticated users can send chat" ON public.chat_messages;

CREATE POLICY "Users can send chat in live parties"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND party_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.watch_parties wp
    WHERE wp.id = chat_messages.party_id
      AND wp.status = 'live'
  )
);
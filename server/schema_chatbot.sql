-- ============================================================================
-- CHARGE & GO AI ASSISTANT SCHEMA MIGRATION
-- Run this script in your Supabase SQL Editor
-- ============================================================================

-- 1. Create chatbot_messages table
CREATE TABLE IF NOT EXISTS public.chatbot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create index on user_id and created_at for fast retrieval
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_user_id ON public.chatbot_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON public.chatbot_messages (created_at ASC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Customers can only select their own messages
CREATE POLICY "Users can view their own chatbot messages"
    ON public.chatbot_messages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. RLS Policies: Customers can insert their own messages
CREATE POLICY "Users can insert their own chatbot messages"
    ON public.chatbot_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 6. RLS Policies: Customers can delete their own chat history
CREATE POLICY "Users can delete their own chatbot messages"
    ON public.chatbot_messages
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7. Grant access to authenticated and service_role
GRANT ALL ON TABLE public.chatbot_messages TO authenticated;
GRANT ALL ON TABLE public.chatbot_messages TO service_role;


-- ============================================
-- Script de réinitialisation complète de la base de données
-- ATTENTION: Ce script supprime TOUTES les données existantes
-- ============================================

-- Step 1: Drop all existing policies first (if tables exist)
-- Using DO block to handle cases where tables don't exist
DO $$
BEGIN
  -- Drop policies for conversations (if table exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
    DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can create their own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
    DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
  END IF;

  -- Drop policies for messages (if table exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
    DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;
  END IF;

  -- Drop policies for memories (if table exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'memories') THEN
    DROP POLICY IF EXISTS "Users can view their own memories" ON memories;
    DROP POLICY IF EXISTS "Users can create their own memories" ON memories;
    DROP POLICY IF EXISTS "Users can update their own memories" ON memories;
    DROP POLICY IF EXISTS "Users can delete their own memories" ON memories;
  END IF;
END $$;

-- Step 2: Drop all existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS memories CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Step 3: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Step 4: Create tables
-- ============================================

-- Conversations table
-- Note: user_id is TEXT to store the UUID as string (from auth.users.id)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('preference', 'objectif', 'connaissance', 'autre')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Step 5: Create indexes for performance
-- ============================================

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

-- ============================================
-- Step 6: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 7: Create RLS Policies
-- ============================================

-- Policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (auth.uid()::text = user_id);

-- Policies for messages
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()::text
    )
  );

-- Policies for memories
CREATE POLICY "Users can view their own memories" ON memories
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own memories" ON memories
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own memories" ON memories
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own memories" ON memories
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================
-- Script terminé !
-- ============================================
-- Note: La table auth.users est gérée automatiquement par Supabase Auth
-- Vous n'avez pas besoin de la créer manuellement.
-- Les utilisateurs seront créés via supabase.auth.signUp() dans votre application.
-- ============================================


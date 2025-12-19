import { supabase, createServerClient } from './supabase';
import type { Message, Memory, Conversation, Quiz } from './db.types';

// Get the appropriate Supabase client based on environment
// Server-side: use service role client (bypasses RLS)
// Client-side: use anon client (respects RLS)
const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: use service role client
    try {
      return createServerClient();
    } catch (error) {
      console.error('Failed to create Supabase server client:', error);
      return null;
    }
  }
  // Client-side: use anon client
  return supabase;
};

// Get or create a user ID (for POC, we'll use a simple localStorage-based approach)
export function getUserId(): string {
  if (typeof window === 'undefined') return 'default-user';
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
}

// Messages
export async function saveMessage(message: Omit<Message, 'id' | 'created_at'>) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }
  const { data, error } = await client
    .from('messages')
    .insert({
      ...message,
      tool_calls: message.tool_calls as any, // Ensure tool_calls is treated as JSONB
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    throw error;
  }
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available');
    return [];
  }
  const { data, error } = await client
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  // Ensure tool_calls are correctly typed as ToolCall[]
  return data.map((msg: any) => ({
    ...msg,
    tool_calls: msg.tool_calls as any,
  })) || [];
}

// Memories
export async function saveMemory(memory: Omit<Memory, 'id' | 'created_at'>) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }
  const { data, error } = await client
    .from('memories')
    .insert({
      ...memory,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving memory:', error);
    throw error;
  }
  return data;
}

export async function getMemories(userId: string): Promise<Memory[]> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available');
    return [];
  }
  const { data, error } = await client
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
  return data || [];
}

// Conversations
export async function createConversation(userId: string): Promise<Conversation> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }
  const { data, error } = await client
    .from('conversations')
    .insert({
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
  return data;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available');
    return [];
  }
  const { data, error } = await client
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
  return data || [];
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase client not available');
    return null;
  }
  const { data, error } = await client
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching conversation:', error);
    throw error;
  }
  return data;
}

export async function updateConversation(conversationId: string) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }
  const { error } = await client
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}


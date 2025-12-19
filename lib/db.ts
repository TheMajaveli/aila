import { supabase, createServerClient } from './supabase';
import type { Message, Memory, Conversation, Quiz } from './db.types';

// Helper function to get the correct Supabase client based on environment
// Server-side: use service role client (bypasses RLS)
// Client-side: use anonymous client (respects RLS)
const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: use service role client to bypass RLS
    try {
      return createServerClient();
    } catch (error) {
      console.error('Failed to create Supabase server client:', error);
      return null;
    }
  }
  // Client-side: use anonymous client (respects RLS)
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
  // Ensure tool_calls is properly serialized as JSONB
  const messageToSave: any = {
    ...message,
    created_at: new Date().toISOString(),
  };
  
  // Handle tool_calls: ensure it's properly formatted for JSONB
  if (message.tool_calls && Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
    // Ensure each tool call has all required fields
    messageToSave.tool_calls = message.tool_calls.map((tc: any) => ({
      id: tc.id || `tool-${Date.now()}-${Math.random()}`,
      name: tc.name || 'unknown',
      arguments: tc.arguments || {},
      result: tc.result || null,
    }));
  } else {
    // Use null instead of undefined for empty tool_calls (Supabase prefers null)
    messageToSave.tool_calls = null;
  }
  
  console.log('💾 Saving message to DB:', {
    role: messageToSave.role,
    contentLength: messageToSave.content?.length || 0,
    hasToolCalls: !!messageToSave.tool_calls,
    toolCallsCount: messageToSave.tool_calls?.length || 0,
    toolCallsNames: messageToSave.tool_calls?.map((tc: any) => tc.name) || [],
  });
  
  const { data, error } = await supabase
    .from('messages')
    .insert(messageToSave)
    .select()
    .single();

  if (error) {
    console.error('❌ Error saving message:', error, {
      message: messageToSave,
      toolCalls: messageToSave.tool_calls,
      toolCallsType: typeof messageToSave.tool_calls,
      toolCallsIsArray: Array.isArray(messageToSave.tool_calls),
    });
    throw error;
  }
  
  console.log('✅ Message saved successfully:', {
    id: data.id,
    role: data.role,
    hasToolCalls: !!data.tool_calls,
    toolCallsCount: data.tool_calls?.length || 0,
    toolCallsType: typeof data.tool_calls,
  });
  
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading messages:', error);
    throw error;
  }
  
  // Ensure tool_calls is properly parsed (Supabase should handle this automatically)
  const messages = (data || []).map((msg: any) => {
    let toolCalls = null;
    
    if (msg.tool_calls) {
      if (typeof msg.tool_calls === 'string') {
        // If it's a string, parse it
        try {
          toolCalls = JSON.parse(msg.tool_calls);
        } catch (e) {
          console.error('Error parsing tool_calls JSON:', e, { tool_calls: msg.tool_calls });
          toolCalls = null;
        }
      } else if (Array.isArray(msg.tool_calls)) {
        // Already an array, use as-is
        toolCalls = msg.tool_calls;
      } else if (typeof msg.tool_calls === 'object') {
        // If it's an object, try to convert to array
        toolCalls = [msg.tool_calls];
      }
    }
    
    return {
      ...msg,
      tool_calls: toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0 
        ? toolCalls 
        : undefined,
    };
  });
  
  const messagesWithToolCalls = messages.filter((m: any) => 
    m.tool_calls && Array.isArray(m.tool_calls) && m.tool_calls.length > 0
  );
  
  console.log('📥 Loaded messages from DB:', {
    conversationId,
    messageCount: messages.length,
    messagesWithToolCalls: messagesWithToolCalls.length,
    toolCallsDetails: messagesWithToolCalls.map((m: any) => ({
      messageId: m.id,
      role: m.role,
      toolCalls: m.tool_calls.map((tc: any) => ({
        name: tc.name,
        hasResult: !!tc.result,
      })),
    })),
  });
  
  return messages;
}

// Memories
export async function saveMemory(memory: Omit<Memory, 'id' | 'created_at'>) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }
  
  console.log('💾 Saving memory to DB:', {
    userId: memory.user_id,
    type: memory.type,
    contentLength: memory.content.length,
    isServerSide: typeof window === 'undefined',
  });
  
  const { data, error } = await client
    .from('memories')
    .insert({
      ...memory,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error saving memory:', error, {
      memory,
      isServerSide: typeof window === 'undefined',
    });
    throw error;
  }
  
  console.log('✅ Memory saved successfully:', {
    id: data.id,
    userId: data.user_id,
    type: data.type,
  });
  
  return data;
}

export async function getMemories(userId: string): Promise<Memory[]> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not available');
  }
  
  const { data, error } = await client
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading memories:', error, {
      userId,
      isServerSide: typeof window === 'undefined',
    });
    throw error;
  }
  
  console.log('📥 Loaded memories from DB:', {
    userId,
    count: data?.length || 0,
    isServerSide: typeof window === 'undefined',
  });
  
  return data || [];
}

// Conversations
export async function createConversation(userId: string): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function updateConversation(conversationId: string) {
  const { error } = await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) throw error;
}


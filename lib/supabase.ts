import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Handle token refresh errors gracefully
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : null as any; // Will throw error if used without env vars

// Helper function to safely get session with error handling
export async function getSessionSafely() {
  if (!supabase) return { session: null, error: null };
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    // If token refresh error, sign out
    if (error && (error.message?.includes('refresh') || error.message?.includes('token') || error.message?.includes('Invalid Refresh Token'))) {
      console.warn('Token refresh error detected, signing out:', error.message);
      await supabase.auth.signOut();
      return { session: null, error: null };
    }
    
    return { session: data.session, error };
  } catch (err: any) {
    console.error('Error getting session:', err);
    if (err?.message?.includes('refresh') || err?.message?.includes('token')) {
      await supabase.auth.signOut().catch(console.error);
    }
    return { session: null, error: err };
  }
}

// Server-side client with service role key
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not configured. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}


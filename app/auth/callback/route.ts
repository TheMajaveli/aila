import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        // Successfully confirmed email, redirect to home
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    }
  }

  // If there's an error or no code, redirect to home with error
  return NextResponse.redirect(new URL('/?error=email_confirmation_failed', requestUrl.origin));
}


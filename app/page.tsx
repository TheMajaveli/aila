'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Chat } from '@/components/Chat';
import { Auth } from '@/components/Auth';
import type { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }: { data: { session: any }, error?: any }) => {
        if (error) {
          console.error('Error getting session:', error);
          // If token is invalid, sign out
          if (error.message?.includes('refresh') || error.message?.includes('token')) {
            supabase.auth.signOut().catch(console.error);
          }
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch((error: any) => {
        console.error('Error in getSession:', error);
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      // Handle errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        // Token refresh failed, sign out
        await supabase.auth.signOut();
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    supabase.auth.getSession()
      .then(({ data: { session }, error }: { data: { session: any }, error?: any }) => {
        if (error) {
          console.error('Error getting session after auth:', error);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      })
      .catch((error: any) => {
        console.error('Error in handleAuthSuccess:', error);
        setUser(null);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  // Check if user exists but email is not confirmed
  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 shadow-xl text-center">
            <h1 className="text-2xl font-semibold text-white mb-4">
              Email non confirmé
            </h1>
            <p className="text-gray-400 mb-6">
              Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation dans l&apos;email que nous vous avons envoyé.
            </p>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <main className="min-h-screen">
      <Chat />
    </main>
  );
}


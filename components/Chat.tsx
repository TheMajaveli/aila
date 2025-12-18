'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { ChatMessage } from './ChatMessage';
import { getUserId, createConversation, saveMessage, getMessages, updateConversation, getConversations } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/lib/db.types';
import type { User } from '@supabase/supabase-js';

export function Chat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get authenticated user
  useEffect(() => {
    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
      }
    };
    initUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
      } else {
        setUser(null);
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: '/api/chat',
    body: {
      conversationId,
      userId: userId || '',
    },
    onFinish: async (message) => {
      // Save assistant message
      if (conversationId) {
        await saveMessage({
          conversation_id: conversationId,
          role: 'assistant',
          content: message.content,
          tool_calls: message.toolInvocations?.filter((tool): tool is typeof tool & { state: 'result' } => 
            'state' in tool && tool.state === 'result'
          ).map(tool => ({
            id: tool.toolCallId,
            name: tool.toolName,
            arguments: tool.args,
            result: tool.result,
          })),
        });
        await updateConversation(conversationId);
      }
    },
  });

  const handleQuizAnswer = async (quizId: string, selectedIndex: number, isCorrect: boolean, quiz: any) => {
    if (!conversationId) return;
    
    const selectedOption = quiz.options[selectedIndex];
    const answerMessage = `J'ai répondu "${selectedOption}" ${isCorrect ? '(correct)' : '(incorrect)'} au quiz sur ${quiz.subject}.`;
    
    // Save user answer to conversation
    try {
      await saveMessage({
        conversation_id: conversationId,
        role: 'user',
        content: answerMessage,
      });
      
      // Send answer to AI for feedback
      await append({
        role: 'user',
        content: answerMessage,
      });
    } catch (error) {
      console.error('Error saving quiz answer:', error);
    }
  };

  // Load conversations list
  useEffect(() => {
    if (!userId) return;
    const loadConversations = async () => {
      try {
        const convs = await getConversations(userId);
        setConversations(convs);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    loadConversations();
  }, [userId, conversationId]);

  // Initialize conversation - load from localStorage or create new
  useEffect(() => {
    if (!userId) return;
    
    const initConversation = async () => {
      try {
        // Try to load conversationId from localStorage
        const savedConversationId = localStorage.getItem(`conversationId_${userId}`);
        
        if (savedConversationId) {
          // Load existing conversation
          const existingMessages = await getMessages(savedConversationId);
          if (existingMessages.length > 0) {
            setConversationId(savedConversationId);
            setMessages(existingMessages.map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              toolInvocations: msg.tool_calls?.map(tc => ({
                toolCallId: tc.id,
                toolName: tc.name,
                args: tc.arguments,
                result: tc.result,
                state: 'result' as const,
              })),
            })) as any);
            return;
          }
        }
        
        // Create new conversation if none exists
        if (!conversationId && userId) {
          const conv = await createConversation(userId);
          setConversationId(conv.id);
          localStorage.setItem(`conversationId_${userId}`, conv.id);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      }
    };
    initConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Load a specific conversation
  const loadConversation = async (convId: string) => {
    if (!userId) return;
    try {
      setIsLoadingConversation(true);
      const existingMessages = await getMessages(convId);
      setConversationId(convId);
      localStorage.setItem(`conversationId_${userId}`, convId);
      setMessages(existingMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        toolInvocations: msg.tool_calls?.map(tc => ({
          toolCallId: tc.id,
          toolName: tc.name,
          args: tc.arguments,
          result: tc.result,
          state: 'result' as const,
        })),
      })) as any);
      setShowConversationList(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  // Create new conversation
  const createNewConversation = async () => {
    if (!userId) return;
    try {
      const conv = await createConversation(userId);
      setConversationId(conv.id);
      localStorage.setItem(`conversationId_${userId}`, conv.id);
      setMessages([]);
      setShowConversationList(false);
      // Reload conversations list
      const convs = await getConversations(userId);
      setConversations(convs);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserId(null);
    setConversationId(null);
    setMessages([]);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
    
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      try {
        const conv = await createConversation(userId);
        currentConversationId = conv.id;
        setConversationId(conv.id);
        localStorage.setItem(`conversationId_${userId}`, conv.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
        return;
      }
    }

    const userMessage = input.trim();
    if (!userMessage) return;

    // Save user message
    try {
      await saveMessage({
        conversation_id: currentConversationId,
        role: 'user',
        content: userMessage,
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }

    handleSubmit(e);
  };

  // Show loading state if user is not yet loaded
  if (!userId) {
    return (
      <div className="flex flex-col h-screen bg-[#0a0a0a] items-center justify-center">
        <div className="text-gray-400">Chargement de votre session...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-[#111111] border-b border-[#1f1f1f] px-6 py-5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1.5 tracking-tight">
              Assistant d&apos;Apprentissage
            </h1>
            <p className="text-sm text-gray-400 font-light">
              Posez vos questions, demandez des quiz ou créez des cartes mémoire
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConversationList(!showConversationList)}
              className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-sm text-gray-300 hover:bg-[#1a1a1a] transition-all"
            >
              {showConversationList ? 'Masquer' : 'Conversations'}
            </button>
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-sm text-gray-300 hover:bg-[#1a1a1a] transition-all"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Conversation List */}
        {showConversationList && (
          <div className="mt-4 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Conversations précédentes</h3>
              <button
                onClick={createNewConversation}
                className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-all"
              >
                Nouvelle
              </button>
            </div>
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune conversation</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      conv.id === conversationId
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-[#111111] text-gray-300 border border-[#1f1f1f] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">
                        {conv.title || `Conversation du ${new Date(conv.created_at).toLocaleDateString('fr-FR')}`}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(conv.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-white tracking-tight">
              Bienvenue
            </h2>
            <p className="mb-8 text-gray-400 font-light text-base">
              Je suis votre assistant d&apos;apprentissage. Voici quelques exemples de ce que vous pouvez me demander :
            </p>
            <div className="space-y-3 text-left bg-[#111111] rounded-xl p-6 border border-[#1f1f1f] backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-medium mt-0.5">•</span>
                <span className="text-gray-300 font-light">&quot;Fais-moi un quiz sur React&quot;</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-medium mt-0.5">•</span>
                <span className="text-gray-300 font-light">&quot;Je prépare un concours et j&apos;ai du mal avec les probabilités&quot;</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-medium mt-0.5">•</span>
                <span className="text-gray-300 font-light">&quot;Crée une carte mémoire pour la formule E=mc²&quot;</span>
              </div>
            </div>
          </div>
        )}
        
        {messages
          .filter((msg): msg is typeof msg & { role: 'user' | 'assistant' | 'system' } => 
            msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system'
          )
          .map((message) => (
          <ChatMessage
            key={message.id}
            message={{
              id: message.id,
              conversation_id: conversationId || '',
              role: message.role as 'user' | 'assistant' | 'system',
              content: message.content,
              tool_calls: message.toolInvocations
                ?.filter((tool): tool is typeof tool & { state: 'result' } => 
                  'state' in tool && tool.state === 'result'
                )
                .map(tool => ({
                  id: tool.toolCallId,
                  name: tool.toolName,
                  arguments: tool.args,
                  result: tool.result,
                })),
              created_at: new Date().toISOString(),
            }}
            onQuizAnswer={handleQuizAnswer}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#111111] rounded-xl px-4 py-3 border border-[#1f1f1f]">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#111111] border-t border-[#1f1f1f] px-6 py-4 backdrop-blur-xl">
        <form onSubmit={onSubmit} className="flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-gray-500 text-sm font-light transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}


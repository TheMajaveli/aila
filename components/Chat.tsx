'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { ChatMessage } from './ChatMessage';
import { getUserId, createConversation, saveMessage, getMessages, updateConversation } from '@/lib/db';
import type { Message } from '@/lib/db.types';

export function Chat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = getUserId();

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: '/api/chat',
    body: {
      conversationId,
      userId,
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

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      if (!conversationId) {
        try {
          const conv = await createConversation(userId);
          setConversationId(conv.id);
          
          // Load existing messages if any
          const existingMessages = await getMessages(conv.id);
          if (existingMessages.length > 0) {
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
          }
        } catch (error) {
          console.error('Error initializing conversation:', error);
        }
      }
    };
    initConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      try {
        const conv = await createConversation(userId);
        currentConversationId = conv.id;
        setConversationId(conv.id);
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
          Assistant d&apos;Apprentissage
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Posez vos questions, demandez des quiz ou créez des cartes mémoire
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-300 mt-12 max-w-2xl mx-auto">
            <h2 className="text-xl font-medium mb-3 text-gray-900 dark:text-white">
              Bienvenue
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Je suis votre assistant d&apos;apprentissage. Voici quelques exemples de ce que vous pouvez me demander :
            </p>
            <div className="space-y-3 text-left bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-semibold mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300">&quot;Fais-moi un quiz sur React&quot;</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-semibold mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300">&quot;Je prépare un concours et j&apos;ai du mal avec les probabilités&quot;</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-semibold mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300">&quot;Crée une carte mémoire pour la formule E=mc²&quot;</span>
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
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <form onSubmit={onSubmit} className="flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-sm"
          >
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}


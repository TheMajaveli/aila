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

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
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
          tool_calls: message.toolInvocations?.map(tool => ({
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
              })),
            })));
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          🤖 Assistant d'Apprentissage
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Posez vos questions, demandez des quiz ou créez des cartes mémoire
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-lg mb-2">👋 Bonjour !</p>
            <p>Je suis votre assistant d'apprentissage. Essayez de me demander :</p>
            <ul className="mt-4 space-y-2 text-left max-w-md mx-auto">
              <li>• "Fais-moi un quiz sur React"</li>
              <li>• "Je prépare un concours et j'ai du mal avec les probabilités"</li>
              <li>• "Crée une carte mémoire pour la formule E=mc²"</li>
            </ul>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={{
              id: message.id,
              conversation_id: conversationId || '',
              role: message.role,
              content: message.content,
              tool_calls: message.toolInvocations?.map(tool => ({
                id: tool.toolCallId,
                name: tool.toolName,
                arguments: tool.args,
                result: tool.result,
              })),
              created_at: new Date().toISOString(),
            }}
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
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}


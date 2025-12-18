'use client';

import { Message } from '@/lib/db.types';
import { QuizCard } from './QuizCard';
import { MemoryCard } from './MemoryCard';
import { FlashcardCard } from './FlashcardCard';

interface ChatMessageProps {
  message: Message;
  onQuizAnswer?: (quizId: string, selectedIndex: number, isCorrect: boolean, quiz: any) => void;
}

export function ChatMessage({ message, onQuizAnswer }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Check if message contains tool calls
  const toolCalls = message.tool_calls || [];
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
        isUser 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm'
      }`}>
        {message.content && (
          <div className="whitespace-pre-wrap mb-2 text-sm leading-relaxed">{message.content}</div>
        )}
        
        {/* Render tool call results */}
        {toolCalls.map((toolCall) => {
          if (toolCall.name === 'generate_quiz' && toolCall.result) {
            return (
              <QuizCard
                key={toolCall.id}
                quiz={toolCall.result}
                onAnswer={(quizId, selectedIndex, isCorrect) => {
                  if (onQuizAnswer) {
                    onQuizAnswer(quizId, selectedIndex, isCorrect, toolCall.result);
                  }
                }}
              />
            );
          }
          if (toolCall.name === 'add_memory' && toolCall.result) {
            return (
              <MemoryCard
                key={toolCall.id}
                memory={toolCall.result}
              />
            );
          }
          if (toolCall.name === 'create_flashcard' && toolCall.result) {
            return (
              <FlashcardCard
                key={toolCall.id}
                flashcard={toolCall.result}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}


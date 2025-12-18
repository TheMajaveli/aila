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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
      }`}>
        {message.content && (
          <div className="whitespace-pre-wrap mb-2">{message.content}</div>
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


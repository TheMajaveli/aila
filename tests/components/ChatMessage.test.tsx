import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '@/components/ChatMessage';
import type { Message } from '@/lib/db.types';

describe('ChatMessage', () => {
  it('affiche un message utilisateur', () => {
    const userMessage: Message = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      role: 'user',
      content: 'Bonjour',
      created_at: new Date().toISOString(),
    };

    render(<ChatMessage message={userMessage} />);
    
    expect(screen.getByText('Bonjour')).toBeInTheDocument();
  });

  it('affiche un message assistant', () => {
    const assistantMessage: Message = {
      id: 'msg-2',
      conversation_id: 'conv-1',
      role: 'assistant',
      content: 'Bonjour ! Comment puis-je vous aider?',
      created_at: new Date().toISOString(),
    };

    render(<ChatMessage message={assistantMessage} />);
    
    expect(screen.getByText('Bonjour ! Comment puis-je vous aider?')).toBeInTheDocument();
  });

  it('affiche un QuizCard quand un tool call generate_quiz est présent', () => {
    const messageWithQuiz: Message = {
      id: 'msg-3',
      conversation_id: 'conv-1',
      role: 'assistant',
      content: 'Voici un quiz',
      tool_calls: [
        {
          id: 'tool-1',
          name: 'generate_quiz',
          arguments: {},
          result: {
            id: 'quiz-1',
            subject: 'React',
            difficulty: 'easy',
            question: 'Test?',
            options: ['A', 'B', 'C', 'D'],
            correct_answer: 0,
          },
        },
      ],
      created_at: new Date().toISOString(),
    };

    render(<ChatMessage message={messageWithQuiz} />);
    
    expect(screen.getByText('Quiz: React')).toBeInTheDocument();
  });
});


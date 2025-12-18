import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizCard } from '@/components/QuizCard';
import type { Quiz } from '@/lib/db.types';

const mockQuiz: Quiz = {
  id: 'quiz-1',
  subject: 'React',
  difficulty: 'medium',
  question: 'Qu\'est-ce que React?',
  options: [
    'Une bibliothèque JavaScript',
    'Un framework backend',
    'Un langage de programmation',
    'Une base de données',
  ],
  correct_answer: 0,
  explanation: 'React est une bibliothèque JavaScript pour construire des interfaces utilisateur.',
};

describe('QuizCard', () => {
  it('affiche la question et les options', () => {
    render(<QuizCard quiz={mockQuiz} />);
    
    expect(screen.getByText('📚 Quiz: React')).toBeInTheDocument();
    expect(screen.getByText('Qu\'est-ce que React?')).toBeInTheDocument();
    expect(screen.getByText('Une bibliothèque JavaScript')).toBeInTheDocument();
  });

  it('affiche la difficulté', () => {
    render(<QuizCard quiz={mockQuiz} />);
    
    expect(screen.getByText('Moyen')).toBeInTheDocument();
  });

  it('permet de sélectionner une réponse', () => {
    render(<QuizCard quiz={mockQuiz} />);
    
    const optionButton = screen.getByText('Une bibliothèque JavaScript');
    fireEvent.click(optionButton);
    
    // Après le clic, le résultat doit être affiché
    expect(screen.getByText(/Correct|Incorrect/)).toBeInTheDocument();
  });

  it('affiche le feedback correct pour la bonne réponse', () => {
    render(<QuizCard quiz={mockQuiz} />);
    
    const correctButton = screen.getByText('Une bibliothèque JavaScript');
    fireEvent.click(correctButton);
    
    expect(screen.getByText('✅ Correct !')).toBeInTheDocument();
  });

  it('affiche le feedback incorrect pour la mauvaise réponse', () => {
    render(<QuizCard quiz={mockQuiz} />);
    
    const wrongButton = screen.getByText('Un framework backend');
    fireEvent.click(wrongButton);
    
    expect(screen.getByText('❌ Incorrect')).toBeInTheDocument();
  });

  it('désactive les boutons après sélection', () => {
    render(<QuizCard quiz={mockQuiz} />);
    
    const optionButton = screen.getByText('Une bibliothèque JavaScript');
    fireEvent.click(optionButton);
    
    // Les boutons doivent être désactivés
    const allButtons = screen.getAllByRole('button');
    allButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('affiche l\'explication après sélection', () => {
    render(<QuizCard quiz={mockQuiz} />);
    
    const optionButton = screen.getByText('Une bibliothèque JavaScript');
    fireEvent.click(optionButton);
    
    expect(screen.getByText(mockQuiz.explanation!)).toBeInTheDocument();
  });
});


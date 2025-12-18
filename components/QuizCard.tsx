'use client';

import { useState } from 'react';
import type { Quiz } from '@/lib/db.types';

interface QuizCardProps {
  quiz: Quiz;
  onAnswer?: (quizId: string, selectedIndex: number, isCorrect: boolean) => void;
}

export function QuizCard({ quiz, onAnswer }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const isCorrect = index === quiz.correct_answer;
    if (onAnswer) {
      onAnswer(quiz.id, index, isCorrect);
    }
  };

  const isCorrect = selectedAnswer === quiz.correct_answer;
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    hard: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
          📚 Quiz: {quiz.subject}
        </h3>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${difficultyColors[quiz.difficulty]}`}>
          {quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
        </span>
      </div>
      
      <p className="text-gray-800 dark:text-gray-200 mb-4 font-medium">
        {quiz.question}
      </p>
      
      <div className="space-y-2">
        {quiz.options.map((option, index) => {
          let buttonClass = "w-full text-left p-3 rounded-lg border-2 transition-all ";
          
          if (showResult) {
            if (index === quiz.correct_answer) {
              buttonClass += "bg-green-500 text-white border-green-600 font-semibold";
            } else if (index === selectedAnswer && index !== quiz.correct_answer) {
              buttonClass += "bg-red-500 text-white border-red-600";
            } else {
              buttonClass += "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600";
            }
          } else {
            buttonClass += "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-400 cursor-pointer";
          }
          
          return (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={showResult}
              className={buttonClass}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          );
        })}
      </div>
      
      {showResult && (
        <div className={`mt-4 p-3 rounded-lg ${
          isCorrect 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`font-semibold mb-1 ${
            isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
          }`}>
            {isCorrect ? '✅ Correct !' : '❌ Incorrect'}
          </p>
          {quiz.explanation && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {quiz.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}


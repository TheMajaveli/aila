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
    easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="mt-3 p-5 bg-[#111111] rounded-xl border border-[#1f1f1f] shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f1f1f]">
        <div>
          <h3 className="font-semibold text-base text-white mb-1 tracking-tight">
            Quiz: {quiz.subject}
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${difficultyColors[quiz.difficulty]}`}>
          {quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
        </span>
      </div>
      
      <p className="text-gray-200 mb-5 font-light text-sm leading-relaxed">
        {quiz.question}
      </p>
      
      <div className="space-y-2">
        {quiz.options.map((option, index) => {
          let buttonClass = "w-full text-left p-3.5 rounded-lg border transition-all text-sm ";
          
          if (showResult) {
            if (index === quiz.correct_answer) {
              buttonClass += "bg-green-500/20 text-green-400 border-green-500/50 font-medium";
            } else if (index === selectedAnswer && index !== quiz.correct_answer) {
              buttonClass += "bg-red-500/20 text-red-400 border-red-500/50";
            } else {
              buttonClass += "bg-[#0a0a0a] text-gray-500 border-[#1f1f1f]";
            }
          } else {
            buttonClass += "bg-[#0a0a0a] text-gray-200 border-[#1f1f1f] hover:bg-[#111111] hover:border-blue-500/50 cursor-pointer transition-all";
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
        <div className={`mt-5 p-4 rounded-xl border ${
          isCorrect 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <p className={`font-semibold mb-2 text-sm ${
            isCorrect ? 'text-green-400' : 'text-red-400'
          }`}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </p>
          {quiz.explanation && (
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              {quiz.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}


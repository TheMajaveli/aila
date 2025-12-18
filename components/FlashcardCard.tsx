'use client';

import { useState } from 'react';

interface FlashcardCardProps {
  flashcard: {
    id: string;
    front: string;
    back: string;
    category: string;
  };
}

export function FlashcardCard({ flashcard }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="mt-3">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">
        Carte mémoire • {flashcard.category}
      </div>
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full h-48 cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        <div
          className="absolute inset-0 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-lg transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex items-center justify-center shadow-md"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="text-center w-full">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide font-medium">Question</div>
              <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
                {flashcard.front}
              </p>
              <div className="mt-5 text-xs text-gray-400 dark:text-gray-500">
                Cliquez pour retourner
              </div>
            </div>
          </div>
          
          {/* Back */}
          <div
            className="absolute inset-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex items-center justify-center shadow-md"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center w-full">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide font-medium">Réponse</div>
              <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
                {flashcard.back}
              </p>
              <div className="mt-5 text-xs text-gray-400 dark:text-gray-500">
                Cliquez pour retourner
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


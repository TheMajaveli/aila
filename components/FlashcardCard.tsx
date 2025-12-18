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
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        📇 Carte mémoire • {flashcard.category}
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
            className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-6 flex items-center justify-center"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Question</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {flashcard.front}
              </p>
              <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                Cliquez pour retourner
              </div>
            </div>
          </div>
          
          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-6 flex items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Réponse</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {flashcard.back}
              </p>
              <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                Cliquez pour retourner
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


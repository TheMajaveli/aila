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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="mt-4">
      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1f1f1f] to-transparent"></div>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider px-3 py-1 rounded-full bg-[#111111] border border-[#1f1f1f]">
          {flashcard.category}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1f1f1f] to-transparent"></div>
      </div>

      {/* Flashcard Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-3/4 mx-auto h-64 cursor-pointer group"
        style={{ perspective: '1200px' }}
      >
        <div
          className="absolute inset-0 rounded-2xl transition-all duration-500 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#111111] via-[#0f0f0f] to-[#111111] border border-[#1f1f1f] p-8 flex items-center justify-center shadow-2xl backdrop-blur-xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              boxShadow: isHovered
                ? '0 20px 40px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                : '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="text-center w-full space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60"></div>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Question</span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60"></div>
              </div>
              <p className="text-lg font-light text-white leading-relaxed px-4">
                {flashcard.front}
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Cliquez pour retourner</span>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#111111] via-[#0f0f0f] to-[#111111] border border-[#1f1f1f] p-8 flex items-center justify-center shadow-2xl backdrop-blur-xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: isHovered
                ? '0 20px 40px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                : '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="text-center w-full space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400/60"></div>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Réponse</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400/60"></div>
              </div>
              <p className="text-lg font-light text-white leading-relaxed px-4">
                {flashcard.back}
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Cliquez pour retourner</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flip Indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

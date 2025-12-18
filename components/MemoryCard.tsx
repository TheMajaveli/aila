'use client';

interface MemoryCardProps {
  memory: {
    success: boolean;
    memory_id: string;
    content: string;
    type: 'preference' | 'objectif' | 'connaissance' | 'autre';
  };
}

const typeLabels = {
  preference: 'Préférence',
  objectif: 'Objectif',
  connaissance: 'Connaissance',
  autre: 'Autre',
};

const typeIcons = {
  preference: '⭐',
  objectif: '🎯',
  connaissance: '🧠',
  autre: '📝',
};

const typeColors = {
  preference: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800',
  objectif: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800',
  connaissance: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800',
  autre: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
};

export function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <div className={`mt-3 p-3 rounded-lg border-2 ${typeColors[memory.type]} shadow-sm`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">💾</span>
        <span className="font-semibold text-sm">
          Mémoire enregistrée ({typeIcons[memory.type]} {typeLabels[memory.type]})
        </span>
      </div>
      <p className="text-sm opacity-90 italic">
        &quot;{memory.content}&quot;
      </p>
    </div>
  );
}


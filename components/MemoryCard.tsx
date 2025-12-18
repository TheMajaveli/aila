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

// Removed icons for cleaner UI

const typeColors = {
  preference: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  objectif: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  connaissance: 'bg-green-500/20 text-green-400 border-green-500/30',
  autre: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <div className={`mt-3 p-4 rounded-xl border ${typeColors[memory.type]} shadow-lg backdrop-blur-xl`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm uppercase tracking-wider">
          Mémoire enregistrée
        </span>
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-[#0a0a0a]/50">
          {typeLabels[memory.type]}
        </span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed font-light">
        {memory.content}
      </p>
    </div>
  );
}


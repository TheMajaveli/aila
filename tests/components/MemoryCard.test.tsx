import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryCard } from '@/components/MemoryCard';

const mockMemory = {
  success: true,
  memory_id: 'mem-1',
  content: 'Je prépare un concours et j\'ai du mal avec les probabilités',
  type: 'objectif' as const,
};

describe('MemoryCard', () => {
  it('affiche le contenu de la mémoire', () => {
    render(<MemoryCard memory={mockMemory} />);
    
    expect(screen.getByText(/Mémoire enregistrée/)).toBeInTheDocument();
    expect(screen.getByText(mockMemory.content)).toBeInTheDocument();
  });

  it('affiche le type de mémoire correctement', () => {
    render(<MemoryCard memory={mockMemory} />);
    
    expect(screen.getByText(/Objectif/)).toBeInTheDocument();
  });

  it('affiche le badge de type de mémoire', () => {
    render(<MemoryCard memory={mockMemory} />);
    
    expect(screen.getByText('Mémoire enregistrée')).toBeInTheDocument();
    expect(screen.getByText('Objectif')).toBeInTheDocument();
  });

  it('affiche différents types de mémoire', () => {
    const preferenceMemory = { ...mockMemory, type: 'preference' as const };
    const { rerender } = render(<MemoryCard memory={preferenceMemory} />);
    
    expect(screen.getByText(/Préférence/)).toBeInTheDocument();
    
    rerender(<MemoryCard memory={{ ...mockMemory, type: 'connaissance' as const }} />);
    expect(screen.getByText(/Connaissance/)).toBeInTheDocument();
  });
});


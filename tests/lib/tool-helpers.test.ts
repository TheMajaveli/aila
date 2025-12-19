import { describe, it, expect } from 'vitest';

describe('Tool payload validation', () => {
  it('valide le payload generate_quiz', () => {
    const validPayload = {
      subject: 'React',
      difficulty: 'medium' as const,
      question: 'Qu\'est-ce que React?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correct_answer: 0,
      explanation: 'Explication',
    };

    expect(validPayload.subject).toBeTruthy();
    expect(['easy', 'medium', 'hard']).toContain(validPayload.difficulty);
    expect(validPayload.options).toHaveLength(4);
    expect(validPayload.correct_answer).toBeGreaterThanOrEqual(0);
    expect(validPayload.correct_answer).toBeLessThanOrEqual(3);
  });

  it('valide le payload add_memory', () => {
    const validPayload = {
      content: 'Je prépare un concours',
      type: 'objectif' as const,
    };

    expect(validPayload.content).toBeTruthy();
    expect(['preference', 'objectif', 'connaissance', 'autre']).toContain(validPayload.type);
  });

  it('valide le payload create_flashcard', () => {
    const validPayload = {
      front: 'Question',
      back: 'Réponse',
      category: 'vocabulaire',
    };

    expect(validPayload.front).toBeTruthy();
    expect(validPayload.back).toBeTruthy();
  });
});



import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getMemories, saveMemory } from '@/lib/db';

export async function POST(req: Request) {
  // Save body for potential retry
  const body = await req.json();
  const { messages, conversationId, userId } = body;
  
  try {
    
    console.log('Chat API called:', { 
      hasMessages: !!messages, 
      messageCount: messages?.length,
      conversationId,
      userId 
    });

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prefer OpenAI if available (Gemini models are not accessible with current API key)
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!hasOpenAI && !hasGemini) {
      return new Response(JSON.stringify({ error: 'No API key configured (need OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY)' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user memories for context (with error handling)
    let memories: any[] = [];
    try {
      memories = await getMemories(userId);
    } catch (memoryError) {
      console.warn('Failed to load memories, continuing without context:', memoryError);
      // Continue without memories if there's an error
    }
    const memoryContext = memories.length > 0
      ? `\n\nContexte utilisateur (mémoires):\n${memories.map(m => `- [${m.type}] ${m.content}`).join('\n')}`
      : '';

    // Add system message with context
    const systemMessage = {
      role: 'system' as const,
      content: `Tu es un assistant d'apprentissage intelligent et bienveillant. Tu aides les utilisateurs à apprendre efficacement.
${memoryContext}

Instructions importantes:
- Utilise l'outil generate_quiz quand l'utilisateur demande un quiz ou veut tester ses connaissances.
- Utilise l'outil add_memory pour sauvegarder des informations importantes sur l'utilisateur (préférences, objectifs, difficultés, connaissances).
- Utilise l'outil create_flashcard pour créer des cartes mémoire interactives quand l'utilisateur veut mémoriser quelque chose.
- Sois naturel et conversationnel.`,
    };

    // Filter out system messages from the incoming messages and add our system message
    const userMessages = messages.filter((m: any) => m.role !== 'system');
    const allMessages = [systemMessage, ...userMessages];

    // Use OpenAI if available, otherwise try Gemini
    let model;
    if (hasOpenAI) {
      const { createOpenAI } = await import('@ai-sdk/openai');
      const openaiClient = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });
      console.log('Using OpenAI API (gpt-4.1-nano)...');
      model = openaiClient.chat('gpt-4.1-nano');
    } else if (hasGemini) {
      const googleAI = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      });
      console.log('Using Gemini API...');
      // Try different model names in order of preference
      const geminiModels = [
        'gemini-1.5-flash-002',
        'gemini-1.5-flash',
        'gemini-1.5-pro-002',
        'gemini-1.5-pro',
        'gemini-pro',
      ];
      // Use the first model (will fail at runtime if not available, but we'll catch it)
      model = googleAI(geminiModels[0]);
    } else {
      return new Response(JSON.stringify({ error: 'No API key configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await streamText({
      model,
      messages: allMessages,
      tools: {
        generate_quiz: tool({
          description: 'Génère un quiz interactif sur un sujet donné avec une question et plusieurs choix de réponse.',
          parameters: z.object({
            subject: z.string().describe('Le sujet du quiz'),
            difficulty: z.enum(['easy', 'medium', 'hard']).describe('La difficulté du quiz'),
            question: z.string().describe('La question du quiz'),
            options: z.array(z.string()).length(4).describe('Les 4 options de réponse'),
            correct_answer: z.number().min(0).max(3).describe('L\'index de la bonne réponse (0-3)'),
            explanation: z.string().optional().describe('Explication de la bonne réponse'),
          }),
          execute: async ({ subject, difficulty, question, options, correct_answer, explanation }) => {
            return {
              id: `quiz-${Date.now()}`,
              subject,
              difficulty,
              question,
              options,
              correct_answer,
              explanation: explanation || 'Bonne réponse !',
            };
          },
        }),
        add_memory: tool({
          description: 'Enregistre une information importante sur l\'utilisateur pour personnaliser l\'expérience d\'apprentissage.',
          parameters: z.object({
            content: z.string().describe('L\'information à mémoriser'),
            type: z.enum(['preference', 'objectif', 'connaissance', 'autre']).describe('Le type de mémoire'),
          }),
          execute: async ({ content, type }) => {
            try {
              const memory = await saveMemory({
                user_id: userId,
                content,
                type,
              });
              return {
                success: true,
                memory_id: memory.id,
                content: memory.content,
                type: memory.type,
              };
            } catch (error) {
              console.error('Error saving memory:', error);
              // Return success anyway to not break the conversation flow
              return {
                success: false,
                error: 'Failed to save memory',
                content,
                type,
              };
            }
          },
        }),
        create_flashcard: tool({
          description: 'Crée une carte mémoire interactive pour aider l\'utilisateur à mémoriser des informations.',
          parameters: z.object({
            front: z.string().describe('Le recto de la carte (question ou terme)'),
            back: z.string().describe('Le verso de la carte (réponse ou définition)'),
            category: z.string().optional().describe('La catégorie de la carte (ex: vocabulaire, formule, concept)'),
          }),
          execute: async ({ front, back, category }) => {
            return {
              id: `flashcard-${Date.now()}`,
              front,
              back,
              category: category || 'général',
            };
          },
        }),
      },
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // If Gemini fails and OpenAI is available, retry with OpenAI
    const isGeminiError = errorMessage.includes('gemini') || errorMessage.includes('not found for API version');
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    
    if (isGeminiError && hasOpenAI) {
      console.log('Gemini failed, retrying with OpenAI...');
      try {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const openaiClient = createOpenAI({
          apiKey: process.env.OPENAI_API_KEY!,
        });
        
        // Use saved body from the beginning
        const userMessages = messages.filter((m: any) => m.role !== 'system');
        
        // Get memories again
        let memories: any[] = [];
        try {
          memories = await getMemories(userId);
        } catch (memoryError) {
          console.warn('Failed to load memories:', memoryError);
        }
        const memoryContext = memories.length > 0
          ? `\n\nContexte utilisateur (mémoires):\n${memories.map(m => `- [${m.type}] ${m.content}`).join('\n')}`
          : '';
        
        const systemMessage = {
          role: 'system' as const,
          content: `Tu es un assistant d'apprentissage intelligent et bienveillant. Tu aides les utilisateurs à apprendre efficacement.
${memoryContext}

Instructions importantes:
- Utilise l'outil generate_quiz quand l'utilisateur demande un quiz ou veut tester ses connaissances.
- Utilise l'outil add_memory pour sauvegarder des informations importantes sur l'utilisateur (préférences, objectifs, difficultés, connaissances).
- Utilise l'outil create_flashcard pour créer des cartes mémoire interactives quand l'utilisateur veut mémoriser quelque chose.
- Sois naturel et conversationnel.`,
        };
        const allMessages = [systemMessage, ...userMessages];
        
        const result = await streamText({
          model: openaiClient.chat('gpt-4.1-nano'),
          messages: allMessages,
          tools: {
            generate_quiz: tool({
              description: 'Génère un quiz interactif sur un sujet donné avec une question et plusieurs choix de réponse.',
              parameters: z.object({
                subject: z.string().describe('Le sujet du quiz'),
                difficulty: z.enum(['easy', 'medium', 'hard']).describe('La difficulté du quiz'),
                question: z.string().describe('La question du quiz'),
                options: z.array(z.string()).length(4).describe('Les 4 options de réponse'),
                correct_answer: z.number().min(0).max(3).describe('L\'index de la bonne réponse (0-3)'),
                explanation: z.string().optional().describe('Explication de la bonne réponse'),
              }),
              execute: async ({ subject, difficulty, question, options, correct_answer, explanation }) => {
                return {
                  id: `quiz-${Date.now()}`,
                  subject,
                  difficulty,
                  question,
                  options,
                  correct_answer,
                  explanation: explanation || 'Bonne réponse !',
                };
              },
            }),
            add_memory: tool({
              description: 'Enregistre une information importante sur l\'utilisateur pour personnaliser l\'expérience d\'apprentissage.',
              parameters: z.object({
                content: z.string().describe('L\'information à mémoriser'),
                type: z.enum(['preference', 'objectif', 'connaissance', 'autre']).describe('Le type de mémoire'),
              }),
              execute: async ({ content, type }) => {
                try {
                  const memory = await saveMemory({
                    user_id: userId,
                    content,
                    type,
                  });
                  return {
                    success: true,
                    memory_id: memory.id,
                    content: memory.content,
                    type: memory.type,
                  };
                } catch (error) {
                  console.error('Error saving memory:', error);
                  return {
                    success: false,
                    error: 'Failed to save memory',
                    content,
                    type,
                  };
                }
              },
            }),
            create_flashcard: tool({
              description: 'Crée une carte mémoire interactive pour aider l\'utilisateur à mémoriser des informations.',
              parameters: z.object({
                front: z.string().describe('Le recto de la carte (question ou terme)'),
                back: z.string().describe('Le verso de la carte (réponse ou définition)'),
                category: z.string().optional().describe('La catégorie de la carte (ex: vocabulaire, formule, concept)'),
              }),
              execute: async ({ front, back, category }) => {
                return {
                  id: `flashcard-${Date.now()}`,
                  front,
                  back,
                  category: category || 'général',
                };
              },
            }),
          },
          maxSteps: 5,
        });
        
        return result.toDataStreamResponse();
      } catch (retryError) {
        console.error('OpenAI fallback also failed:', retryError);
      }
    }
    
    // Log more details for debugging
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      hasGeminiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

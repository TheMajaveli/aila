import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getMemories, saveMemory } from '@/lib/db';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, conversationId, userId } = body;
    
    console.log('Chat API called:', { 
      hasMessages: !!messages, 
      messageCount: messages?.length,
      conversationId,
      userId 
    });

    // Use the userId directly - it's already authenticated from Supabase Auth on the client side
    // The userId is the UUID from auth.users, which is secure since it comes from an authenticated session
    let authenticatedUserId = userId;
    
    // Basic validation: ensure userId is provided and is a valid UUID format
    if (!authenticatedUserId || authenticatedUserId.trim() === '') {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(authenticatedUserId) && !authenticatedUserId.startsWith('user-')) {
      // Allow legacy user-* format for backward compatibility
      console.warn('Non-UUID userId format detected:', authenticatedUserId);
    }

    if (!authenticatedUserId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user memories for context (with error handling)
    let memories: any[] = [];
    try {
      memories = await getMemories(authenticatedUserId);
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
- Utilise l'outil add_memory UNIQUEMENT pour sauvegarder des informations PERTINENTES et UTILES à l'apprentissage (préférences d'apprentissage, objectifs pédagogiques, difficultés rencontrées, connaissances acquises). Ne stocke PAS d'informations personnelles non liées à l'apprentissage.
- Réutilise les mémoires stockées dans le contexte pour personnaliser tes réponses et adapter ton approche pédagogique.
- Utilise l'outil create_flashcard pour créer des cartes mémoire interactives quand l'utilisateur veut mémoriser quelque chose.
- Sois naturel et conversationnel.`,
    };

    // Filter out system messages from the incoming messages and add our system message
    const userMessages = messages.filter((m: any) => m.role !== 'system');
    const allMessages = [systemMessage, ...userMessages];

    // Initialize OpenAI client
    const openaiClient = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    console.log('Using OpenAI API (gpt-4.1-nano)...');

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
          description: 'Enregistre UNIQUEMENT des informations PERTINENTES et UTILES à l\'apprentissage pour personnaliser l\'expérience. Ne stocke que des informations liées à l\'apprentissage : préférences pédagogiques, objectifs d\'apprentissage, difficultés rencontrées, connaissances acquises. Ignore les informations personnelles non pertinentes.',
          parameters: z.object({
            content: z.string().describe('L\'information pertinente à mémoriser (doit être utile pour l\'apprentissage)'),
            type: z.enum(['preference', 'objectif', 'connaissance', 'autre']).describe('Le type de mémoire (preference: préférences d\'apprentissage, objectif: objectifs pédagogiques, connaissance: connaissances acquises, autre: autres infos pertinentes)'),
          }),
          execute: async ({ content, type }) => {
              try {
                console.log('🔄 Attempting to save memory:', {
                  userId: authenticatedUserId,
                  type,
                  content: content.substring(0, 50) + '...',
                });
                
                const memory = await saveMemory({
                  user_id: authenticatedUserId,
                  content,
                  type,
                });
                
                console.log('✅ Memory saved successfully in tool:', {
                  memoryId: memory.id,
                  type: memory.type,
                });
                
                return {
                  success: true,
                  memory_id: memory.id,
                  content: memory.content,
                  type: memory.type,
                };
              } catch (error: any) {
                console.error('❌ Error saving memory in tool:', {
                  error: error.message,
                  code: error.code,
                  details: error.details,
                  hint: error.hint,
                  userId: authenticatedUserId,
                  type,
                  content: content.substring(0, 50) + '...',
                });
                
                // Still return a result to not break the conversation flow
                // but indicate failure
                return {
                  success: false,
                  error: error.message || 'Failed to save memory',
                  error_code: error.code,
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
    
    // Log error details for debugging
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
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

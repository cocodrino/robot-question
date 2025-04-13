import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';

import { quizGeneratorAgent, quizValidatorAgent } from './agents';

export const mastra = new Mastra({
  agents: { quizGeneratorAgent, quizValidatorAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

// Estructura del tipo de preguntas
interface QuizQuestion {
  question: string;
  options: string[];
  rightAnswer: { number: number; text: string };
}

// Interfaz para los tool calls
interface ToolCall {
  type: "tool-call";
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

// Interfaz para argumentos compatibles
interface CompatibleArgs {
  name?: string;
  toolName?: string;
  arguments?: Record<string, unknown>;
  args?: Record<string, unknown>;
  [key: string]: unknown;
}

// Ejemplo de uso de los agentes
export const generateQuizQuestions = async (topic: string) => {
  try {
    console.log(`Generando preguntas sobre: ${topic}`);

    // 1. Generar preguntas con el primer agente
    const generationResult = await quizGeneratorAgent.generate([
      {
        role: 'user',
        content: `Generate quiz questions about ${topic}.`,
      },
    ]);

    console.log('Resultado generación:', JSON.stringify(generationResult, null, 2));

    // Extraer las preguntas generadas
    let questions: QuizQuestion[] | null = null;

    try {
      // Buscar las preguntas en el resultado o en los tool calls
      if (generationResult.toolCalls && generationResult.toolCalls.length > 0) {
        // Convertir el toolCall a un formato más manejable
        const storeQuestionCall = generationResult.toolCalls.find(
          (call) => {
            const compatCall = call as CompatibleArgs;
            return compatCall.toolName === 'storeQuestions' || compatCall.name === 'storeQuestions';
          }
        );

        if (storeQuestionCall) {
          // Intentar acceder a los argumentos - podría estar en .args o en .arguments
          const compatCall = storeQuestionCall as CompatibleArgs;
          const args = compatCall.args || compatCall.arguments;
          if (args?.questions) {
            questions = args.questions as QuizQuestion[];
          }
        }
      }

      // Si no encontramos las preguntas en los tool calls, intentamos extraerlas del texto
      if (!questions) {
        // Obtener el contenido del texto de la respuesta
        const textContent = typeof generationResult.text === 'string'
          ? generationResult.text
          : JSON.stringify(generationResult);

        // Buscamos un array JSON en el contenido
        const matches = textContent.match(/\[\s*\{.*\}\s*\]/s);

        if (matches?.[0]) {
          try {
            questions = JSON.parse(matches[0]);
          } catch (e) {
            console.error('Error parsing JSON from content:', e);
          }
        }
      }

      if (!questions || questions.length === 0) {
        console.error('No se pudieron generar preguntas');
        throw new Error('failed to generate questions');
      }
    } catch (error) {
      console.error('Error extrayendo preguntas:', error);
      throw error;
    }


    return questions;
  } catch (error) {
    console.error('Error en generateQuizQuestions:', error);
    throw error;
  }
};


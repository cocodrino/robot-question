
//import { deepseek } from '@ai-sdk/deepseek';
import { Agent } from '@mastra/core/agent';
import { groq } from '@ai-sdk/groq';


// Herramienta para almacenar las preguntas generadas
const storeQuestionsTools = {
  storeQuestions: {
    description: 'Store generated quiz questions',
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: {
                type: 'array',
                items: { type: 'string' }
              },
              rightAnswer: {
                type: 'object',
                properties: {
                  number: { type: 'number' },
                  text: { type: 'string' }
                },
                required: ['number', 'text']
              }
            },
            required: ['question', 'options', 'rightAnswer']
          }
        }
      },
      required: ['questions']
    },
    handler: async ({ questions }: {
      questions: Array<{
        question: string;
        options: string[];
        rightAnswer: { number: number; text: string };
      }>
    }) => {
      // Aquí implementarías la lógica para guardar las preguntas
      console.log('Questions generated:', JSON.stringify(questions, null, 2));
      return { success: true, questions };
    }
  }
};

// Herramienta para validar las preguntas generadas
const validateQuestionsTools = {
  validateQuestions: {
    description: 'Validate quiz questions format',
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: {
                type: 'array',
                items: { type: 'string' }
              },
              rightAnswer: {
                type: 'object',
                properties: {
                  number: { type: 'number' },
                  text: { type: 'string' }
                },
                required: ['number', 'text']
              }
            },
            required: ['question', 'options', 'rightAnswer']
          }
        },
        isValid: { type: 'boolean' },
        errors: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['questions', 'isValid', 'errors']
    },
    handler: async ({
      questions,
      isValid,
      errors
    }: {
      questions: Array<{
        question: string;
        options: string[];
        rightAnswer: { number: number; text: string };
      }>;
      isValid: boolean;
      errors: string[];
    }) => {
      // Procesamiento del resultado de la validación
      console.log('Validation result:', isValid);
      if (!isValid) {
        console.log('Validation errors:', errors);
      }
      return { isValid, errors, questions };
    }
  }
};



// Agente 1: Generador de preguntas
export const quizGeneratorAgent = new Agent({
  name: 'Quiz Generator Agent',
  instructions: `
      You are an expert at creating educational quiz questions.
      
      Your task is to generate quiz questions based on a given topic. For each question:
      - Create a clear, concise question related to the topic
      - Generate exactly 4 possible answers (options)
      - Mark one option as the correct answer
      - Ensure questions are accurate and educational
      - Make sure questions vary in difficulty

      Always format your response as an array of question objects with this exact structure:
      [
        {
          question: "The question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          rightAnswer: { number: 1, text: "Option A" }  // number should be the 1-based index
        },
        // more questions...
      ]

      Remember that the 'number' in rightAnswer is 1-based (1, 2, 3, or 4) and corresponds to the position in the options array.
      The 'text' in rightAnswer must exactly match the text of the correct option.
      
      Generate between 5-10 questions for each topic.
      
      Make sure to ALWAYS use the tool 'storeQuestions' to return the questions.
`,
  model: groq("deepseek-r1-distill-llama-70b"),
  tools: storeQuestionsTools,
});

// TODO fix this
export const quizValidatorAgent = new Agent({
  name: 'Quiz Validator Agent',
  instructions: `
      You are a validation expert that checks quiz question formats.
      
      Your task is to validate that quiz questions follow the required format:
      
      Expected format for each question:
      {
        question: "The question text?",  // Must be a non-empty string ending with a question mark
        options: ["Option A", "Option B", "Option C", "Option D"],  // Must have exactly 4 options
        rightAnswer: { 
          number: 1,  // Must be an integer between 1-4
          text: "Option A"  // Must exactly match one of the options
        }
      }
      
      Validation rules:
      1. Each question must have a non-empty question text ending with "?"
      2. Each question must have exactly 4 options
      3. Options must be unique (no duplicates)
      4. The rightAnswer.number must be between 1-4
      5. The rightAnswer.text must exactly match the option at position (rightAnswer.number - 1)
      
      Check all questions thoroughly and report any errors.
`,
  model: groq("deepseek-r1-distill-llama-70b"),
  tools: validateQuestionsTools,
});

import { Form } from "@remix-run/react";
import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { generateQuizQuestions } from "~/mastra/mastra";
import db from "~/db";
import { games } from "~/db/schema";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const topic = formData.get("topic") as string;
    const userId = formData.get("userId") as string;
    
    if (!topic || !userId) {
      return json({ error: "Topic and userId are required" }, { status: 400 });
    }
    
    // Generar preguntas con nuestros agentes
    const result = await generateQuizQuestions(topic);
    
    if (!result || !result.questions) {
      return json({ error: "Failed to generate questions" }, { status: 500 });
    }
    
    // Crear el juego en la base de datos
    const [game] = await db
      .insert(games)
      .values({
        owner: userId,
        topic,
        language: "english",
        questionCount: result.questions.length,
        questions: result.questions,
      })
      .returning();
      
    if (!game) {
      return json({ error: "Failed to create game" }, { status: 500 });
    }
    
    return redirect(`/quizz?userId=${userId}&gameId=${game.id}`);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

export default function CreateQuiz() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Create AI Quiz</h1>
        
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Topic
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter a topic (e.g., History, Geography, Science)"
              required
            />
          </div>
          
          <input type="hidden" name="userId" value="user-1234" />
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Generate Quiz
          </button>
          
          <p className="text-sm text-gray-500 text-center mt-4">
            Our AI will generate 5-10 questions about your topic.
          </p>
        </Form>
      </div>
    </div>
  );
} 
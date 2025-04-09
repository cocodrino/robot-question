import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useGameStore } from "~/store/gameStore";
import { games, users } from "~/db/schema";
import db from "~/db";
import React from "react";
import { eq } from "drizzle-orm";
import type { GameQuestions } from "~/types/game-questions";
import QuestionBuilder from "~/components/question-builder";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const userId = url.searchParams.get("userId");
	const gameId = url.searchParams.get("gameId");

	if (!userId || !gameId) {
		throw new Response("Missing required parameters", { status: 400 });
	}

	const game = await db
		.select()
		.from(games)
		.where(eq(games.id, gameId))
		.limit(1);
	const user = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!game[0] || !user[0]) {
		throw new Response("Game or user not found", { status: 404 });
	}

	console.log(game[0]);
	return json({ game: game[0], user: user[0] });
};

export default function Quizz() {
	const { game, user } = useLoaderData<typeof loader>();
	const setGameData = useGameStore((state) => state.setGameData);

	React.useEffect(() => {
		if (game && user) {
			console.log("game", game);
			setGameData(user.id, {
				...game,
				questions: (game.questions as GameQuestions[]) || [],
			});
		}
	}, [game, user, setGameData]);

	return (
		<div className="min-h-screen bg-gray-100 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<h1 className="text-2xl font-bold mb-4">Quiz for {user.name}</h1>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<p className="text-gray-600">Topic:</p>
							<p className="font-semibold">{game.topic}</p>
						</div>
						<div>
							<p className="text-gray-600">Language:</p>
							<p className="font-semibold">{game.language}</p>
						</div>
					</div>
				</div>
				<QuestionBuilder />
			</div>
		</div>
	);
}

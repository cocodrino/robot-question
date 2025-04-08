import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useGameStore } from "~/store/gameStore";
import { games, users } from "~/db/schema";
import db from "~/db";
import React from "react";
import { eq } from "drizzle-orm";

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

	return json({ game: game[0], user: user[0] });
};

export default function Quizz() {
	const { game, user } = useLoaderData<typeof loader>();
	const setGameData = useGameStore((state) => state.setGameData);

	React.useEffect(() => {
		if (game && user) {
			setGameData(user.id, {
				...game,
				questions: game.questions || [],
			});
		}
	}, [game, user, setGameData]);

	return (
		<div>
			<h1>Quizz for user {user.name}</h1>
			<p>Game Topic: {game.topic}</p>
			<p>Language: {game.language}</p>
			<p>Question Count: {game.questionCount}</p>
		</div>
	);
}

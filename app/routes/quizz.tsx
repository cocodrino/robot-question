import { useLoaderData, useSubmit } from "@remix-run/react";
import { json, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useGameStore } from "~/store/gameStore";
import { games, users, gameRankings } from "~/db/schema";
import db from "~/db";
import React from "react";
import { eq } from "drizzle-orm";
import type { GameQuestions } from "~/types/game-questions";
import QuestionBuilder from "~/components/question-builder";
import { AnimatedPopup } from "~/components/animated-popup";

export const action = async ({ request }: LoaderFunctionArgs) => {
	const formData = await request.formData();
	const userId = formData.get("userId") as string;
	const gameId = formData.get("gameId") as string;
	const score = Number.parseInt(formData.get("score") as string);

	if (!userId || !gameId) {
		return json({ error: "Missing required data" }, { status: 400 });
	}

	console.log("saving results");
	try {
		await db.insert(gameRankings).values({
			userId,
			gameId,
			score,
		});

		console.log("redirecting to results");
		return redirect(`/results?userId=${userId}&gameId=${gameId}`);
	} catch (error) {
		console.error("Error saving results:", error);
		return json({ error: "Failed to save results" }, { status: 500 });
	}
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	console.log("url", url);
	const userId = url.searchParams.get("userId");
	const gameId = url.searchParams.get("gameId");

	console.log("loading quizz", userId, gameId);

	if (!userId || !gameId) {
		console.log("missing userId or gameId, redirecting to home");
		return redirect("/");
	}

	// Verificar que el usuario existe
	const user = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1)
		.then((rows) => rows[0]);

	if (!user) {
		console.log("user not found, redirecting to home");
		return redirect("/");
	}

	// Obtener el juego
	const game = await db
		.select()
		.from(games)
		.where(eq(games.id, gameId))
		.limit(1)
		.then((rows) => rows[0]);

	if (!game) {
		console.log("game not found, redirecting to home");
		return redirect("/");
	}

	return json({ user, game });
};

export default function Quizz() {
	const { user, game } = useLoaderData<typeof loader>();
	const { setGameData } = useGameStore();
	const numberQuestions = useGameStore((state) => state.numberQuestions);
	const questionIndex = useGameStore((state) => state.questionIndex);
	const correctAnswerCount = useGameStore((state) => state.correctAnswerCount);
	const submit = useSubmit();
	const feedback = useGameStore((state) => state.feedback);

	console.log("feedback", feedback);

	// Inicializar el store con los datos del juego
	React.useEffect(() => {
		setGameData(user.id, {
			...game,
			questions: (game.questions as GameQuestions[]) || [],
		});
	}, [user.id, game, setGameData]);

	const handleSaveResults = (data: {
		userId: string;
		gameId: string;
		score: number;
	}) => {
		const formData = new FormData();
		formData.append("userId", data.userId);
		formData.append("gameId", data.gameId);
		formData.append("score", data.score.toString());
		submit(formData, { method: "post" });
	};

	return (
		<main>
			{feedback !== "hidden" && (
				<AnimatedPopup ubication="top" margin={1} timeTransition={0.5}>
					<div className="flex flex-col bg-black p-5">
						<video
							src={feedback === "right" ? "/yes.mp4" : "/no.mp4"}
							autoPlay
							loop
							muted
							playsInline
							className="w-[220px] h-auto"
						/>
					</div>
				</AnimatedPopup>
			)}
			<div className="min-h-screen first-letter: py-8">
				<div className="max-w-4xl mx-auto px-1">
					<div className="text-2xl font-bold  w-full md:w-auto text-center">
						<span className="silkscreen-light text-lime-400 text-xl md:text-2xl">
							{game.topic}
						</span>
					</div>
					<div className=" rounded-lg shadow-lg p-6 mb-4 flex justify-between silkscreen-regular">
						<div className="counterQuestions flex text-2xl">
							<span className="font-semibold text-violet-500">
								{questionIndex + 1}
							</span>
							<span className=" text-white">/{numberQuestions}</span>
						</div>
						<div>
							<p className="text-2xl font-bold text-pink-500">
								{(correctAnswerCount || 0) * 100}
							</p>
						</div>
					</div>
					<QuestionBuilder onSaveResults={handleSaveResults} />
				</div>
			</div>
		</main>
	);
}

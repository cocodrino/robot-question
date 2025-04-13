import type { MetaFunction } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
	useLoaderData,
	useNavigation,
	useSearchParams,
} from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { route } from "routes-gen";
import { z } from "zod";
import React from "react";
import { eq } from "drizzle-orm";

import { Input } from "../components/input";
import { RadioGroup } from "../components/radio-group";
import { Select } from "../components/select";
import { AsciiArt } from "../components/ascii-art";
import db from "../db";
import { type Game, games, User, users } from "../db/schema";
import { AnimatedPopup } from "../components/animated-popup";
import { Button } from "../components/ui/button";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const appUrl = data?.appUrl || "http://localhost:5174/";
	return [
		{
			title: `A Quiz App built with AI - ${appUrl}`,
		},
		{
			name: "description",
			content: `A Quiz App built with AI - ${appUrl}`,
		},
		{
			name: "viewport",
			content: "width=device-width, initial-scale=1",
		},
	];
};

const validator = withZod(
	z.object({
		name: z.string().min(3).max(34),
		topic: z.string().min(3).max(34).optional(),
	}),
);

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const gameId = url.searchParams.get("game");

	let game: Game | null = null;
	if (gameId) {
		game = await db
			.select()
			.from(games)
			.where(eq(games.id, gameId))
			.limit(1)
			.then((rows) => rows[0] || null);
	}

	return {
		defaultValues: {
			name: "",
			topic: "",
		},
		game,
		appUrl: process.env.APP_URL || "http://localhost:5174/",
	};
};

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		console.log("action");
		const formData = await request.formData();
		const fieldValues = await validator.validate(formData);

		if (fieldValues.error) {
			return validationError(fieldValues.error);
		}

		const { name, topic } = fieldValues.data;
		const url = new URL(request.url);
		const gameId = url.searchParams.get("game");

		console.log("saving");
		try {
			await db.select().from(users).limit(1);
		} catch (error) {
			console.error("Error de conexión a la base de datos:", error);
			return json({ error: "Database connection error" }, { status: 500 });
		}

		console.log("creating user");
		const [user] = await db.insert(users).values({ name }).returning();
		if (!user) {
			return json({ error: "Failed to create user" }, { status: 500 });
		}

		if (gameId) {
			// Si hay un gameId, verificar que el juego existe
			const game = await db
				.select()
				.from(games)
				.where(eq(games.id, gameId))
				.limit(1)
				.then((rows) => rows[0] || null);

			if (!game) {
				return json({ error: "Game not found" }, { status: 404 });
			}

			console.log("redirecting to quizz");
			return redirect(`/quizz?userId=${user.id}&gameId=${gameId}`);
		}

		// Si no hay gameId, crear un nuevo juego
		if (!topic) {
			return json(
				{ error: "Topic is required when creating a new game" },
				{ status: 400 },
			);
		}

		console.log("inserting game");
		const [game] = await db
			.insert(games)
			.values({
				owner: user.id,
				topic: topic as string,
				questions: [
					{
						question: "What is the capital of France?",
						rightAnswer: { number: 1, text: "Paris" },
						options: ["Paris", "London", "Madrid", "Rome"],
					},
					{
						question: "What is the capital of France?",
						rightAnswer: { number: 1, text: "Paris" },
						options: ["Paris", "London", "Madrid", "Rome"],
					},
				],
			})
			.returning();

		if (!game) {
			return json({ error: "Failed to create game" }, { status: 500 });
		}

		console.log("redirecting to quizz");
		return redirect(`/quizz?userId=${user.id}&gameId=${game.id}`);
	} catch (error) {
		console.error("Error in action:", error);
		return json({ error: "Internal server error" }, { status: 500 });
	}
};

export default function Index() {
	const { defaultValues, game } = useLoaderData<typeof loader>();
	const navigation = useNavigation();

	return (
		<div>
			{navigation.state === "loading" && (
				<AnimatedPopup ubication="top" margin={1} timeTransition={0.5}>
					<div className="flex flex-col bg-black p-5">
						<video
							src="/search.mp4"
							autoPlay
							loop
							muted
							playsInline
							className="w-[512px] md:w-[580px] h-auto"
						/>

						<h2 className="text-xl my-4">Building your questions...</h2>
					</div>
				</AnimatedPopup>
			)}
			<div className="container mx-auto flex flex-col items-center justify-center h-screen">
				<AsciiArt />
				<h1 className="md:text-xl text-2xl font-bold silkscreen-regular">
					Generate a quiz with questions created by our AI robot!
				</h1>

				<ValidatedForm
					validator={validator}
					method="post"
					defaultValues={defaultValues}
					className="flex flex-col gap-4 mt-12"
				>
					<Input
						name="name"
						label="Your name (or alias)"
						className="w-full  md:w-96"
					/>
					{!game && (
						<Input
							name="topic"
							label="Topic"
							placeholder="Mythology,Marvel Characters, Alibaba Cloud"
						/>
					)}

					<Button className="mt-6" type="submit">
						{game ? "Join Game" : "Create Game"}
					</Button>
				</ValidatedForm>
			</div>
		</div>
	);
}

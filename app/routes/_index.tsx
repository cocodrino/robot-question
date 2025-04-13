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
import React, { useEffect, useState } from "react";
import { eq, and, gte } from "drizzle-orm";
import { subDays } from "date-fns";

import { Input } from "../components/input";
import { RadioGroup } from "../components/radio-group";
import { Select } from "../components/select";
import { AsciiArt } from "../components/ascii-art";
import db from "../db";
import { type Game, games, User, users, ipRequests } from "../db/schema";
import { AnimatedPopup } from "../components/animated-popup";
import { Button } from "../components/ui/button";
import { generateQuizQuestions } from "~/mastra/mastra";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	ToastViewport,
	ToastProvider,
} from "~/components/ui/toast";

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
		// Verificar si el limitador está activado
		if (process.env.HAS_LIMIT_IP_REQUEST === "true") {
			const ip = request.headers.get("x-forwarded-for") || "unknown";
			const today = new Date();
			const yesterday = subDays(today, 1);

			// Obtener o crear el registro de requests para esta IP
			const [ipRequest] = await db
				.select()
				.from(ipRequests)
				.where(and(eq(ipRequests.ip, ip), gte(ipRequests.date, yesterday)))
				.limit(1);

			if (ipRequest) {
				// Si el conteo excede el límite, retornar error
				if (
					ipRequest.count >= Number(process.env.LIMIT_IP_REQUEST_COUNT || 5)
				) {
					return redirect(
						`/?error=${encodeURIComponent(
							`You only can create ${process.env.LIMIT_IP_REQUEST_COUNT} quizzes by day`,
						)}`,
					);
				}

				// Incrementar el conteo
				await db
					.update(ipRequests)
					.set({ count: ipRequest.count + 1 })
					.where(eq(ipRequests.id, ipRequest.id));
			} else {
				// Crear nuevo registro
				await db.insert(ipRequests).values({
					ip,
					count: 1,
					date: today,
				});
			}
		}

		console.log("action");
		const formData = await request.formData();
		const fieldValues = await validator.validate(formData);

		if (fieldValues.error) {
			return redirect(
				`/?error=${encodeURIComponent("Please fill in all fields correctly")}`,
			);
		}

		const { name, topic } = fieldValues.data;
		const url = new URL(request.url);
		const gameId = url.searchParams.get("game");

		console.log("saving");
		try {
			await db.select().from(users).limit(1);
		} catch (error) {
			console.error("Error de conexión a la base de datos:", error);
			return redirect(
				`/?error=${encodeURIComponent("Database connection error. Please try again.")}`,
			);
		}

		console.log("creating user");
		const [user] = await db.insert(users).values({ name }).returning();
		if (!user) {
			return redirect(
				`/?error=${encodeURIComponent("Error creating user. Please try again.")}`,
			);
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
				return redirect(
					`/?error=${encodeURIComponent("Game not found or has been deleted.")}`,
				);
			}

			console.log(`redirecting to quizz ${user.id} ${gameId}`);
			return redirect(`/quizz?userId=${user.id}&gameId=${gameId}`);
		}

		// Si no hay gameId, crear un nuevo juego
		if (!topic) {
			return redirect(
				`/?error=${encodeURIComponent("Topic is required to create a new game.")}`,
			);
		}

		console.log("generating questions for topic", topic);
		const questions = await generateQuizQuestions(topic as string);
		console.log("questions", questions);

		console.log("inserting game");
		const [game] = await db
			.insert(games)
			.values({
				owner: user.id,
				topic: topic as string,
				questions,
			})
			.returning();

		if (!game) {
			return redirect(
				`/?error=${encodeURIComponent("Error creating game. Please try again.")}`,
			);
		}

		console.log(`/quizz?userId=${user.id}&gameId=${game.id}`);
		return redirect(`/quizz?userId=${user.id}&gameId=${game.id}`);
	} catch (error) {
		console.error("Error in action:", error);
		return redirect(
			`/?error=${encodeURIComponent("An unexpected error occurred. Please try again.")}`,
		);
	}
};

export default function Index() {
	const { defaultValues, game } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const [searchParams] = useSearchParams();
	const [showToast, setShowToast] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		const error = searchParams.get("error");
		if (error) {
			setErrorMessage(decodeURIComponent(error));
			setShowToast(true);
			// Limpiar el error después de 5 segundos
			const timer = setTimeout(() => {
				setShowToast(false);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [searchParams]);

	return (
		<ToastProvider>
			<div>
				{["submitting", "loading"].includes(navigation.state) && (
					<AnimatedPopup ubication="top" margin={1} timeTransition={0.5}>
						<div className="flex flex-col bg-black p-5">
							<video
								src="/search.mp4"
								autoPlay
								loop
								muted
								playsInline
								className="w-[220px] h-auto"
							/>

							<h2 className="text-xl my-4">Building your questions...</h2>
						</div>
					</AnimatedPopup>
				)}
				{showToast && (
					<Toast variant="destructive">
						<ToastTitle>Error</ToastTitle>
						<ToastDescription>{errorMessage}</ToastDescription>
					</Toast>
				)}
				<ToastViewport />
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
		</ToastProvider>
	);
}

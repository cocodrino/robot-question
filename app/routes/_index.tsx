import type { MetaFunction } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect, type TypedResponse } from "@remix-run/node";
import {
	useLoaderData,
	useNavigate,
	useSubmit,
	useFetcher,
} from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import {
	ValidatedForm,
	validationError,
	type ValidationErrorResponseData,
} from "remix-validated-form";
import { route } from "routes-gen";
import { z } from "zod";
import React from "react";

import { Input } from "../components/input";
import { RadioGroup } from "../components/radio-group";
import { Select } from "../components/select";
import db from "../db";
import { Game, games, User, users } from "../db/schema";
import type { GameQuestions } from "../types/game-questions";
import { useGameStore } from "~/store/gameStore";

export const meta: MetaFunction = () => {
	return [
		{ title: "A Quiz App built with AI" },
		{
			name: "description",
			content: "Generate quizzes from any topic using our robots",
		},
	];
};

const validator = withZod(
	z.object({
		name: z.string().min(4).max(34),
		topic: z.string().min(4).max(34),
		language: z.enum(["spanish", "english"]),
		questionCount: z.enum(["10", "20", "30"]).transform(Number),
	}),
);

export const loader = () => {
	return {
		defaultValues: {
			name: "",
			topic: "",
			language: "english" as const,
			questionCount: 10,
		},
	};
};

interface NewGameResponse {
	gameId: string;
	userId: string;
	game: GameQuestions;
}

export const action = async ({
	request,
}: ActionFunctionArgs): Promise<NewGameResponse> => {
	const fieldValues = await validator.validate(await request.formData());
	if (fieldValues.error) {
		throw new Response("Validation error", { status: 400 });
	}
	const { name, topic, language, questionCount } = fieldValues.data;

	const user = await db.insert(users).values({ name }).returning();
	const game = await db
		.insert(games)
		.values({
			owner: user[0].id,
			topic,
			language,
			questionCount,
		})
		.returning();

	return {
		gameId: game[0].id.toString(),
		userId: user[0].id.toString(),
		game: { questions: [] },
	};
};

export default function Index() {
	const { defaultValues } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const fetcher = useFetcher<NewGameResponse>();
	const setGameData = useGameStore((state) => state.setGameData);

	React.useEffect(() => {
		if (fetcher.data) {
			setGameData(Number(fetcher.data.userId), fetcher.data.game);
			navigate("/quizz");
		}
	}, [fetcher.data, setGameData, navigate]);

	return (
		<div className="container mx-auto flex flex-col items-center justify-center h-screen">
			<h1 className="text-4xl font-bold">Quiz App</h1>
			<ValidatedForm
				validator={validator}
				defaultValues={defaultValues}
				fetcher={fetcher}
			>
				<Input name="name" label="Name" />
				<Input name="topic" label="Topic" />
				<RadioGroup
					name="language"
					options={[
						{ value: "english", label: "English" },
						{ value: "spanish", label: "Spanish" },
					]}
				/>
				<Select
					name="questionCount"
					label="Question Count"
					options={[
						{ value: "10", label: "10" },
						{ value: "20", label: "20" },
						{ value: "30", label: "30" },
					]}
				/>
				<button className="btn btn-accent" type="submit">
					Submit
				</button>
			</ValidatedForm>
		</div>
	);
}

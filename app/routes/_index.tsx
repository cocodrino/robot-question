import type { MetaFunction } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { route } from "routes-gen";
import { z } from "zod";
import React from "react";

import { Input } from "../components/input";
import { RadioGroup } from "../components/radio-group";
import { Select } from "../components/select";
import db from "../db";
import { type Game, games, User, users } from "../db/schema";

export const meta: MetaFunction = () => {
	return [
		{
			title: "A Quiz App built with AI",
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

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const fieldValues = await validator.validate(formData);

		if (fieldValues.error) {
			return validationError(fieldValues.error);
		}

		const { name, topic, language, questionCount } = fieldValues.data;

		// Verificar conexión a la base de datos
		try {
			await db.select().from(users).limit(1);
		} catch (error) {
			console.error("Error de conexión a la base de datos:", error);
			return json({ error: "Database connection error" }, { status: 500 });
		}

		// Crear usuario
		const [user] = await db.insert(users).values({ name }).returning();
		if (!user) {
			return json({ error: "Failed to create user" }, { status: 500 });
		}

		// Crear juego
		const [game] = await db
			.insert(games)
			.values({
				owner: user.id,
				topic,
				language,
				questionCount,
				questions: [],
			})
			.returning();

		if (!game) {
			return json({ error: "Failed to create game" }, { status: 500 });
		}

		return redirect(`/quizz?userId=${user.id}&gameId=${game.id}`);
	} catch (error) {
		console.error("Error in action:", error);
		return json({ error: "Internal server error" }, { status: 500 });
	}
};

export default function Index() {
	const { defaultValues } = useLoaderData<typeof loader>();

	return (
		<div className="container mx-auto flex flex-col items-center justify-center h-screen">
			<h1 className="text-4xl font-bold">Quiz App</h1>

			<ValidatedForm
				validator={validator}
				method="post"
				defaultValues={defaultValues}
				className="flex flex-col gap-4"
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

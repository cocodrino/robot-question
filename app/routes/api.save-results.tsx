import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "~/db";
import { gameRankings } from "~/db/schema";

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const data = await request.json();
		const { userId, gameId, score } = data;

		if (!userId || !gameId) {
			return json({ error: "Missing required data" }, { status: 400 });
		}

		await db.insert(gameRankings).values({
			userId,
			gameId,
			score,
		});

		return json({ success: true });
	} catch (error) {
		console.error("Error saving results:", error);
		return json({ error: "Failed to save results" }, { status: 500 });
	}
};

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import db from "~/db";
import { gameRankings, users } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import QRCode from "react-qr-code";
import { ClientOnlyWrapper } from "~/components/remix-helpers/ClientOnlyWrapper";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const userId = url.searchParams.get("userId");
	const gameId = url.searchParams.get("gameId");

	if (!userId || !gameId) {
		console.log("missing userId or gameId, redirecting to home");
		return redirect("/");
	}

	const rankings = await db
		.select({
			userId: gameRankings.userId,
			score: gameRankings.score,
			userName: users.name,
		})
		.from(gameRankings)
		.leftJoin(users, eq(gameRankings.userId, users.id))
		.where(eq(gameRankings.gameId, gameId))
		.orderBy(desc(gameRankings.score));

	// Encontrar la posición del usuario actual
	const userPosition = rankings.findIndex((r) => r.userId === userId) + 1;

	return json({
		rankings,
		userPosition,
		appUrl: process.env.APP_URL || "localhost:5174",
	});
};

export default function Results() {
	const { rankings, userPosition, appUrl } = useLoaderData<typeof loader>();
	const [searchParams] = useSearchParams();
	const gameId = searchParams.get("gameId");

	return (
		<div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
			<h1 className="text-4xl   mb-8 silkscreen-regular font-bold text-lime-500">
				GAME COMPLETED
			</h1>

			<div className="flex flex-col items-center justify-center">
				<h2 className="text-2xl font-bold mb-4 silkscreen-regular">
					YOUR SCORE:
				</h2>

				<p className="text-xl mb-2">
					Position:{" "}
					<span className="text-lime-500 silkscreen-regular">
						#{userPosition}
					</span>
				</p>
				<p className="text-xl mb-2">
					Points:{" "}
					<span className="text-lime-500 silkscreen-regular">
						{rankings[userPosition - 1]?.score || 0}
					</span>
				</p>
			</div>

			<div className="p-8 rounded-lg shadow-lg w-full max-w-2xl">
				<h2 className="text-2xl font-bold mb-4 silkscreen-regular">RANKING:</h2>
				<div className="space-y-4">
					{rankings.map((ranking, index) => (
						<div
							key={ranking.userId}
							className={`flex justify-between items-center p-4 rounded-lg ${
								index === userPosition - 1 ? "bg-lime-600" : "bg-black"
							}`}
						>
							<div className="flex items-center gap-4">
								<span className="text-xl font-bold">#{index + 1}</span>
								<span className="text-lg">{ranking.userName}</span>
							</div>
							<span className="text-xl font-bold">{ranking.score} pts</span>
						</div>
					))}
				</div>

				<div className="flex items-center justify-center mt-8">
					<h3 className="silkscreen-regular">Share Game with Friends:</h3>
					<div className="flex items-center justify-center">
						<Link
							to={`${appUrl}?game=${gameId}`}
							className="text-lime-500 silkscreen-regular underline"
						>
							{`${appUrl}/?game=${gameId}`}
						</Link>
					</div>
					<div className="bg-white m-0 w-28">
						<ClientOnlyWrapper>
							<QRCode
								value={`${appUrl}?game=${gameId}`}
								size={256}
								style={{ height: "auto", maxWidth: "100%", width: "100%" }}
							/>
						</ClientOnlyWrapper>
					</div>
				</div>

				<div className="flex items-center justify-center mt-8">
					<Link to="/" className="text-lime-500 silkscreen-regular underline">
						Play Again
					</Link>
				</div>
			</div>
		</div>
	);
}

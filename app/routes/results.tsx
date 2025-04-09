import { useGameStore } from "~/store/gameStore";
import { Link } from "@remix-run/react";

export default function Results() {
	const { correctAnswerCount, game, reset } = useGameStore();
	const totalQuestions = game?.questions.length || 0;

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
				<h1 className="text-3xl font-bold text-center mb-6">Quiz Results</h1>

				<div className="text-center mb-8">
					<p className="text-4xl font-bold text-green-600 mb-2">
						{correctAnswerCount}/{totalQuestions}
					</p>
					<p className="text-gray-600">Correct Answers</p>
				</div>

				<div className="text-center">
					<p className="text-xl mb-4">
						{((correctAnswerCount / totalQuestions) * 100).toFixed(0)}% Score
					</p>
				</div>

				<div className="mt-8">
					<Link
						to="/"
						onClick={reset}
						className="block w-full bg-blue-500 text-white py-3 px-4 rounded-lg text-center hover:bg-blue-600 transition-colors"
					>
						Start New Quiz
					</Link>
				</div>
			</div>
		</div>
	);
}

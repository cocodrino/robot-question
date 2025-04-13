import { useGameStore } from "~/store/gameStore";
import Question from "./question";
import { useEffect, useState } from "react";
import type { GameQuestion } from "~/types/game-questions";
import { useNavigate, useSubmit } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import db from "~/db";
import { gameRankings } from "~/db/schema";
import { AnimatedPopup } from "./animated-popup";

interface QuestionBuilderProps {
	onSaveResults: (data: {
		userId: string;
		gameId: string;
		score: number;
	}) => void;
}

export default function QuestionBuilder({
	onSaveResults,
}: QuestionBuilderProps) {
	const {
		game,
		questionIndex,
		setQuestionIndex,
		setCorrectAnswerCount,
		setFeedback,
	} = useGameStore();
	const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
	const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

	const currentQuestion = game?.questions[questionIndex] as
		| GameQuestion
		| undefined;

	const handleAnswer = async (answer: string) => {
		setSelectedAnswer(answer);
		setShowCorrectAnswer(true);
		const isAnswerCorrect = answer === currentQuestion?.rightAnswer.text;
		setFeedback(isAnswerCorrect ? "right" : "wrong");
		if (isAnswerCorrect) {
			setCorrectAnswerCount(useGameStore.getState().correctAnswerCount + 1);
		}

		setTimeout(async () => {
			setFeedback("hidden");
			if (questionIndex < (game?.questions.length ?? 0) - 1) {
				setQuestionIndex(questionIndex + 1);
				setSelectedAnswer(undefined);
				setShowCorrectAnswer(false);
			} else {
				const {
					userId,
					game: currentGame,
					correctAnswerCount: count,
				} = useGameStore.getState();
				const score = (count || 0) * 100;

				onSaveResults({
					userId: userId || "",
					gameId: currentGame?.id || "",
					score,
				});
			}
		}, 3000);
	};

	if (!currentQuestion) {
		return <div className="text-center text-xl">Loading...</div>;
	}

	return (
		<>
			<Question
				question={currentQuestion.question}
				options={currentQuestion.options}
				rightAnswer={currentQuestion.rightAnswer}
				onAnswer={handleAnswer}
				selectedAnswer={selectedAnswer}
				showCorrectAnswer={showCorrectAnswer}
			/>
		</>
	);
}

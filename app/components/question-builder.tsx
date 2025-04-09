import { useGameStore } from "~/store/gameStore";
import Question from "./question";
import { useEffect, useState } from "react";
import type { GameQuestion } from "~/types/game-questions";

export default function QuestionBuilder() {
	const { game, questionIndex, setQuestionIndex, setCorrectAnswerCount } =
		useGameStore();
	const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
	const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

	const currentQuestion = game?.questions[questionIndex] as
		| GameQuestion
		| undefined;

	const handleAnswer = (answer: string) => {
		setSelectedAnswer(answer);
		setShowCorrectAnswer(true);

		if (answer === currentQuestion?.rightAnswer.text) {
			setCorrectAnswerCount(useGameStore.getState().correctAnswerCount + 1);
		}

		setTimeout(() => {
			if (questionIndex < (game?.questions.length ?? 0) - 1) {
				setQuestionIndex(questionIndex + 1);
				setSelectedAnswer(undefined);
				setShowCorrectAnswer(false);
			} else {
				window.location.href = "/results";
			}
		}, 3000);
	};

	if (!currentQuestion) {
		return <div className="text-center text-xl">Loading...</div>;
	}

	return (
		<Question
			question={currentQuestion.question}
			options={currentQuestion.options}
			rightAnswer={currentQuestion.rightAnswer}
			onAnswer={handleAnswer}
			selectedAnswer={selectedAnswer}
			showCorrectAnswer={showCorrectAnswer}
		/>
	);
}

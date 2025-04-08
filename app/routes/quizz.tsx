import { useGameStore } from "~/store/gameStore";

export default function Quizz() {
	const { gameQuestions, questionIndex, setQuestionIndex, userId } =
		useGameStore();

	return (
		<div>
			<h1>Quizz for user {userId}</h1>
			<p>{gameQuestions?.questions[questionIndex].question}</p>
			<button type="button" onClick={() => setQuestionIndex(questionIndex + 1)}>
				Next
			</button>
		</div>
	);
}

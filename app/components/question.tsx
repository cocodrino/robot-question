import type { GameQuestion as GameQuestionType } from "~/types/game-questions";

interface QuestionProps extends GameQuestionType {
	onAnswer: (option: string) => void;
	selectedAnswer?: string;
	showCorrectAnswer?: boolean;
}

export default function Question({
	question,
	options,
	rightAnswer,
	onAnswer,
	selectedAnswer,
	showCorrectAnswer,
}: QuestionProps) {
	return (
		<div className="p-5 max-w-2xl mx-auto silkscreen-regular">
			<h2 className="text-2xl font-light mb-12">{question}</h2>
			<div className="flex flex-col gap-3">
				{options.map((option) => {
					const isSelected = selectedAnswer === option;
					const isCorrect = option === rightAnswer.text;

					// Determine the button's class
					let buttonClass =
						"p-3 rounded-lg border-2 transition-all duration-300";

					if (showCorrectAnswer) {
						// When showing answers
						if (isCorrect) {
							// If this is the correct answer, always show green
							buttonClass += " bg-lime-400 border-lime-400 text-black";
						} else if (isSelected) {
							// If this option was selected but is incorrect
							buttonClass += " bg-red-500 border-red-500";
						} else {
							// Other options remain white
							buttonClass += "border-lime-400";
						}
					} else {
						// When not showing answers yet
						buttonClass += isSelected
							? " bg-gray-200 border-lime-400"
							: "border-lime-400 hover:bg-lime-400 hover:text-black";
					}

					return (
						<button
							type="button"
							key={`${question}-${option}`}
							onClick={() => onAnswer(option)}
							className={buttonClass}
							disabled={showCorrectAnswer}
						>
							{option}
						</button>
					);
				})}
			</div>
		</div>
	);
}

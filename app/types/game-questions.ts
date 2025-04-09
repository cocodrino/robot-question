export interface GameQuestion {
    question: string;
    options: string[];
    rightAnswer: { number: number, text: string };
}

export interface GameQuestions {
    questions: GameQuestion[];

}

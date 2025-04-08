export interface GameQuestions {
    questions: {
        question: string;
        options: string[];
        rightAnswer: number;
    }[];
}
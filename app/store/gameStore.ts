import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameQuestions } from "../types/game-questions";
import type { Game as DbGame } from "~/db/schema";

interface Game extends DbGame {
    questions: GameQuestions[];
}

interface GameState {
    userId: string | null;

    setGameData: (userId: string, gameQuestions: Game) => void;
    questionIndex: number;
    setQuestionIndex: (questionIndex: number) => void;
    correctAnswerCount: number;
    setCorrectAnswerCount: (correctAnswerCount: number) => void;
    reset: () => void;
    game: Game | null;
}

export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            userId: null,
            questionIndex: 0,
            correctAnswerCount: 0,
            game: null,
            setGameData: (userId, game) => set({ userId, game, questionIndex: 0, correctAnswerCount: 0 }),
            setQuestionIndex: (questionIndex) => set({ questionIndex }),
            setCorrectAnswerCount: (correctAnswerCount) => set({ correctAnswerCount }),
            reset: () => set({ userId: null, game: null, questionIndex: 0, correctAnswerCount: 0 }),
        }),
        {
            name: "color-game-storage",
        }
    )
);
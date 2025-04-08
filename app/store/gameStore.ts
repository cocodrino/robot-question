import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameQuestions } from "../types/game-questions";

interface GameState {
    userId: number | null;
    gameQuestions: GameQuestions | null;
    setGameData: (userId: number, gameQuestions: GameQuestions) => void;
    questionIndex: number;
    setQuestionIndex: (questionIndex: number) => void;
    correctAnswerCount: number;
    setCorrectAnswerCount: (correctAnswerCount: number) => void;
    reset: () => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            userId: null,
            gameQuestions: null,
            questionIndex: 0,
            correctAnswerCount: 0,
            setGameData: (userId, gameQuestions) => set({ userId, gameQuestions, questionIndex: 0, correctAnswerCount: 0 }),
            setQuestionIndex: (questionIndex) => set({ questionIndex }),
            setCorrectAnswerCount: (correctAnswerCount) => set({ correctAnswerCount }),
            reset: () => set({ userId: null, gameQuestions: null, questionIndex: 0, correctAnswerCount: 0 }),
        }),
        {
            name: "color-game-storage",
        }
    )
);
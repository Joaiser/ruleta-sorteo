import React, { useState, useEffect, useRef } from 'react';
import "@/styles/global.css";

type ChanceModifier = {
    prizeId?: string;
    chanceDelta: number;
};

type Answer = {
    text: string;
    isCorrect: boolean;
    chanceModifiers?: ChanceModifier[];
};

type Question = {
    _id: string;
    phase: number;
    questionText: string;
    timeLimitSeconds: number;
    answers: Answer[];
};

export function Quiz({ onClose }: { onClose: () => void }) {
    const [phase, setPhase] = useState(1);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizOver, setQuizOver] = useState(false);
    const [quizWon, setQuizWon] = useState(false);
    const [initialCountdown, setInitialCountdown] = useState(3);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
    const [answerResult, setAnswerResult] = useState<"correct" | "incorrect" | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const res = await fetch(`/api/quiz/getQuestions?phase=${phase}`);
                const data: Question[] = await res.json();
                setQuestions(data);
                setCurrentIndex(0);
                if (data.length > 0) {
                    setTimeLeft(data[0].timeLimitSeconds);
                    setInitialCountdown(3);
                } else {
                    setQuizOver(true);
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
                setQuizOver(true);
            }
        }
        fetchQuestions();
    }, [phase]);

    useEffect(() => {
        if (initialCountdown > 0) {
            const countdown = setTimeout(() => {
                setInitialCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearTimeout(countdown);
        }
    }, [initialCountdown]);

    useEffect(() => {
        if (questions.length === 0 || quizOver || initialCountdown > 0) return;

        if (timeLeft === 0) {
            clearTimer();
            setQuizOver(true);
            setQuizWon(false);
            return;
        }

        timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimer();
    }, [timeLeft, questions, quizOver, initialCountdown]);

    function clearTimer() {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }

    function handleAnswer(selected: Answer, index: number) {
        clearTimer();
        setSelectedAnswerIndex(index);
        setAnswerResult(selected.isCorrect ? "correct" : "incorrect");

        setTimeout(() => {
            if (!selected.isCorrect) {
                setQuizOver(true);
                setQuizWon(false);
                return;
            }

            if (currentIndex + 1 < questions.length) {
                setCurrentIndex(currentIndex + 1);
                setTimeLeft(questions[currentIndex + 1].timeLimitSeconds);
            } else {
                const nextPhase = phase + 1;
                if (nextPhase <= 4) {
                    setQuizWon(true);
                    setQuizOver(true);
                    sendResultsToServer();
                } else {
                    setPhase(nextPhase);
                }
            }

            setSelectedAnswerIndex(null);
            setAnswerResult(null);
        }, 1500);
    }

    async function sendResultsToServer() {
        try {
            await fetch('/api/quiz/front/submitQuiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ success: true, phase }),
            });
        } catch (error) {
            console.error("Error sending quiz results:", error);
        }
    }

    if (quizOver) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl shadow-md max-w-md mx-auto space-y-6 animate-fade-in">
                <div className="text-6xl">{quizWon ? "🎉" : "❌"}</div>
                <h2 className={`text-3xl font-bold ${quizWon ? "text-green-600" : "text-red-600"}`}>
                    {quizWon ? "¡Enhorabuena!" : "Has fallado"}
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                    {quizWon
                        ? `Has completado la fase ${phase}. Tus probabilidades han sido actualizadas.`
                        : "No pasa nada, puedes volver a intentarlo."}
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
                >
                    Cerrar
                </button>
            </div>
        );
    }

    if (questions.length === 0) {
        return <p className="text-white text-center">⏳ Cargando preguntas...</p>;
    }

    const currentQuestion = questions[currentIndex];

    if (initialCountdown > 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-black text-6xl font-bold animate-pulse transition-all duration-500 ease-out">
                {initialCountdown}
            </div>
        );
    }

    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-md max-w-xl mx-auto text-white animate-fade-in">
            <div className="flex justify-between items-center mb-4 text-sm text-gray-400">
                <span>Fase {phase} / 4</span>
                <span>⏱️ {timeLeft} segundos</span>
            </div>

            <h3 className="text-xl font-semibold mb-6 text-center leading-relaxed">
                {currentQuestion?.questionText || "Sin pregunta disponible"}
            </h3>

            <div className="space-y-4">
                {currentQuestion.answers.map((answer, i) => {
                    const isSelected = i === selectedAnswerIndex;
                    const base = "w-full block text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium text-white shadow-sm focus:outline-none";

                    let styles = "cursor-pointer bg-gray-800 hover:bg-gray-700";
                    if (selectedAnswerIndex !== null) {
                        if (isSelected && answerResult === "correct") {
                            styles = "bg-green-600";
                        } else if (isSelected && answerResult === "incorrect") {
                            styles = "bg-red-600";
                        } else {
                            styles = "bg-gray-700 opacity-60";
                        }
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleAnswer(answer, i)}
                            className={`${base} ${styles}`}
                            disabled={selectedAnswerIndex !== null}
                        >
                            {answer.text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

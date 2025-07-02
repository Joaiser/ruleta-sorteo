import React, { useEffect, useState } from "react";

export type ChanceModifier = {
    prizeId?: string; // o ObjectId en backend
    chanceDelta: number;
}

export type Answer = {
    text: string;
    isCorrect: boolean;
    chanceModifiers: ChanceModifier[];
}

export type Question = {
    _id?: string;
    order: number;
    questionText: string;
    timeLimitSeconds: number;
    answers: Answer[];
}


export function QuizQuestionList() {
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            fetch('/api/quiz/getQuestions')
                .then(res => res.json())
                .then(data => setQuestions(data))
                .catch(err => console.error(err));
        }
    }, []);

    return (
        <div className="space-y-6">
            {questions.length === 0 ? (
                <p className="text-white/70">No hay preguntas aún.</p>
            ) : (
                questions.map((q) => (
                    <div
                        key={q._id}
                        className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow"
                    >
                        <h3 className="text-lg font-bold mb-2">
                            {q.order}. {q.questionText}{" "}
                            <span className="text-sm text-white/50">(⏱️ {q.timeLimitSeconds}s)</span>
                        </h3>

                        <ul className="space-y-2">
                            {q.answers.map((a, index) => (
                                <li
                                    key={index}
                                    className={`p-2 rounded border ${a.isCorrect
                                        ? "border-green-600 bg-green-900/20"
                                        : "border-white/10"
                                        }`}
                                >
                                    <span className="font-medium">{a.text}</span>
                                    {a.chanceModifiers?.length > 0 && (
                                        <div className="text-sm text-white/60 mt-1">
                                            🎯 Modificador:{" "}
                                            {a.chanceModifiers
                                                .map((mod) => `${mod.chanceDelta}%`)
                                                .join(", ")}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
}
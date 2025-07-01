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
        fetch('/api/quiz/getQuestions')
            .then(res => res.json())
            .then(data => setQuestions(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            {questions.length === 0 ? (
                <p>No hay preguntas aún.</p>
            ) : (
                <ul>
                    {questions.map(q => (
                        <li key={q._id}>
                            <strong>{q.order}. {q.questionText}</strong> (Tiempo: {q.timeLimitSeconds}s)
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

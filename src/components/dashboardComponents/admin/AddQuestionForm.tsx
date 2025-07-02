import React, { useState } from 'react';
import type { Answer, ChanceModifier, Question } from './QuizQuestionList';


export function AddQuestionForm() {
    const [questionText, setQuestionText] = useState("");
    const [order, setOrder] = useState(1);
    const [timeLimitSeconds, setTimeLimitSeconds] = useState(20);
    const [answers, setAnswers] = useState<Answer[]>([
        { text: "", isCorrect: false, chanceModifiers: [{ chanceDelta: 0 }] },
        { text: "", isCorrect: false, chanceModifiers: [{ chanceDelta: 0 }] },
    ]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    //añadir una respuesta vacia
    const addAnswer = () => {
        setAnswers([...answers, { text: "", isCorrect: false, chanceModifiers: [{ chanceDelta: 0 }] }]);
    }

    //actualizar texto o chanceDelta o marcarla como correcta
    const updateAnswer = (
        index: number,
        field: "text" | "chanceDelta" | "isCorrect",
        value: string | number | boolean
    ) => {
        setAnswers((prev) =>
            prev.map((ans, i) => {
                if (i !== index) {
                    // Si marcan esta como correcta, el resto debe quedar false
                    if (field === "isCorrect" && value === true) {
                        return { ...ans, isCorrect: false };
                    }
                    return ans;
                }
                // Actualizar campo del índice correcto
                if (field === "text") {
                    return { ...ans, text: value as string };
                }
                if (field === "chanceDelta") {
                    return {
                        ...ans,
                        chanceModifiers: [{ chanceDelta: Number(value) }],
                    };
                }
                if (field === "isCorrect") {
                    return { ...ans, isCorrect: value as boolean };
                }
                return ans;
            })
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!questionText.trim()) {
            setErrorMsg("El texto de la pregunta es obligatorio");
            return;
        }
        if (answers.length < 2) {
            setErrorMsg("Debes añadir al menos dos respuestas");
            return;
        }
        if (!answers.some((a) => a.isCorrect)) {
            setErrorMsg("Debes marcar una respuesta correcta");
            return;
        }
        if (answers.some((a) => !a.text.trim())) {
            setErrorMsg("Todas las respuestas deben tener texto");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/quiz/addQuestion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order,
                    questionText,
                    timeLimitSeconds,
                    answers,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al crear la pregunta");
            }
            setSuccessMsg("Pregunta añadida correctamente");
            // Reset form
            setQuestionText("");
            setAnswers([
                { text: "", isCorrect: false, chanceModifiers: [{ chanceDelta: 0 }] },
                { text: "", isCorrect: false, chanceModifiers: [{ chanceDelta: 0 }] },
            ]);
            setOrder(order + 1);
            setTimeLimitSeconds(20);
        } catch (error: any) {
            setErrorMsg(error.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className=" p-6 bg-gray-900 rounded-xl shadow-lg space-y-6"
        >
            <h2 className="text-2xl font-extrabold mb-6 text-white">➕ Añadir Nueva Pregunta</h2>

            <label className="block">
                <span className="text-gray-300 font-semibold mb-1 block">Orden (número):</span>
                <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </label>

            <label className="block">
                <span className="text-gray-300 font-semibold mb-1 block">Texto de la pregunta:</span>
                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={4}
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe la pregunta aquí..."
                    required
                />
            </label>

            <label className="block">
                <span className="text-gray-300 font-semibold mb-1 block">Tiempo límite (segundos):</span>
                <input
                    type="number"
                    min={5}
                    max={60}
                    value={timeLimitSeconds}
                    onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </label>

            <legend className="text-white font-semibold mb-2.5">Respuestas</legend>

            <fieldset className="border border-gray-700 rounded-lg p-4 bg-gray-800">


                {answers.map((answer, i) => (
                    <div key={i} className="mb-3 flex items-center gap-3">
                        <input
                            type="radio"
                            name="correctAnswer"
                            checked={answer.isCorrect}
                            onChange={() => updateAnswer(i, "isCorrect", true)}
                            required
                            className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                            title="Marcar como respuesta correcta"
                        />

                        <input
                            type="text"
                            placeholder={`Respuesta ${i + 1}`}
                            value={answer.text}
                            onChange={(e) => updateAnswer(i, "text", e.target.value)}
                            className="flex-grow rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={answer.chanceModifiers[0]?.chanceDelta ?? 0}
                            onChange={(e) => updateAnswer(i, "chanceDelta", Number(e.target.value))}
                            className="w-24 rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Modificador de probabilidad (%)"
                        />
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addAnswer}
                    className="mt-2 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-transform transform hover:scale-105"
                >
                    + Añadir respuesta
                </button>
            </fieldset>

            {errorMsg && (
                <div className="bg-red-700/90 border border-red-500 text-white px-4 py-2 rounded-lg shadow">
                    ⚠️ {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="bg-green-700/90 border border-green-500 text-white px-4 py-2 rounded-lg shadow">
                    ✅ {successMsg}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow transition-colors"
            >
                {loading ? "Guardando..." : "Guardar Pregunta"}
            </button>
        </form>
    );
}

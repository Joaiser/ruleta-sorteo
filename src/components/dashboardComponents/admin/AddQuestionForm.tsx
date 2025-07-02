import React, { useEffect, useState } from "react";
import type { Answer, ChanceModifier } from "./QuizQuestionList";
import type { Prize } from "@/pages/dashboardAdmin/types/prize";
import PrizeCreator from "./PrizeCreator";

export function AddQuestionForm() {
    const [questionText, setQuestionText] = useState("");
    const [phase, setPhase] = useState(1);
    const [timeLimitSeconds, setTimeLimitSeconds] = useState(30);
    const [answers, setAnswers] = useState<Answer[]>([
        { text: "", isCorrect: false, chanceModifiers: [] },
        { text: "", isCorrect: false, chanceModifiers: [] },
    ]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [prizes, setPrizes] = useState<Prize[]>([]);
    // Estado para controlar creación de premio por modificador: {answerIdx: number, modIdx: number} o null
    const [creatingPrizeFor, setCreatingPrizeFor] = useState<{
        answerIdx: number;
        modIdx: number;
    } | null>(null);

    // Añadir respuesta vacía
    const addAnswer = () => {
        setAnswers([...answers, { text: "", isCorrect: false, chanceModifiers: [] }]);
    };

    // Actualizar texto o marcar como correcta
    const updateAnswer = (
        index: number,
        field: "text" | "isCorrect",
        value: string | boolean
    ) => {
        setAnswers((prev) =>
            prev.map((ans, i) => {
                if (i !== index) {
                    if (field === "isCorrect" && value === true) {
                        return { ...ans, isCorrect: false };
                    }
                    return ans;
                }
                if (field === "text") {
                    return { ...ans, text: value as string };
                }
                if (field === "isCorrect") {
                    return { ...ans, isCorrect: value as boolean };
                }
                return ans;
            })
        );
    };

    // Añadir chanceModifier vacío a una respuesta
    const addChanceModifier = (answerIndex: number) => {
        if (prizes.length === 0) return; // Sin premios no tiene sentido
        setAnswers((prev) =>
            prev.map((ans, i) => {
                if (i !== answerIndex) return ans;
                // Añadir chanceModifier con el primer premio como default y chanceDelta 0
                return {
                    ...ans,
                    chanceModifiers: [
                        ...ans.chanceModifiers,
                        { prizeId: prizes[0]._id!, chanceDelta: 0 },
                    ],
                };
            })
        );
    };

    // Cambiar premio (prizeId) en un chanceModifier concreto
    const changeModifierPrize = (
        answerIndex: number,
        modifierIndex: number,
        newPrizeId: string
    ) => {
        setAnswers((prev) =>
            prev.map((ans, i) => {
                if (i !== answerIndex) return ans;
                const newModifiers = [...ans.chanceModifiers];
                newModifiers[modifierIndex] = {
                    ...newModifiers[modifierIndex],
                    prizeId: newPrizeId,
                };
                return { ...ans, chanceModifiers: newModifiers };
            })
        );
    };

    // Cambiar chanceDelta de un chanceModifier concreto
    const changeModifierChanceDelta = (
        answerIndex: number,
        modifierIndex: number,
        newChanceDelta: number
    ) => {
        setAnswers((prev) =>
            prev.map((ans, i) => {
                if (i !== answerIndex) return ans;
                const newModifiers = [...ans.chanceModifiers];
                newModifiers[modifierIndex] = {
                    ...newModifiers[modifierIndex],
                    chanceDelta: newChanceDelta,
                };
                return { ...ans, chanceModifiers: newModifiers };
            })
        );
    };

    // Eliminar un chanceModifier de una respuesta
    const removeChanceModifier = (answerIndex: number, modifierIndex: number) => {
        setAnswers((prev) =>
            prev.map((ans, i) => {
                if (i !== answerIndex) return ans;
                const newModifiers = ans.chanceModifiers.filter(
                    (_, idx) => idx !== modifierIndex
                );
                return { ...ans, chanceModifiers: newModifiers };
            })
        );
    };

    const handlePrizeCreate = (newPrize: Prize) => {
        if (!creatingPrizeFor) return;

        // Actualizar lista de premios
        setPrizes((prev) => [...prev, newPrize]);

        // Asignar el nuevo premio al modificador concreto
        changeModifierPrize(creatingPrizeFor.answerIdx, creatingPrizeFor.modIdx, newPrize._id!);

        // Cerrar formulario creación
        setCreatingPrizeFor(null);
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
                    phase,
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
                { text: "", isCorrect: false, chanceModifiers: [] },
                { text: "", isCorrect: false, chanceModifiers: [] },
            ]);
            setPhase(phase + 1);
            setTimeLimitSeconds(30);
        } catch (error: any) {
            setErrorMsg(error.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    // Cargar premios
    useEffect(() => {
        async function fetchPrizes() {
            try {
                const res = await fetch("/api/prize");
                const data: Prize[] = await res.json();
                setPrizes(data);
            } catch (error) {
                console.error("Error fetching prizes:", error);
            }
        }
        fetchPrizes();
    }, []);

    return (
        <form
            onSubmit={handleSubmit}
            className="p-6 bg-gray-900 rounded-xl shadow-lg space-y-6 mb-3"
        >
            <h2 className="text-2xl font-extrabold mb-6 text-white">
                ➕ Añadir Nueva Pregunta
            </h2>

            <label className="block">
                <span className="text-gray-300 font-semibold mb-1 block">Fase:</span>
                <input
                    type="number"
                    min={1}
                    value={phase}
                    onChange={(e) => setPhase(Number(e.target.value))}
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </label>

            <label className="block">
                <span className="text-gray-300 font-semibold mb-1 block">
                    Texto de la pregunta:
                </span>
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
                <span className="text-gray-300 font-semibold mb-1 block">
                    Tiempo límite (segundos):
                </span>
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

            <fieldset className="border border-gray-700 rounded-lg p-4 bg-gray-800 space-y-6">
                {answers.map((answer, i) => (
                    <div key={i} className="border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-3 mb-3">
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
                        </div>

                        {/* Modificadores de probabilidad */}
                        <div className="ml-8 space-y-3">
                            {answer.chanceModifiers.map((modifier, modIdx) => (
                                <div
                                    key={`${modifier.prizeId}-${modIdx}`}
                                    className="flex flex-col gap-2 border-b border-gray-700 pb-3"
                                >
                                    <div className="flex items-center gap-3">
                                        {creatingPrizeFor?.answerIdx === i &&
                                            creatingPrizeFor?.modIdx === modIdx ? (
                                            <PrizeCreator
                                                onCreate={handlePrizeCreate}
                                                onCancel={() => setCreatingPrizeFor(null)}
                                            />
                                        ) : (
                                            <>
                                                <select
                                                    value={modifier.prizeId}
                                                    onChange={(e) => {
                                                        const newPrizeId = e.target.value;
                                                        // Evitar duplicados dentro del mismo modificador
                                                        if (
                                                            answer.chanceModifiers.some(
                                                                (m, idx) =>
                                                                    m.prizeId === newPrizeId && idx !== modIdx
                                                            )
                                                        ) {
                                                            alert(
                                                                "Ya tienes este premio asignado a otro modificador"
                                                            );
                                                            return;
                                                        }
                                                        changeModifierPrize(i, modIdx, newPrizeId);
                                                    }}
                                                    className="rounded-md bg-gray-700 border border-gray-600 px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {prizes.map((prize) => (
                                                        <option key={prize._id} value={prize._id}>
                                                            {prize.type === "discount"
                                                                ? `Descuento: ${prize.value}%`
                                                                : `Producto: ${prize.value}`}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    type="button"
                                                    onClick={() => setCreatingPrizeFor({ answerIdx: i, modIdx })}
                                                    className="text-green-500 font-bold px-2 py-1 rounded hover:text-green-700"
                                                    title="Crear premio nuevo"
                                                >
                                                    + Crear premio
                                                </button>
                                            </>
                                        )}

                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={modifier.chanceDelta}
                                            onChange={(e) =>
                                                changeModifierChanceDelta(i, modIdx, Number(e.target.value))
                                            }
                                            className="w-20 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            title="Modificador de probabilidad (%)"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeChanceModifier(i, modIdx)}
                                            className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded"
                                            title="Eliminar modificador"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => addChanceModifier(i)}
                                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-transform transform hover:scale-105"
                            >
                                + Añadir modificador de premio
                            </button>
                        </div>
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
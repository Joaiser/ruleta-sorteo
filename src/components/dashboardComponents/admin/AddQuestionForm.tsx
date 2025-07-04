import React, { useEffect, useState } from "react";
import type { Prize } from "@/pages/dashboardAdmin/types/prize";
import PrizeCreator from "./PrizeCreator";
import { useQuestionAnswers } from "@/hooks/useQuestionAnswers";
import { AnswerList } from "./AddQuestion/AnswerList";
import { PhaseInput } from "./AddQuestion/PhaseInput";
import { QuestionTextInput } from "./AddQuestion/QuestionTextInput";
import { TimeLimitInput } from "./AddQuestion/TimeLimitInput";
import { FormStatus } from "./AddQuestion/FormStatus";


export function AddQuestionForm() {
    const [questionText, setQuestionText] = useState("");
    const [phase, setPhase] = useState(1);
    const [timeLimitSeconds, setTimeLimitSeconds] = useState(30);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const {
        answers,
        setAnswers,
        creatingPrizeFor,
        setCreatingPrizeFor,
        lockedModifiers,
        setLockedModifiers,
        addAnswer,
        updateAnswer,
        addChanceModifier,
        changeModifierPrize,
        changeModifierChanceDelta,
        removeChanceModifier,
        handlePrizeCreate,
    } = useQuestionAnswers(phase);



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
        <>
            <form
                onSubmit={handleSubmit}
                className="p-6 bg-gray-900 rounded-xl shadow-lg space-y-6 mb-3"
            >
                <h2 className="text-2xl font-extrabold mb-6 text-white">
                    ➕ Añadir Nueva Pregunta
                </h2>

                <PhaseInput phase={phase} setPhase={setPhase} />
                <QuestionTextInput questionText={questionText} setQuestionText={setQuestionText} />
                <TimeLimitInput timeLimitSeconds={timeLimitSeconds} setTimeLimitSeconds={setTimeLimitSeconds} />

                {/* Respuestas */}
                <legend className="text-white font-semibold mb-2.5">Respuestas</legend>
                <AnswerList
                    answers={answers}
                    prizes={prizes}
                    lockedModifiers={lockedModifiers}
                    onUpdateAnswer={updateAnswer}
                    onAddModifier={addChanceModifier}
                    onRemoveModifier={removeChanceModifier}
                    onChangeModifierPrize={changeModifierPrize}
                    onChangeModifierChanceDelta={changeModifierChanceDelta}
                    onCreatePrize={(answerIdx, modIdx) => setCreatingPrizeFor({ answerIdx, modIdx })}
                    onAddAnswer={addAnswer}
                />

                <FormStatus error={errorMsg} success={successMsg} />


                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow"
                >
                    {loading ? "Guardando..." : "Guardar Pregunta"}
                </button>
            </form>

            {/* MODAL para creación de premio */}
            {creatingPrizeFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[400px]">
                        <PrizeCreator
                            onCreate={(newPrize) =>
                                handlePrizeCreate(
                                    newPrize,
                                    phase,
                                    prizes,
                                    setPrizes,
                                    setCreatingPrizeFor,
                                    setLockedModifiers
                                )
                            }
                            onCancel={() => setCreatingPrizeFor(null)}
                            phase={phase}
                            answerIndex={creatingPrizeFor.answerIdx}
                            modifierIndex={creatingPrizeFor.modIdx}
                            originalPrizeId={
                                answers[creatingPrizeFor.answerIdx].chanceModifiers[creatingPrizeFor.modIdx].prizeId
                            }
                        />
                    </div>
                </div>
            )}
        </>
    );

}
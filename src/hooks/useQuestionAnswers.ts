import { useState } from "react";
import type { Answer } from "@/components/dashboardComponents/admin/QuizQuestionList";
import type { Prize } from "@/pages/dashboardAdmin/types/prize";

export function useQuestionAnswers(initialPhase: number) {
    const [answers, setAnswers] = useState<Answer[]>([
        { text: "", isCorrect: false, chanceModifiers: [] },
        { text: "", isCorrect: false, chanceModifiers: [] },
    ]);

    const [creatingPrizeFor, setCreatingPrizeFor] = useState<{
        answerIdx: number;
        modIdx: number;
    } | null>(null);

    const [lockedModifiers, setLockedModifiers] = useState<
        { answerIdx: number; modIdx: number }[]
    >([]);

    // Añadir respuesta vacía
    const addAnswer = () => {
        setAnswers((prev) => [
            ...prev,
            { text: "", isCorrect: false, chanceModifiers: [] },
        ]);
    };

    // Actualizar campo de una respuesta
    const updateAnswer = (
        index: number,
        field: "text" | "isCorrect",
        value: string | boolean
    ) => {
        setAnswers((prev) =>
            prev.map((ans, i) => {
                if (i !== index) {
                    if (field === "isCorrect" && value === true) {
                        // solo una respuesta puede ser correcta
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
        setAnswers((prev) =>
            prev.map((ans, i) => {
                if (i !== answerIndex) return ans;
                return {
                    ...ans,
                    chanceModifiers: [
                        ...ans.chanceModifiers,
                        { modifierId: "", prizeId: "", chanceDelta: 0 },
                    ],
                };
            })
        );
    };

    // Cambiar prizeId de un modificador, creando o actualizando en BD
    const changeModifierPrize = async (
        answerIndex: number,
        modifierIndex: number,
        newPrizeId: string
    ) => {
        const modifier = answers[answerIndex].chanceModifiers[modifierIndex];

        if (!modifier.modifierId) {
            // Crear modificador en BD
            try {
                const res = await fetch("/api/prizes/createEmptyModifier", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prizeId: newPrizeId }),
                });

                if (!res.ok) throw new Error("Error al crear el modificador");
                const { modifierId } = await res.json();

                setAnswers((prev) =>
                    prev.map((ans, i) => {
                        if (i !== answerIndex) return ans;
                        const newModifiers = [...ans.chanceModifiers];
                        newModifiers[modifierIndex] = {
                            ...newModifiers[modifierIndex],
                            modifierId,
                            prizeId: newPrizeId,
                        };
                        return { ...ans, chanceModifiers: newModifiers };
                    })
                );
            } catch (err) {
                console.error("Error al crear modificador en BD", err);
                alert("No se pudo crear el modificador.");
            }
        } else {
            // Actualizar modificador en BD
            try {
                await fetch("/api/prizes/updateModifierPrize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        modifierId: modifier.modifierId,
                        prizeId: newPrizeId,
                    }),
                });

                setAnswers((prev) =>
                    prev.map((ans, i) => {
                        if (i !== answerIndex) return ans;
                        const newModifiers = [...ans.chanceModifiers];
                        newModifiers[modifierIndex].prizeId = newPrizeId;
                        return { ...ans, chanceModifiers: newModifiers };
                    })
                );
            } catch (err) {
                console.error("Error al actualizar el premio del modificador", err);
                alert("No se pudo actualizar el premio.");
            }
        }
    };

    // Cambiar chanceDelta de un chanceModifier concreto (update en BD y estado)
    const changeModifierChanceDelta = (
        answerIndex: number,
        modifierIndex: number,
        newChanceDelta: number
    ) => {
        const modifier = answers[answerIndex].chanceModifiers[modifierIndex];
        if (!modifier.modifierId) return;

        fetch("/api/prizes/updateModifierPrize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                modifierId: modifier.modifierId,
                chanceDelta: newChanceDelta,
            }),
        }).catch((err) => {
            console.error("Error al actualizar chanceDelta", err);
        });

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

    // Crear premio modificado nuevo en backend y actualizar estado
    const handlePrizeCreate = async (
        newPrize: Prize,
        phase: number,
        prizes: Prize[],
        setPrizes: React.Dispatch<React.SetStateAction<Prize[]>>,
        setCreatingPrizeFor: React.Dispatch<
            React.SetStateAction<{ answerIdx: number; modIdx: number } | null>
        >,
        setLockedModifiers: React.Dispatch<
            React.SetStateAction<{ answerIdx: number; modIdx: number }[]>
        >
    ) => {
        if (!creatingPrizeFor) return;

        const { answerIdx, modIdx } = creatingPrizeFor;

        const currentModifier = answers[answerIdx]?.chanceModifiers[modIdx];
        const originalPrizeId = currentModifier?.prizeId;

        if (!originalPrizeId) {
            alert("No se encontró el ID del premio original.");
            return;
        }

        try {
            await fetch("/api/prizes/createModifierPrize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalPrizeId,
                    newPrize: {
                        type: newPrize.type,
                        value: newPrize.value,
                        code: newPrize.code,
                        baseChance: newPrize.baseChance,
                    },
                    phase,
                    answerIndex: answerIdx,
                    modifierIndex: modIdx,
                }),
            });
        } catch (err) {
            console.error("Error creando prize modificado:", err);
            alert("Error al guardar el premio modificado.");
            return;
        }

        setPrizes([...prizes, newPrize]);

        setAnswers((prev) =>
            prev.map((ans, i) => {
                if (i !== answerIdx) return ans;
                const newModifiers = [...ans.chanceModifiers];
                const current = newModifiers[modIdx];
                newModifiers[modIdx] = {
                    ...current,
                    prizeId: newPrize._id!,
                };
                return { ...ans, chanceModifiers: newModifiers };
            })
        );

        setLockedModifiers((prev) => {
            const exists = prev.some(
                (lock) => lock.answerIdx === answerIdx && lock.modIdx === modIdx
            );
            return exists ? prev : [...prev, { answerIdx, modIdx }];
        });

        setCreatingPrizeFor(null);
    };

    return {
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
    };
}

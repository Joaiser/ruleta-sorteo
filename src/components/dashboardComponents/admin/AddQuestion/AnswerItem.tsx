import React from "react";
import type { Answer, ChanceModifier } from "../QuizQuestionList";
import type { Prize } from "@/pages/dashboardAdmin/types/prize";
import { ModifierItem } from "./ModifierItem";

type Props = {
    answer: Answer;
    index: number;
    prizes: Prize[];
    lockedModifiers: { answerIdx: number; modIdx: number }[];
    onUpdateAnswer: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
    onAddModifier: (index: number) => void;
    onRemoveModifier: (answerIdx: number, modIdx: number) => void;
    onChangeModifierPrize: (answerIdx: number, modIdx: number, prizeId: string) => void;
    onChangeModifierChanceDelta: (answerIdx: number, modIdx: number, delta: number) => void;
    onCreatePrize: (answerIdx: number, modIdx: number) => void;
};

export function AnswerItem({
    answer,
    index,
    prizes,
    lockedModifiers,
    onUpdateAnswer,
    onAddModifier,
    onRemoveModifier,
    onChangeModifierPrize,
    onChangeModifierChanceDelta,
    onCreatePrize,
}: Props) {
    return (
        <div className="border-b border-gray-700 pb-4">
            <div className="flex items-center gap-3 mb-3">
                <input
                    type="radio"
                    name="correctAnswer"
                    checked={answer.isCorrect}
                    onChange={() => onUpdateAnswer(index, "isCorrect", true)}
                    required
                    className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600"
                />
                <input
                    type="text"
                    placeholder={`Respuesta ${index + 1}`}
                    value={answer.text}
                    onChange={(e) => onUpdateAnswer(index, "text", e.target.value)}
                    className="flex-grow rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-white"
                    required
                />
            </div>

            <div className="ml-8 space-y-3">
                {answer.chanceModifiers.map((modifier: any, modIdx: any) => (
                    <ModifierItem
                        key={`${modifier.prizeId}-${modIdx}`}
                        modifier={modifier}
                        prizes={prizes}
                        answerIdx={index}
                        modIdx={modIdx}
                        locked={lockedModifiers.some(
                            (lock) => lock.answerIdx === index && lock.modIdx === modIdx
                        )}
                        onPrizeChange={onChangeModifierPrize}
                        onChanceDeltaChange={onChangeModifierChanceDelta}
                        onRemove={onRemoveModifier}
                        onCreatePrize={onCreatePrize}
                    />
                ))}

                <button
                    type="button"
                    onClick={() => onAddModifier(index)}
                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
                >
                    + Añadir modificador de premio
                </button>
            </div>
        </div>
    );
}

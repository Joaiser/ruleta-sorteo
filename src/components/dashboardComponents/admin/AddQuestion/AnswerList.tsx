import React from "react";
import type { Answer } from "@/components/dashboardComponents/admin/QuizQuestionList";
import type { Prize } from "@/pages/dashboardAdmin/types/prize";
import { AnswerItem } from "@/components/dashboardComponents/admin/AddQuestion/AnswerItem";

type AnswerListProps = {
    answers: Answer[];
    prizes: Prize[];
    lockedModifiers: { answerIdx: number; modIdx: number }[];
    onUpdateAnswer: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
    onAddModifier: (answerIndex: number) => void;
    onRemoveModifier: (answerIndex: number, modifierIndex: number) => void;
    onChangeModifierPrize: (answerIndex: number, modifierIndex: number, newPrizeId: string) => void;
    onChangeModifierChanceDelta: (answerIndex: number, modifierIndex: number, newChanceDelta: number) => void;
    onCreatePrize: (answerIdx: number, modIdx: number) => void;
    onAddAnswer: () => void;
};

export function AnswerList({
    answers,
    prizes,
    lockedModifiers,
    onUpdateAnswer,
    onAddModifier,
    onRemoveModifier,
    onChangeModifierPrize,
    onChangeModifierChanceDelta,
    onCreatePrize,
    onAddAnswer,
}: AnswerListProps) {
    return (
        <fieldset className="border border-gray-700 rounded-lg p-4 bg-gray-800 space-y-6">
            {answers.map((answer, i) => (
                <AnswerItem
                    key={i}
                    answer={answer}
                    index={i}
                    prizes={prizes}
                    lockedModifiers={lockedModifiers}
                    onUpdateAnswer={onUpdateAnswer}
                    onAddModifier={onAddModifier}
                    onRemoveModifier={onRemoveModifier}
                    onChangeModifierPrize={onChangeModifierPrize}
                    onChangeModifierChanceDelta={onChangeModifierChanceDelta}
                    onCreatePrize={onCreatePrize}
                />
            ))}

            <button
                type="button"
                onClick={onAddAnswer}
                className="mt-2 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
                + Añadir respuesta
            </button>
        </fieldset>
    );
}

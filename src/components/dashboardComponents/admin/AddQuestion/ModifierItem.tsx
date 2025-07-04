import React from "react";
import type { Prize } from "@/pages/dashboardAdmin/types/prize";
import type { ChanceModifier } from "../QuizQuestionList";

type ModifierItemProps = {
    modifier: ChanceModifier;
    prizes: Prize[];
    answerIdx: number;
    modIdx: number;
    locked: boolean;
    onPrizeChange: (answerIdx: number, modIdx: number, prizeId: string) => void;
    onChanceDeltaChange: (answerIdx: number, modIdx: number, delta: number) => void;
    onRemove: (answerIdx: number, modIdx: number) => void;
    onCreatePrize: (answerIdx: number, modIdx: number) => void;
};

export function ModifierItem({
    modifier,
    prizes,
    answerIdx,
    modIdx,
    locked,
    onPrizeChange,
    onChanceDeltaChange,
    onRemove,
    onCreatePrize,
}: ModifierItemProps) {
    return (
        <div className="flex items-center gap-3">
            <select
                value={modifier.prizeId}
                onChange={(e) => onPrizeChange(answerIdx, modIdx, e.target.value)}
                disabled={locked}
                className="rounded-md bg-gray-700 border border-gray-600 px-3 py-1 text-white disabled:opacity-60 disabled:cursor-not-allowed"
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
                onClick={() => onCreatePrize(answerIdx, modIdx)}
                className="text-green-500 font-bold px-2 py-1 rounded hover:text-green-700"
            >
                + Crear premio
            </button>

            <input
                type="number"
                min={0}
                max={100}
                value={modifier.chanceDelta}
                onChange={(e) =>
                    onChanceDeltaChange(answerIdx, modIdx, Number(e.target.value))
                }
                className="w-20 rounded-md bg-gray-700 border border-gray-600 px-2 py-1 text-white"
            />

            <button
                type="button"
                onClick={() => onRemove(answerIdx, modIdx)}
                className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded"
            >
                ×
            </button>
        </div>
    );
}

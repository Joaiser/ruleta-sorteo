import React from "react";

type Props = {
    timeLimitSeconds: number;
    setTimeLimitSeconds: (value: number) => void;
};

export function TimeLimitInput({ timeLimitSeconds, setTimeLimitSeconds }: Props) {
    return (
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
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-2 text-white"
                required
            />
        </label>
    );
}

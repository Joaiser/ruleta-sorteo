import React, { useState } from "react";
import { Ruleta } from "@/components/ruleta/ruleta";
import { ScratchCard } from "@/components/scratchCard/ScratchCard";

export function GameSelector() {
    const [selectedGame, setSelectedGame] = useState<"ruleta" | "scratch">("ruleta");

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
                <button
                    onClick={() => setSelectedGame("ruleta")}
                    className={`px-4 py-2 rounded ${selectedGame === "ruleta" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
                >
                    Ruleta
                </button>
                <button
                    onClick={() => setSelectedGame("scratch")}
                    className={`px-4 py-2 rounded ${selectedGame === "scratch" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
                >
                    Rasca y gana
                </button>
            </div>

            <div className="w-full max-w-md">
                {selectedGame === "ruleta" && <Ruleta />}
                {selectedGame === "scratch" && <ScratchCard />}
            </div>
        </div>
    );
}

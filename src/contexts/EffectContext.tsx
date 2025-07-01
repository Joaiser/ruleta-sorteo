import React, { createContext, useContext, useCallback, useRef, useEffect } from "react";

type EffectContextType = {
    playVictorySound: () => void;
    playScratchSound: () => void;
    stopScratchSound: () => void;
};

const EffectContext = createContext<EffectContextType | undefined>(undefined);

export function EffectProvider({ children }: { children: React.ReactNode }) {
    const victoryAudio = useRef<HTMLAudioElement | null>(null);
    const scratchAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            victoryAudio.current = new Audio("/sounds/winfantasia.mp3");
            scratchAudio.current = new Audio("/sounds/scratch-sound.mp3");
            scratchAudio.current.loop = true;
            scratchAudio.current.volume = 0.5;
        }
    }, []);

    const playVictorySound = useCallback(() => {
        if (victoryAudio.current) {
            victoryAudio.current.pause();
            victoryAudio.current.currentTime = 0;
            victoryAudio.current.play().catch(() => {
                // Manejar error
            });
        }
    }, []);

    const playScratchSound = useCallback(() => {
        if (scratchAudio.current) {
            scratchAudio.current.play().catch(() => { });
        }
    }, []);

    const stopScratchSound = useCallback(() => {
        if (scratchAudio.current) {
            scratchAudio.current.pause();
            scratchAudio.current.currentTime = 0;
        }
    }, []);

    return (
        <EffectContext.Provider value={{ playVictorySound, playScratchSound, stopScratchSound }}>
            {children}
        </EffectContext.Provider>
    );
}

export function useEffects() {
    const context = useContext(EffectContext);
    if (!context) throw new Error("useEffects must be used within an EffectProvider");
    return context;
}

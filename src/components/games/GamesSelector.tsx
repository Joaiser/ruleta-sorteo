import React, { useState, useEffect, useRef } from "react";
import { Ruleta } from "@/components/ruleta/ruleta";
import { ScratchCard } from "@/components/scratchCard/ScratchCard";
import { EffectProvider } from "@/contexts/EffectContext";
import { Quiz } from "@/components/quizSession/Quiz";

function Modal({
    children,
    onClose,
    viewTransitionId,
    open,
}: {
    children: React.ReactNode;
    onClose: () => void;
    viewTransitionId: string;
    open: boolean;
}) {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (open) {
            const timeout = setTimeout(() => setShowContent(true), 300);
            return () => clearTimeout(timeout);
        } else {
            setShowContent(false);
        }
    }, [open]);

    function handleClose() {
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                onClose();
            });
        } else {
            onClose();
        }
    }

    return (
        <div
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
            className={`fixed inset-0 flex justify-center items-center z-50 p-4 transition-colors duration-300 ${open ? "bg-gray-200/30 pointer-events-auto overflow-hidden" : "bg-transparent pointer-events-none overflow-hidden"
                }`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-8 relative shadow-[0_8px_32px_rgba(0,0,0,0.15)] cursor-default flex flex-col overflow-hidden"
                style={{
                    width: open ? "90vw" : 80,
                    maxWidth: 600,
                    minHeight: open ? 500 : 80,
                    opacity: open ? 1 : 0,
                    transformOrigin: "center center",
                    transform: open ? "scale(1)" : "scale(0.7)",
                    transition:
                        "width 300ms ease, min-height 300ms ease, opacity 300ms ease, transform 300ms ease",
                }}
                data-view-transition-name={viewTransitionId}
            >
                <button
                    onClick={handleClose}
                    aria-label="Cerrar"
                    className="absolute top-3 right-3 text-gray-600 text-3xl bg-none border-none cursor-pointer transition-colors duration-200 hover:text-gray-900"
                    style={{ background: "none", border: "none" }}
                >
                    ✕
                </button>

                <div className="flex-1 min-h-[400px] overflow-hidden mt-10">{showContent && children}</div>
            </div>
        </div>
    );
}

export function GameSelector() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<"ruleta" | "scratch" | "quiz" | null>(null);
    const transitionIdRef = useRef<string>("");

    function openGame(game: "ruleta" | "scratch" | "quiz") {
        const id = `btn-${game}`;
        transitionIdRef.current = id;

        if (document.startViewTransition) {
            document.startViewTransition(() => {
                setSelectedGame(game);
                setModalOpen(true);
            });
        } else {
            setSelectedGame(game);
            setModalOpen(true);
        }
    }

    function closeModal() {
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                setModalOpen(false);
                setSelectedGame(null);
            });
        } else {
            setModalOpen(false);
            setSelectedGame(null);
        }
    }

    return (
        <EffectProvider>
            <div className="flex flex-col items-center gap-8 mt-10">
                <h2 className="text-2xl font-bold mb-6">Elige tu juego</h2>

                <div className="flex gap-5">
                    {["ruleta", "scratch", "quiz"].map((game) => {
                        const isRuleta = game === "ruleta";
                        const isScratch = game === "scratch";
                        const isQuiz = game === "quiz";
                        const id = `btn-${game}`;

                        const getColor = () => {
                            if (isRuleta) return "#2563EB"; // azul
                            if (isScratch) return "#16A34A"; // verde
                            if (isQuiz) return "#9333EA"; // púrpura
                            return "#6B7280"; // fallback gris
                        };

                        const getHoverColor = () => {
                            if (isRuleta) return "#1D4ED8";
                            if (isScratch) return "#15803D";
                            if (isQuiz) return "#7E22CE";
                            return "#4B5563";
                        };

                        return (
                            <button
                                key={game}
                                onClick={() => openGame(game as "ruleta" | "scratch" | "quiz")}
                                style={{
                                    viewTransitionName: id,
                                    backgroundColor: getColor(),
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = getHoverColor())
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = getColor())
                                }
                                className="px-8 py-4 rounded-xl border-0 cursor-pointer text-white text-lg font-semibold select-none transition-colors duration-200"
                            >
                                {isRuleta
                                    ? "Ruleta"
                                    : isScratch
                                        ? "Rasca y Gana"
                                        : "Quiz"}
                            </button>
                        );
                    })}
                </div>

                <Modal
                    onClose={closeModal}
                    viewTransitionId={transitionIdRef.current}
                    open={modalOpen}
                >
                    {selectedGame === "ruleta" ? (
                        <Ruleta />
                    ) : selectedGame === "scratch" ? (
                        <ScratchCard />
                    ) : selectedGame === "quiz" ? (
                        <Quiz onClose={closeModal} />
                    ) : null}
                </Modal>
            </div>
        </EffectProvider>
    );
}

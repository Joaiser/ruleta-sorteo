import React, { useState, useEffect, useRef } from "react";
import { Ruleta } from "@/components/ruleta/ruleta";
import { ScratchCard } from "@/components/scratchCard/ScratchCard";

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
                data-view-transition-name={viewTransitionId} // Aquí está el cambio
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
    const [selectedGame, setSelectedGame] = useState<"ruleta" | "scratch" | null>(null);

    const transitionIdRef = useRef<string>("");

    function openGame(game: "ruleta" | "scratch") {
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
        <div className="flex flex-col items-center gap-8 mt-10">
            <h2 className="text-2xl font-bold mb-6">Elige tu juego</h2>

            <div className="flex gap-5">
                {["ruleta", "scratch"].map((game) => {
                    const isRuleta = game === "ruleta";
                    const id = `btn-${game}`;
                    return (
                        <button
                            key={game}
                            onClick={() => openGame(game as "ruleta" | "scratch")}
                            style={{
                                viewTransitionName: id,
                                backgroundColor: isRuleta ? "#2563EB" : "#16A34A",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = isRuleta ? "#1D4ED8" : "#15803D")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = isRuleta ? "#2563EB" : "#16A34A")
                            }
                            className="px-8 py-4 rounded-xl border-0 cursor-pointer text-white text-lg font-semibold select-none transition-colors duration-200"
                        >
                            {isRuleta ? "Ruleta" : "Rasca y Gana"}
                        </button>
                    );
                })}
            </div>

            <Modal onClose={closeModal} viewTransitionId={transitionIdRef.current} open={modalOpen}>
                {selectedGame === "ruleta" ? <Ruleta /> : <ScratchCard />}
            </Modal>
        </div>
    );
}

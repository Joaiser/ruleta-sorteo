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
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: open ? "rgba(229, 231, 235, 0.3)" : "transparent",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 50,
                pointerEvents: open ? "auto" : "none",
                transition: "background-color 300ms",
                padding: 16,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 32,
                    position: "relative",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                    viewTransitionName: viewTransitionId,
                    cursor: "default",

                    // Tamaño para móvil (90% viewport width, max 600px)
                    width: open ? "90vw" : 80,
                    maxWidth: 600,
                    minHeight: open ? 500 : 80,

                    opacity: open ? 1 : 0,
                    transformOrigin: "center center",
                    transform: open ? "scale(1)" : "scale(0.7)",
                    transition:
                        "width 300ms ease, min-height 300ms ease, opacity 300ms ease, transform 300ms ease",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <button
                    onClick={handleClose}
                    aria-label="Cerrar"
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        fontSize: 28,
                        color: "#4B5563",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#4B5563")}
                >
                    ✕
                </button>

                {/* Wrapper para asegurar tamaño y scroll en contenido */}
                <div
                    style={{
                        flex: 1,
                        minHeight: 400,
                        overflowY: "auto",
                        marginTop: 40,
                    }}
                >
                    {showContent && children}
                </div>
            </div>
        </div>
    );
}

export function GameSelector() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<"ruleta" | "scratch" | null>(
        null
    );

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
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 32,
                marginTop: 40,
            }}
        >
            <h2 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 24 }}>
                Elige tu juego
            </h2>

            <div style={{ display: "flex", gap: 20 }}>
                {["ruleta", "scratch"].map((game) => {
                    const isRuleta = game === "ruleta";
                    const id = `btn-${game}`;
                    return (
                        <button
                            key={game}
                            onClick={() => openGame(game as "ruleta" | "scratch")}
                            style={{
                                viewTransitionName: id,
                                padding: "16px 32px",
                                borderRadius: 12,
                                border: "none",
                                cursor: "pointer",
                                color: "white",
                                fontSize: 18,
                                fontWeight: "600",
                                transition: "background-color 200ms",
                                backgroundColor: isRuleta ? "#2563EB" : "#16A34A",
                                userSelect: "none",
                            }}
                            onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = isRuleta
                                ? "#1D4ED8"
                                : "#15803D")
                            }
                            onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = isRuleta
                                ? "#2563EB"
                                : "#16A34A")
                            }
                        >
                            {isRuleta ? "Ruleta" : "Rasca y Gana"}
                        </button>
                    );
                })}
            </div>

            <Modal
                onClose={closeModal}
                viewTransitionId={transitionIdRef.current}
                open={modalOpen}
            >
                {selectedGame === "ruleta" ? <Ruleta /> : <ScratchCard />}
            </Modal>
        </div>
    );
}

import React, { useState, useEffect, useRef } from "react";
import { ModalPremio } from "@/components/ModalPremio";

type ResultadoSorteo = {
    prize: {
        type: "discount" | "product";
        value: string | number;
    };
    code: string;
};

export function ScratchCard() {
    const [premios, setPremios] = useState<any[]>([]);
    const [resultado, setResultado] = useState<ResultadoSorteo | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [rascado, setRascado] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/prize", { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error(`Error ${res.status} al cargar premios`);
                return res.json();
            })
            .then((data) => setPremios(data))
            .catch((err) => console.error("❌ Error al cargar premios", err));
    }, []);

    // Simula la llamada a participate para obtener el premio
    async function rascar() {
        if (resultado) {
            setMensaje("Ya has participado y no puedes rascar de nuevo.");
            return;
        }

        try {
            const res = await fetch("/api/participate", {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                if (data?.prize && data?.code) {
                    setMensaje("Ya has participado. Este fue tu premio:");
                    setResultado(data);
                    setModalAbierto(true);
                    return;
                }

                if (
                    data?.error === "Token inválido o expirado" ||
                    data?.error === "Sesión no encontrada"
                ) {
                    setMensaje("Tu sesión ha expirado. Inicia sesión de nuevo.");
                    return;
                }

                setMensaje(data?.error || "Error desconocido al participar.");
                return;
            }

            setResultado(data);
            setModalAbierto(true);
            setMensaje(null);
        } catch (err) {
            console.error("❌ Error al conectar con el servidor:", err);
            setMensaje("Error al conectar con el servidor. Intenta más tarde.");
        }
    }

    // Al "rascar" completamente, lanzamos la llamada
    function handleRascar() {
        if (!rascado) {
            setRascado(true);
            rascar();
        }
    }

    return (
        <div className="p-4 flex flex-col items-center">
            <div
                ref={overlayRef}
                onClick={handleRascar}
                className={`relative w-64 h-40 bg-gray-400 rounded-lg cursor-pointer select-none
          ${rascado ? "opacity-0 transition-opacity duration-700" : "opacity-100"}
        `}
                title="Haz clic para rascar"
            >
                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                    ¡Rasca aquí!
                </div>
            </div>

            {mensaje && (
                <div className="mt-4 text-center text-yellow-800 bg-yellow-100 border border-yellow-300 px-4 py-2 rounded shadow">
                    {mensaje}
                </div>
            )}

            {resultado && modalAbierto && (
                <ModalPremio resultado={resultado} onClose={() => setModalAbierto(false)} />
            )}
        </div>
    );
}

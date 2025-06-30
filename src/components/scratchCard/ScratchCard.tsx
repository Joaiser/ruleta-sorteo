import React, { useRef, useState, useEffect } from "react";
import { ModalPremio } from "@/components/ModalPremio";

type ResultadoSorteo = {
    prize: {
        type: "discount" | "product";
        value: string | number;
    };
    code: string;
};

export function ScratchCard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [rascado, setRascado] = useState(false);
    const [resultado, setResultado] = useState<ResultadoSorteo | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);

    const threshold = 50; // % para abrir modal

    // 1. Cargar premio al montar para tenerlo debajo del canvas
    useEffect(() => {
        async function obtenerPremioInicial() {
            try {
                const res = await fetch("/api/participate", {
                    method: "POST",
                    credentials: "include",
                });
                const data = await res.json();

                if (res.ok) {
                    setResultado(data);
                    setMensaje(null);
                    // NO abrir modal aquí
                } else if (data?.prize && data?.code) {
                    setMensaje("Ya has participado. Este fue tu premio:");
                    setResultado(data);
                    // NO abrir modal aquí tampoco
                    // Lo abrirás sólo cuando rasquen > 70%
                    setRascado(true); // para evitar rascar otra vez
                }
            } catch (error) {
                setMensaje("Error al conectar con el servidor. Intenta más tarde.");
            }
        }
        obtenerPremioInicial();
    }, []);


    // 2. Inicializar canvas con capa gris y texto "¡Rasca aquí!"
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 320;
        canvas.height = 200;

        ctx.fillStyle = "#999";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "28px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("¡Rasca aquí!", canvas.width / 2, canvas.height / 2 + 10);
    }, []);

    // 3. Función para borrar un círculo en la posición del cursor/touch
    function handleDraw(x: number, y: number) {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.globalCompositeOperation = "source-over";
    }

    // 4. Calcular porcentaje raspado para saber cuándo abrir modal
    function checkPercentage() {
        if (!canvasRef.current) return 0;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return 0;

        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const pixels = imageData.data;
        let clearPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) clearPixels++;
        }

        const totalPixels = canvasRef.current.width * canvasRef.current.height;
        return (clearPixels / totalPixels) * 100;
    }

    // 5. Abrir modal al rascar suficiente, ya tenemos premio cargado de antes
    function handleRascarSuficiente() {
        setRascado(true);
        setModalAbierto(true);
    }

    // 6. Eventos pointer para rascar
    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
        e.preventDefault();
        if (rascado) return; // ya raspado, no permitir más

        setIsDrawing(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleDraw(x, y);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
        e.preventDefault();
        if (!isDrawing || rascado) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleDraw(x, y);

        const porcentaje = checkPercentage();
        if (porcentaje > threshold) {
            handleRascarSuficiente();
        }
    }

    function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
        e.preventDefault();
        setIsDrawing(false);
    }

    return (
        <div className="flex flex-col items-center p-4">
            {/* Premio debajo, visible conforme raspas */}
            <div
                className="absolute w-[320px] h-[200px] rounded-lg bg-white flex flex-col items-center justify-center p-4 select-none"
                style={{ maxWidth: "90vw", userSelect: "none" }}
            >
                {resultado ? (
                    <>
                        {resultado.prize.type === "discount" ? (
                            <div className="text-3xl font-bold text-green-700">
                                🎉 Descuento: {resultado.prize.value}%
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-blue-700">
                                🎁 Producto: {resultado.prize.value}
                            </div>
                        )}
                        <div className="mt-2 text-sm text-gray-600">Código: {resultado.code}</div>
                    </>
                ) : (
                    <div className="text-gray-400 text-xl">Tu premio aparecerá aquí</div>
                )}
            </div>

            {/* Canvas para rascar encima */}
            <canvas
                ref={canvasRef}
                className="rounded-lg shadow-lg touch-none relative"
                style={{ width: 320, height: 200, maxWidth: "90vw" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            />

            {/* Mensajes de error o aviso */}
            {mensaje && (
                <div className="mt-4 text-center text-yellow-800 bg-yellow-100 border border-yellow-300 px-4 py-2 rounded shadow max-w-xs">
                    {mensaje}
                </div>
            )}

            {/* Modal con resultado */}
            {resultado && modalAbierto && (
                <ModalPremio resultado={resultado} onClose={() => setModalAbierto(false)} />
            )}
        </div>
    );
}

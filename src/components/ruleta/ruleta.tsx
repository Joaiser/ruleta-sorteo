import React, { useState, useEffect } from 'react';
import { SpinRoulette } from './SpinRoulette';
import type { Prize } from '@/components/ruleta/SpinRoulette'
import { ModalPremio } from '@/components/ModalPremio'
import { useEffects } from '@/contexts/EffectContext';

type ResultadoSorteo = {
    prize: {
        type: 'discount' | "product",
        value: string | number
    },
    code: string
}

export function Ruleta() {
    const [premios, setPremios] = useState<Prize[]>([]);
    const [resultado, setResultado] = useState<ResultadoSorteo | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeIndex, setPrizeIndex] = useState<number | null>(null);
    const [tempResultado, setTempResultado] = useState<ResultadoSorteo | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);


    const { playSpinSound, stopSpinSound, playVictorySound } = useEffects();
    // 🔁 Cargar premios al inicio
    useEffect(() => {
        fetch('/api/prize', { credentials: 'include' })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error ${res.status} al cargar premios`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Premios cargados:', data);
                setPremios(data);
            })
            .catch(err => console.error('❌ Error al cargar premios', err));
    }, []);


    async function lanzarSorteo() {
        try {
            const res = await fetch('/api/participate', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                if (data?.prize && data?.code) {
                    setMensaje("Ya has participado en el sorteo. Este fue tu premio:");
                    return data;
                }

                if (data?.error === "Token inválido o expirado" || data?.error === "Sesión no encontrada") {
                    setMensaje("Tu sesión ha expirado. Inicia sesión de nuevo.");
                    return null;
                }

                setMensaje(data?.error || "Error desconocido al participar.");
                return null;
            }

            setMensaje(null);
            return data;

        } catch (err) {
            console.error("❌ Error de red o inesperado:", err);
            setMensaje("Error al conectar con el servidor. Intenta más tarde.");
            return null;
        }
    }


    async function handleSpin() {
        if (resultado) {
            setMensaje("Ya has participado y no puedes girar de nuevo.");
            return;
        }

        const data = await lanzarSorteo();

        if (!data) return; // Si hubo error, no hacer nada

        if (data && data.prize && data.code && mensaje) {
            setResultado(data);
            return;
        }

        setTempResultado(data);

        const index = premios.findIndex(
            p => p.type === data.prize.type && String(p.value) === String(data.prize.value)
        );

        if (index === -1) {
            setMensaje("Premio obtenido no coincide con los configurados.");
            return;
        }

        setPrizeIndex(index);
        setMustSpin(true);
        playSpinSound();
    }


    // Aquí actualizamos resultado real cuando la ruleta termina el giro
    function onSpinComplete(prize: Prize) {
        setMustSpin(false)
        stopSpinSound();
        if (tempResultado) {
            setResultado(tempResultado)
            setModalAbierto(true)
            playVictorySound();
        }
    }

    return (
        <div className="p-4 flex flex-col items-center justify-center">
            <div className="flex justify-center content-center">
                <button
                    onClick={handleSpin}
                    className="bg-blue-600 text-white px-4 py-2 rounded w-32 cursor-pointer"
                >
                    Girar Ruleta!
                </button>
            </div>

            {mensaje && (
                <div className="mt-6 text-center">
                    <div className="inline-block bg-yellow-100 text-yellow-900 border border-yellow-300 px-4 py-2 rounded shadow">
                        {mensaje}
                    </div>
                </div>
            )}

            {premios.length > 0 && (
                <SpinRoulette
                    prizes={premios}
                    onSpinComplete={onSpinComplete}
                    mustSpin={mustSpin}
                    prizeIndex={prizeIndex}
                />
            )}

            {resultado && modalAbierto && (
                <ModalPremio resultado={resultado} onClose={() => setModalAbierto(false)} />
            )}
        </div>
    );
}
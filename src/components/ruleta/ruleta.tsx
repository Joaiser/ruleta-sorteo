import React, { useState, useEffect } from 'react';
import { SpinRoulette } from './SpinRoulette';
import type { Prize } from '@/components/ruleta/SpinRoulette'
import { ModalPremio } from '@/components/ModalPremio'


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

    // 🔁 Cargar premios al inicio
    useEffect(() => {
        fetch('/api/prizes')
            .then((res) => res.json())
            .then((data) => setPremios(data))
            .catch((err) => console.error('❌ Error al cargar premios', err));
    }, []);

    // 🔁 Inicializar sesión
    useEffect(() => {
        fetch('/api/session', {
            method: 'GET',
            credentials: 'include',
        })
            .then(res => {
                if (!res.ok) throw new Error("Nos se pudo inicializar sesión")
                return res.json()
            })
            .then(data => console.log("sesión iniciada con UUID:", data.uuid))
            .catch(err => console.error("Error iniciando sesion", err))
    }, [])

    async function lanzarSorteo() {
        const res = await fetch('/api/participate', {
            method: 'POST',
            credentials: 'include'
        })

        const data = await res.json()

        if (!res.ok) {
            if (data?.prize && data?.code) {
                setMensaje("Ya has participado en el sorteo. Este fue tu premio:")
                return data // aunque haya error, ya participó y tenemos datos
            }
            throw new Error("Error en la participación")
        }
        setMensaje(null)
        return data
    }

    async function handleSpin() {

        if (resultado) {
            setMensaje("Ya has participado y no puedes girar de nuevo.");
            return;
        }

        const data: ResultadoSorteo = await lanzarSorteo()

        // Si el mensaje viene desde lanzarSorteo, quiere decir que ya participó
        if (mensaje) {
            setResultado(data); // Seteamos el resultado igualmente, pero no giramos
            return;
        }


        setTempResultado(data)

        // Buscar índice del premio dentro del array de premios
        const index = premios.findIndex(
            p => p.type === data.prize.type && p.value === data.prize.value
        )

        if (index === -1) {
            // console.error("Premio no encontrado en premios")
            return
        }

        setPrizeIndex(index)   // Actualiza índice del premio
        setMustSpin(true)      // Indica que debe empezar a girar la ruleta
    }

    // Aquí actualizamos resultado real cuando la ruleta termina el giro
    function onSpinComplete(prize: Prize) {
        setMustSpin(false)
        if (tempResultado) {
            setResultado(tempResultado)
            setModalAbierto(true)
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
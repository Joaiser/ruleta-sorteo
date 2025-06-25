import { useState, useEffect } from "react";
import { PrizeForm } from './PrizeForm'
import type { Prize } from '@/pages/dashboardAdmin/types/prize'

export function PrizeList() {
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchPrizes = async () => {
            const res = await fetch("/api/prizes");
            if (res.ok) {
                const data = await res.json();
                setPrizes(data);
            } else {
                console.error("❌ Error al obtener premios");
            }
            setLoading(false);
        }

        fetchPrizes();
    }, [])

    const addPrize = (prize: Prize) => {
        setPrizes((prev) => [...prev, prize])
    }

    const deletePrize = async (id: string) => {
        try {
            const res = await fetch(`/api/prizes/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                setError(error.message); // esto activa el <div> con el mensaje
                return;
            }

            setPrizes((prev) => prev.filter(prize => prize._id !== id));
            setError(null); // limpiamos error si todo fue bien
        } catch (err) {
            setError("Error inesperado al eliminar premio.");
        }
    };




    return (
        <div className="space-y-8 py-10">
            {error && (
                <div className="text-red-400 bg-red-900 p-2 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}
            <PrizeForm onAdd={addPrize} />
            <ul className="space-y-4 flex flex-col items-center">
                {prizes.length === 0 ? (
                    <li className="text-gray-400">No hay premios aún.</li>
                ) : (
                    prizes.map((prize) => (
                        <li key={prize._id} className="bg-gray-800 text-white p-4 rounded shadow flex justify-between items-center w-sm">

                            <div>
                                <p><strong>🎯 Tipo:</strong> {prize.type}</p>
                                <p className="ml-7"><strong>Valor:</strong> {prize.value}</p>
                                <p><strong>📦 Código:</strong> {prize.code}</p>
                                <p><strong>🎲 % Base:</strong> {prize.baseChance}%</p>
                            </div>
                            <button onClick={() => deletePrize(prize._id!)}>🗑️</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
import { useState, useEffect } from "react";
import { PrizeForm } from './PrizeForm'
import type { Prize } from '@/pages/dashboardAdmin/types/prize'

export function PrizeList() {
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [loading, setLoading] = useState(true)

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

    if (loading) return <p className="text-white">Cargando premios...</p>

    return (
        <div className="space-y-8 py-10">
            <PrizeForm onAdd={addPrize} />

            <ul className="space-y-4">
                {prizes.length === 0 ? (
                    <li className="text-gray-400">No hay premios aún.</li>
                ) : (
                    prizes.map((prize) => (
                        <li key={prize._id} className="bg-gray-800 text-white p-4 rounded shadow flex justify-between items-center">
                            <div>
                                <p><strong>🎯 Tipo:</strong> {prize.type}</p>
                                <p><strong>Valor:</strong> {prize.value}</p>
                                <p><strong>📦 Código:</strong> {prize.code}</p>
                                <p><strong>🎲 % Base:</strong> {prize.baseChance}%</p>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
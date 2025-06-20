import { useState } from "react";
import { PrizeForm } from './PrizeForm'
import type { Prize } from '@/pages/dashboardAdmin/types/prize'

export function PrizeList() {
    const [prizes, setPrizes] = useState<Prize[]>([])

    const addPrize = (prize: Prize) => {
        setPrizes((prev) => [...prev, { ...prize, _id: crypto.randomUUID() }])

        //Enviar a bd futuro
    }

    return (
        <div className="space-y-8 py-10">
            <PrizeForm onAdd={addPrize} />

            <ul className="space-y-4">
                {prizes.map((prize) => (
                    <li key={prize._id} className="bg-gray-800 text-white p-4 rounded shadow flex justify-between items-center">
                        <div>
                            <p><strong>🎯 Tipo:</strong> {prize.type}</p>
                            <p><strong>Valor:</strong> {prize.value}</p>
                            <p><strong>📦 Código:</strong> {prize.code}</p>
                            <p><strong>🎲 % Base:</strong> {prize.baseChance}%</p>
                        </div>
                        {/* En el futuro botones de editar/eliminar */}
                    </li>
                ))}
            </ul>
        </div>
    );
}
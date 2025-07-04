import React, { useState } from "react";
import type { Prize } from "@/pages/dashboardAdmin/types/prize";

type PrizeCreatorProps = {
    onCreate: (newPrize: Prize) => void;
    onCancel: () => void;
    phase: number;
    answerIndex: number;
    modifierIndex: number;
    originalPrizeId: string;
};


function generarCodigoAleatorio() {
    // Código alfanumérico random 8 caracteres
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function PrizeCreator({
    onCreate,
    onCancel,
    phase,
    answerIndex,
    modifierIndex,
    originalPrizeId,
}: PrizeCreatorProps) {

    const [type, setType] = useState<Prize["type"]>("discount");
    const [value, setValue] = useState<string>("");
    const [baseChance, setBaseChance] = useState<number>(type === "discount" ? 10 : 5);


    const handleSubmit = async () => {
        if (type === "discount" && (isNaN(Number(value)) || Number(value) <= 0)) {
            alert("Introduce un porcentaje válido");
            return;
        }
        if (type === "product" && !value.trim()) {
            alert("Introduce el nombre del producto");
            return;
        }

        // Generar code y baseChance por defecto
        const code = generarCodigoAleatorio();

        try {
            const res = await fetch("/api/quiz/createModifierPrize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalPrizeId,
                    newPrize: {
                        type,
                        value: type === "discount" ? Number(value) : value.trim(),
                        code,
                        baseChance, // ✔️ este es el bueno
                    },
                    phase,
                    answerIndex,
                    modifierIndex,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al crear premio");
            }

            // El backend devuelve solo id y mensaje, así que construimos el premio completo aquí:
            const data = await res.json();
            const newPrize: Prize = {
                _id: data.id,
                type,
                value: type === "discount" ? Number(value) : value.trim(),
                code,
                baseChance,
            };
            onCreate(newPrize);
        } catch (error: any) {
            alert(error.message || "Error inesperado creando premio");
        }
    };

    return (
        <div className="bg-gray-700 p-4 rounded space-y-3 text-white">
            <div>
                <label className="block mb-1">Tipo de premio</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Prize["type"])}
                    className="w-full rounded bg-gray-600 p-2"
                >
                    <option value="discount">Descuento (%)</option>
                    <option value="product">Producto</option>
                </select>
            </div>

            <div>
                <label className="block mb-1">
                    {type === "discount" ? "Porcentaje (%)" : "Nombre del producto"}
                </label>
                <input
                    type={type === "discount" ? "number" : "text"}
                    min={type === "discount" ? 1 : undefined}
                    max={type === "discount" ? 100 : undefined}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full rounded bg-gray-600 p-2"
                    required
                />
            </div>

            <div>
                <label className="block mb-1">Probabilidad base (%)</label>
                <input
                    type="number"
                    min={0}
                    max={100}
                    value={baseChance}
                    onChange={(e) => setBaseChance(Number(e.target.value))}
                    className="w-full rounded bg-gray-600 p-2"
                    required
                />
            </div>


            <div className="flex gap-2 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                    Crear premio
                </button>
            </div>
        </div>
    );
}

export default PrizeCreator;

import React, { useState, useEffect } from "react";
import type { Prize } from '@/pages/dashboardAdmin/types/prize'

export function PrizeForm({ onAdd }: { onAdd: (prize: Prize) => void }) {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState<Prize>({
        type: 'discount',
        value: '',
        code: '',
        baseChance: 1,
    })

    const nextStep = () => setStep((prev) => prev + 1)
    const prevStep = () => setStep((prev) => Math.max(1, prev - 1))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: name === "baseChance" ? +value : value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onAdd(form);
        setStep(1)
        setForm({ type: 'discount', value: '', code: '', baseChance: 1 })
    }

    const generateCode = () => {
        const random = crypto.randomUUID().slice(0, 8).toUpperCase();
        setForm((prev) => ({ ...prev, code: random }));
    };


    useEffect(() => {
        console.log("STEP:", step, "FORM:", form)
    }, [step, form])


    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 text-white p-6 rounded shadow space-y-6 max-w-xl mx-auto">
            {/* Step 1: Tipo */}
            {step === 1 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">¿Qué tipo de premio quieres añadir?</h2>
                    <select name="type" value={form.type} onChange={handleChange} className="p-3 w-full rounded bg-gray-700">
                        <option value="discount">💸 Descuento</option>
                        <option value="product">🎁 Producto</option>
                    </select>
                    <button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                        Siguiente →
                    </button>
                </div>
            )}

            {/* Step 2: Valor */}
            {step === 2 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Introduce el valor del premio</h2>
                    <input
                        type="text"
                        name="value"
                        value={form.value}
                        onChange={handleChange}
                        placeholder={form.type === "discount" ? "% de descuento" : "Nombre del producto"}
                        className="p-3 w-full rounded bg-gray-700"
                    />
                    <div className="flex justify-between">
                        <button type="button" onClick={prevStep}>← Atrás</button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!(typeof form.value === "string" ? form.value.trim() : String(form.value).trim())) {
                                    alert("Introduce un valor válido para el premio.");
                                    return;
                                }
                                nextStep();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Código */}
            {step === 3 && (
                <div className="flex gap-2 flex-col">
                    <h2 className="text-lg font-semibold">Generar Código</h2>
                    <input
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="Ej: ABC123 o SKU del producto"
                        className="p-3 w-full rounded bg-gray-700"
                    />
                    <button type="button" onClick={generateCode} className="bg-gray-600 hover:bg-gray-700 px-2 rounded">
                        🔁
                    </button>

                    <div className="flex justify-between">
                        <button type="button" onClick={prevStep}>← Atrás</button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!(typeof form.value === "string" ? form.value.trim() : String(form.value).trim())) {
                                    alert("Introduce un valor válido para el premio.");
                                    return;
                                }
                                nextStep();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )
            }

            {/* Step 4: baseChance */}
            {
                step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Probabilidad base de aparición (%)</h2>
                        <p className="text-sm text-gray-400">
                            Este valor representa la posibilidad de que este premio aparezca en la ruleta.
                            Entre todos los premios deben sumar 100 para una distribución equilibrada.
                        </p>

                        <input
                            type="number"
                            name="baseChance"
                            min={1}
                            max={100}
                            value={form.baseChance}
                            onChange={handleChange}
                            className="p-3 w-full rounded bg-gray-700"
                        />
                        <div className="flex justify-between">
                            <button type="button" onClick={prevStep}>← Atrás</button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!(typeof form.value === "string" ? form.value.trim() : String(form.value).trim())) {
                                        alert("Introduce un valor válido para el premio.");
                                        return;
                                    }
                                    nextStep();
                                }}
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Step 5: Confirmación */}
            {
                step === 5 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">📝 Confirmar Premio</h2>
                        <ul className="bg-gray-800 p-4 rounded text-sm space-y-1">
                            <li><strong>Tipo:</strong> {form.type}</li>
                            <li><strong>Valor:</strong> {form.value}</li>
                            <li><strong>Código:</strong> {form.code}</li>
                            <li><strong>Probabilidad:</strong> {form.baseChance}%</li>
                        </ul>
                        <div className="flex justify-between">
                            <button type="button" onClick={prevStep}>← Atrás</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                                ✅ Confirmar y Añadir
                            </button>
                        </div>
                    </div>
                )
            }
        </form >
    );
}
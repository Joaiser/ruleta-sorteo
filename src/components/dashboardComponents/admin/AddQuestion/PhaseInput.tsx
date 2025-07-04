export function PhaseInput({ phase, setPhase }: { phase: number; setPhase: (n: number) => void }) {
    return (
        <label className="block">
            <span className="text-gray-300 font-semibold mb-1 block">Fase:</span>
            <input
                type="number"
                min={1}
                value={phase}
                onChange={(e) => setPhase(Number(e.target.value))}
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-2 text-white"
                required
            />
        </label>
    );
}

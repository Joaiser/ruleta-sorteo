import { useState, useEffect } from 'react';

type participants = {
    _id: string;
    username?: string;
    prize: {
        type: string;
        value: number;
        code: string;
        date: string;
    };
    status: 'active' | 'used' | 'cancelled';
};

export default function ParticipantsList() {
    const [participants, setParticipants] = useState<participants[]>([]);
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState<participants[]>([]);
    const [removing, setRemoving] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    useEffect(() => {
        fetch('/api/get-participants', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error("No se pudieron cargar los participantes.");
                return res.json();
            })
            .then((data) => {
                const formateados = data.map((p: any) => ({
                    _id: p._id,
                    username: p.email || '-',
                    prize: {
                        type: p.prize.type,
                        value: p.prize.value,
                        code: p.code,
                        date: new Date(p.date).toLocaleDateString(),
                    },
                    status: p.status || 'active'
                }));
                setParticipants(formateados);
                setFiltered(formateados);
            })
            .catch(err => {
                setErrorMessage(err.message || "Error desconocido al cargar los participantes.");
            });
    }, []);



    useEffect(() => {
        const filteredData = participants.filter((p) => {
            const term = search.toLowerCase();
            return (
                (p.username && p.username.toLowerCase().includes(term)) ||
                p.prize.code.toLowerCase().includes(term)
            );
        });
        setFiltered(filteredData);
    }, [search, participants]);

    const markAsUsed = async (id: string) => {
        try {
            const res = await fetch("/api/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "used" }),
            });
            if (!res.ok) throw new Error("No se pudo marcar como usado.");
            setParticipants((prev) =>
                prev.map((p) => (p._id === id ? { ...p, status: "used" } : p))
            );
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Error desconocido al marcar.");
        }
    };


    const deleteParticipant = async (id: string) => {
        setRemoving(id);
        try {
            const res = await fetch("/api/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "cancelled" }),
            });
            if (!res.ok) throw new Error("No se pudo cancelar al participante.");
            setParticipants((prev) =>
                prev.map((p) => (p._id === id ? { ...p, status: "cancelled" } : p))
            );
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "Error desconocido al cancelar.");
        } finally {
            setRemoving(null);
        }
    };



    return (
        <div className="space-y-6">
            {errorMessage && (
                <div className="bg-red-700/90 border border-red-500 text-white px-4 py-2 rounded-lg shadow mb-4">
                    ⚠️ {errorMessage}
                </div>
            )}

            <input
                type="search"
                placeholder="🔎 Buscar por UUID, nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-lg px-4 py-2 rounded-lg bg-gray-800 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur"
            />

            <ul className="space-y-4">
                {filtered.map((p) => (
                    <li
                        key={p._id}
                        className={`bg-gray-900 border border-white/20 rounded-xl p-4 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-300 ease-in-out transform 
                        ${removing === p._id ? 'opacity-0 scale-95 pointer-events-none' : 'hover:shadow-xl hover:scale-[1.01]'}`}
                    >
                        <div className="mb-4 sm:mb-0 space-y-1">
                            <p className="text-sm"><span className="font-semibold">👤 Usuario:</span> {p.username || '-'}</p>
                            <p className="text-sm"><span className="font-semibold">🎁 Código:</span> {p.prize.code}</p>
                            <p className="text-sm">
                                <span className="font-semibold">📌 Estado:</span>
                                <span
                                    className={`ml-1 px-2 py-0.5 rounded text-xs font-medium
		                                    ${p.status === 'used' ? 'bg-red-600/80 text-white' :
                                            p.status === 'cancelled' ? 'bg-gray-600/80 text-white' :
                                                'bg-green-600/80 text-white'}`}>
                                    {p.status}
                                </span>
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {p.status !== 'used' && (
                                <button
                                    onClick={() => markAsUsed(p._id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 transition px-4 py-1.5 text-sm rounded-lg font-medium shadow cursor-pointer"
                                >
                                    ✅ Marcar usado
                                </button>
                            )}
                            <button
                                onClick={() => deleteParticipant(p._id)}
                                className="bg-red-600 hover:bg-red-700 transition px-4 py-1.5 text-sm rounded-lg font-medium shadow cursor-pointer"
                            >
                                🗑️ Borrar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

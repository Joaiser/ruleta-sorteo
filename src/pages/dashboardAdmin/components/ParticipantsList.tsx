import { useState, useEffect } from 'react';

type participants = {
    _id: string;
    uuid: string;
    username?: string;
    prize: {
        type: string;
        value: number;
        code: string;
        date: string;
        ip: string;
    };
    status: 'active' | 'used' | 'cancelled';
};

export default function ParticipantsList() {
    const [participants, setParticipants] = useState<participants[]>([]);
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState<participants[]>([]);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        const data: participants[] = [
            {
                _id: '1',
                uuid: 'abc-123',
                username: 'maria',
                prize: { type: 'discount', value: 10, code: 'C70BBFD1', date: '2025-06-19', ip: 'unknow' },
                status: 'active',
            },
            {
                _id: '2',
                uuid: 'def-456',
                username: 'ana',
                prize: { type: 'discount', value: 15, code: 'D80CCDD2', date: '2025-06-18', ip: 'unknow' },
                status: 'used',
            },
        ];
        setParticipants(data);
        setFiltered(data);
    }, []);

    useEffect(() => {
        const filteredData = participants.filter((p) => {
            const term = search.toLowerCase();
            return (
                p.uuid.toLowerCase().includes(term) ||
                (p.username && p.username.toLowerCase().includes(term)) ||
                p.prize.code.toLowerCase().includes(term)
            );
        });
        setFiltered(filteredData);
    }, [search, participants]);

    const markAsUsed = (id: string) => {
        setParticipants((prev) =>
            prev.map((p) => (p._id === id ? { ...p, status: 'used' } : p))
        );
    };

    const deleteParticipant = (id: string) => {
        setRemoving(id);
        setTimeout(() => {
            setParticipants((prev) => prev.filter((p) => p._id !== id));
            setRemoving(null);
        }, 300); // tiempo que dura la animación
    };

    return (
        <div className="space-y-6">
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
                            <p className="text-sm"><span className="font-semibold">🆔 UUID:</span> {p.uuid}</p>
                            <p className="text-sm"><span className="font-semibold">👤 Usuario:</span> {p.username || '-'}</p>
                            <p className="text-sm"><span className="font-semibold">🎁 Código:</span> {p.prize.code}</p>
                            <p className="text-sm">
                                <span className="font-semibold">📌 Estado:</span>
                                <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium
                                    ${p.status === 'used' ? 'bg-red-600/80 text-white' : 'bg-green-600/80 text-white'}`}>
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

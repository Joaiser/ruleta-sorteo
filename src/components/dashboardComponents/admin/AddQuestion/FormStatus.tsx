type Props = {
    error: string | null;
    success: string | null;
};

export function FormStatus({ error, success }: Props) {
    if (!error && !success) return null;

    return (
        <div
            className={`px-4 py-2 rounded-lg shadow border ${error
                    ? "bg-red-700/90 border-red-500 text-white"
                    : "bg-green-700/90 border-green-500 text-white"
                }`}
        >
            {error && <>⚠️ {error}</>}
            {success && <>✅ {success}</>}
        </div>
    );
}

export function LoginGoogleButton() {
    const handleLogin = () => {
        window.location.href = "/api/auth/google/login";
    };

    return (
        <div className="flex flex-col items-center">
            <p className="mb-2">Inicia sesión con Google para participar</p>
            <button
                onClick={handleLogin}
                className="bg-white text-black border border-gray-300 rounded px-4 py-2 flex items-center gap-2 hover:shadow"
            >
                <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                Continuar con Google
            </button>
        </div>
    );
}
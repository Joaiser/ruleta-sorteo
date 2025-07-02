import { useEffect } from "react";

export function LoginFacebookButton() {
    useEffect(() => {
        // Cargar SDK si no está cargado ya
        if (typeof window !== "undefined" && !window.FB) {
            window.fbAsyncInit = function () {
                FB.init({
                    appId: import.meta.env.PUBLIC_FACEBOOK_APP_ID,
                    cookie: true,
                    xfbml: true,
                    version: "v19.0",
                });
            };

            const script = document.createElement("script");
            script.src = "https://connect.facebook.net/en_US/sdk.js";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleLogin = () => {
        FB.login(function (response: any) {
            if (response.authResponse) {
                console.log("✅ Usuario conectado:", response);
                // Aquí puedes enviar el token de Facebook a tu backend
                // para verificarlo y generar tu sesión propia
            } else {
                console.log("❌ Usuario canceló login o no autorizó.");
            }
        }, { scope: "public_profile,email" });
    };


    return (
        <div className="flex flex-col items-center mt-4">
            <button
                onClick={handleLogin}
                className="bg-blue-600 text-white border border-blue-800 rounded px-4 py-2 flex items-center gap-2 hover:bg-blue-700 cursor-pointer"
            >
                <img src="/facebook-icon.svg" alt="Facebook" className="w-5 h-5" />
                Continuar con Facebook
            </button>
        </div>
    );
}
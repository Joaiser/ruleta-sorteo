import { jwtDecode } from "jwt-decode";

export function getUserIdFromToken(token: string): string | null {
    try {
        const payload = jwtDecode<{ email?: string }>(token);
        return payload.email ?? null;
    } catch (error) {
        console.error("Error decodificando token JWT:", error);
        return null;
    }
}

export function getUserIdFromCookie(cookieName = "session"): string | null {
    if (typeof document === "undefined") return null; // para evitar errores SSR

    const cookies = document.cookie.split("; ").reduce((acc, curr) => {
        const [key, val] = curr.split("=");
        acc[key] = val;
        return acc;
    }, {} as Record<string, string>);

    const token = cookies[cookieName];
    if (!token) return null;

    return getUserIdFromToken(token);
}

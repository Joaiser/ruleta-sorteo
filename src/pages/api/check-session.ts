import { isAdminToken } from "@/lib/auth/auth"
import jwt from "jsonwebtoken";

export async function GET({ request }: { request: Request }) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies: Record<string, string> = Object.fromEntries(
        cookieHeader
            .split(';')
            .map(cookie => cookie.trim().split('='))
            .filter(([key, value]) => key && value)
    );

    const token = cookies['admin_token'];


    if (!isAdminToken(token)) {
        return new Response(JSON.stringify({ ok: false }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        })
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    })
}

export function getSessionFromRequest(request: Request): { email: string } | null {
    try {
        const cookieHeader = request.headers.get("cookie") || "";
        const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));

        const token = cookies.session;
        if (!token) return null;

        const payload = jwt.verify(token, import.meta.env.JWT_SECRET!) as any;

        return { email: payload.email };
    } catch (err) {
        console.error("❌ Sesión inválida:", err);
        return null;
    }
}


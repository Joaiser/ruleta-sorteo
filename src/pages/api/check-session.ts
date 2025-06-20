import { isAdminToken } from "@/lib/auth/auth"

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


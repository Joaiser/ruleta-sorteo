export async function GET() {
    return new Response(null, {
        status: 302,
        headers: {
            "Set-Cookie": "admin_token=; Path=/; Max-Age=0; HttpOnly",
            Location: "/dashboardAdmin/login",
        },
    });
}

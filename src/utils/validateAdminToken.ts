import jwt from "jsonwebtoken"

export function validateToken(token: string | undefined): boolean {
    if (!token) return false

    try {
        const decoded = jwt.verify(token, import.meta.env.JWT_SECRET!)
        //mejoraremos las revisiones más adelantes
        return (decoded as any).role === "admin"
    } catch (error) {
        console.error("Token invalido:", error)
        return false
    }
}
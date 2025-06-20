import jwt from "jsonwebtoken"

type TokenPayload = {
    role: string
    // username?: string
    // exp?: number
    // iat?: number
}

/**
 * Verifica el token y devuelve el payload si es válido
 */

export function decodeToken(token: string | undefined): TokenPayload | null {

    if (!token) return null

    try {
        const decoded = jwt.verify(token, import.meta.env.JWT_SECRET!) as TokenPayload
        return decoded
    } catch (error) {
        console.error("token invalido", error)
        return null
    }
}

/**
 * Verifica si el token es válido y tiene rol de admin
 */
export function isAdminToken(token: string | undefined): boolean {
    const decoded = decodeToken(token)
    return decoded?.role === "admin"
}
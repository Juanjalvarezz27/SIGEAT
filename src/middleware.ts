import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// forzar Node runtime
export const runtime = "nodejs"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ruta pública (login)
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Leer cookie de sesión (Node sí soporta esto)
  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token")

  // Sin sesión → redirect al login
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Con sesión → permitir
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api/auth).*)",
  ],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/src/lib/prisma"

export const runtime = "nodejs"

const ADMIN_ONLY_ROUTES = [
  '/home/estadisticas',
  '/home/configuracion',
  '/home/usuarios'
]

const AUTHENTICATED_ROUTES = [
  '/home',
  '/home/perfil'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acceso a rutas públicas
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Ruta pública (login)
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Obtener token de sesión
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // Si no hay token → redirect al login
  if (!token) {
    const loginUrl = new URL("/", request.url)
    loginUrl.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(loginUrl)
  }

  // VERIFICACIÓN CRÍTICA: Revisar si la sesión sigue activa en BD
  if (token.sessionToken) {
    try {
      const session = await prisma.sesion.findUnique({
        where: { 
          sessionToken: token.sessionToken as string 
        }
      })

      // Verificar tres condiciones:
      // 1. Sesión existe
      // 2. Está marcada como activa
      // 3. No ha expirado
      if (!session || !session.activa || session.expires < new Date()) {
        console.log(`⚠️ Sesión ${token.sessionToken} inválida o expirada`)
        
        const loginUrl = new URL("/", request.url)
        loginUrl.searchParams.set("error", "SesiónExpirada")
        loginUrl.searchParams.set("callbackUrl", encodeURI(request.url))
        return NextResponse.redirect(loginUrl)
      }
      
      // Sesión válida, continuar
      
    } catch (error) {
      console.error("Error al verificar sesión:", error)
      const loginUrl = new URL("/", request.url)
      loginUrl.searchParams.set("error", "ErrorVerificacion")
      return NextResponse.redirect(loginUrl)
    }
  }

  // Agregar headers de usuario
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', token.id as string)
  requestHeaders.set('x-user-username', token.username as string)
  requestHeaders.set('x-user-role', token.role as string)

  // Verificar permisos de rol
  const userRole = (token.role as string) || 'usuario'

  // Verificar rutas de admin
  const isAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))
  const isAuthenticatedRoute = AUTHENTICATED_ROUTES.some(route => pathname.startsWith(route))

  if (isAdminRoute && userRole !== 'admin') {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Permitir acceso a rutas autenticadas
  if (isAuthenticatedRoute || isAdminRoute) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Redirigir rutas /home no definidas
  if (pathname.startsWith('/home')) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
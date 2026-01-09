import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// forzar Node runtime
export const runtime = "nodejs"

// Rutas que requieren rol de admin
const ADMIN_ONLY_ROUTES = [
  '/home/estadisticas',
  '/home/configuracion',
  '/home/usuarios'
]

// Rutas que son públicas para usuarios autenticados (todos los roles)
const AUTHENTICATED_ROUTES = [
  '/home',
  '/home/perfil'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acceso a rutas de API de autenticación y archivos estáticos
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') || // Archivos estáticos
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Ruta pública (login) - permitir acceso
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Obtener token usando next-auth/jwt
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // Si no hay token → redirect al login
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Agregar información del usuario a los headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', token.id as string)
  requestHeaders.set('x-user-username', token.username as string)
  requestHeaders.set('x-user-role', token.role as string)

  // Verificar permisos basados en roles
  const userRole = (token.role as string) || 'usuario'
  
  // Verificar si la ruta requiere rol de admin
  const isAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))
  const isAuthenticatedRoute = AUTHENTICATED_ROUTES.some(route => pathname.startsWith(route))

  // Si es una ruta de admin y el usuario no es admin → redirigir a home
  if (isAdminRoute && userRole !== 'admin') {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Si es una ruta que requiere autenticación (todos los roles)
  if (isAuthenticatedRoute || isAdminRoute) {
    // Permitir acceso
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    return response
  }

  // Para cualquier otra ruta no definida, verificar si está dentro de /home
  if (pathname.startsWith('/home')) {
    // Rutas dentro de /home que no están en las listas → denegar por defecto
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // Para rutas fuera de /home, permitir si está autenticado
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
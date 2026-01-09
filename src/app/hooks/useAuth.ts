import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UseAuthExtendedReturn {
  session: ReturnType<typeof useSession>['data']
  status: ReturnType<typeof useSession>['status']
  user: {
    id: string
    username: string
    role: string
  } | null
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: string) => boolean
  isAdmin: boolean
  isUser: boolean
  getUserRole: () => string
  getRoleDisplayName: () => string
  requireRole: (requiredRole: string, redirectPath?: string) => boolean
  requireAdmin: (redirectPath?: string) => boolean
}

export function useAuth(): UseAuthExtendedReturn {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const user = session?.user ? {
    id: session.user.id,
    username: session.user.username,
    role: session.user.role || 'usuario'
  } : null
  
  const hasRole = (role: string): boolean => {
    return user?.role === role
  }
  
  const isAdmin = hasRole('admin')
  const isUser = hasRole('usuario')
  
  const getUserRole = (): string => {
    return user?.role || 'usuario'
  }
  
  const getRoleDisplayName = (): string => {
    switch (user?.role) {
      case 'admin':
        return 'Administrador'
      case 'usuario':
        return 'Usuario Estándar'
      default:
        return 'Usuario'
    }
  }
  
  const requireRole = (requiredRole: string, redirectPath: string = '/home'): boolean => {
    if (status === 'loading') return false
    if (status === 'unauthenticated') {
      router.push('/')
      return false
    }
    if (user?.role !== requiredRole) {
      router.push(redirectPath)
      return false
    }
    return true
  }
  
  const requireAdmin = (redirectPath: string = '/home'): boolean => {
    return requireRole('admin', redirectPath)
  }
  
  return {
    session,
    status,
    user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    hasRole,
    isAdmin,
    isUser,
    getUserRole,
    getRoleDisplayName,
    requireRole,
    requireAdmin
  }
}
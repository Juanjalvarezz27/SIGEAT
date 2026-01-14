import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/prisma'

// Para ejecución EXACTA a 23:59 hora Venezuela (UTC-4)
// Vercel usa UTC, así que necesitamos convertir
// 23:59 UTC-4 = 03:59 UTC del día siguiente (porque UTC-4 = UTC+4 horas adelante)
// Pero Vercel cron usa UTC, así que programamos para 03:59 UTC

export async function GET(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Iniciando cierre automático de sesiones diario...`)
    
    // Marcar TODAS las sesiones activas como inactivas
    const resultado = await prisma.sesion.updateMany({
      where: {
        activa: true,
        expires: {
          // Solo cerrar sesiones que aún no han expirado naturalmente
          gt: new Date()
        }
      },
      data: {
        activa: false,
        actualizada: new Date()
      }
    })

    // También eliminar sesiones expiradas (limpieza)
    const sesionesExpiradas = await prisma.sesion.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })

    console.log(`Cierre completado: ${resultado.count} sesiones activas cerradas`)
    console.log(`Limpieza: ${sesionesExpiradas.count} sesiones expiradas eliminadas`)

    return NextResponse.json({
      success: true,
      mensaje: 'Cierre automático de sesiones completado exitosamente',
      datos: {
        sesiones_cerradas: resultado.count,
        sesiones_eliminadas: sesionesExpiradas.count,
        hora_ejecucion_utc: new Date().toISOString(),
        hora_venezuela: obtenerHoraVenezuela(),
        timestamp: Date.now()
      }
    })

  } catch (error) {
    console.error('Error en cierre automático de sesiones:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        detalle: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// Función auxiliar para obtener hora Venezuela
function obtenerHoraVenezuela(): string {
  const ahoraUTC = new Date()
  const offsetVenezuela = -4 // UTC-4
  const horaVenezuela = new Date(ahoraUTC.getTime() + (offsetVenezuela * 60 * 60 * 1000))
  
  return horaVenezuela.toLocaleTimeString('es-VE', {
    timeZone: 'America/Caracas',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// También permitir POST para Vercel Cron
export async function POST(request: NextRequest) {
  return GET(request)
}

// Método para probar manualmente (solo desarrollo)
export async function PUT(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Método no permitido en producción' },
      { status: 405 }
    )
  }

  return GET(request)
}
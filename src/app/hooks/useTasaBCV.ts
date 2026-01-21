import { useState, useEffect, useCallback } from 'react';

interface TasaBCVState {
  tasa: number | null;
  loading: boolean;
  error: string | null;
  actualizar: () => Promise<void>;
  ultimaActualizacion: string | null;
}

const TASA_POR_DEFECTO = 320; // Tasa de respaldo

const useTasaBCV = (): TasaBCVState => {
  const [tasa, setTasa] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string | null>(null);

  // Formatear número venezolano
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5
    }).format(num);
  };

  // Función para obtener la tasa
  const obtenerTasa = useCallback(async (): Promise<number | null> => {
    try {
      // ------------------------------------------------------------------
      // INTENTO 1: ExchangeRate API (Ahora es la principal)
      // ------------------------------------------------------------------
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (response.ok) {
        const data = await response.json();
        if (data?.rates?.VES) {
          const tasaExchange = data.rates.VES;
          console.log('✅ Tasa obtenida de ExchangeRate:', tasaExchange);
          return tasaExchange;
        }
      }

      // ------------------------------------------------------------------
      // INTENTO 2: API de DolarAPI (Ahora es el respaldo/backup)
      // ------------------------------------------------------------------
      console.log('⚠️ Falló ExchangeRate, intentando con DolarAPI...');
      
      const backupResponse = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (backupResponse.ok) {
        const backupData = await backupResponse.json();
        if (backupData && typeof backupData.promedio === 'number') {
          console.log('✅ Tasa de respaldo obtenida de DolarAPI:', backupData.promedio);
          return backupData.promedio;
        }
      }

      throw new Error('No se pudo obtener tasa de ninguna fuente');

    } catch (apiError) {
      console.error('❌ Error en APIs:', apiError);
      
      // Intento 3: Usar localStorage si hay tasa guardada (Cache local)
      try {
        const tasaGuardada = localStorage.getItem('tasa_bcv');
        if (tasaGuardada) {
          const parsed = JSON.parse(tasaGuardada);
          // Validez de 24 horas
          if (parsed.tasa && new Date().getTime() - new Date(parsed.fecha).getTime() < 24 * 60 * 60 * 1000) {
            console.log('📁 Tasa obtenida de caché local:', parsed.tasa);
            return parsed.tasa;
          }
        }
      } catch (localError) {
        console.error('Error accediendo localStorage:', localError);
      }

      // Tasa por defecto (Hardcoded)
      console.log('🔄 Usando tasa por defecto del sistema');
      return TASA_POR_DEFECTO;
    }
  }, []);

  // Función principal para actualizar la tasa
  const actualizar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const nuevaTasa = await obtenerTasa();
      
      if (nuevaTasa !== null) {
        setTasa(nuevaTasa);
        setUltimaActualizacion(new Date().toISOString());
        
        // Guardar en localStorage para caché
        try {
          localStorage.setItem('tasa_bcv', JSON.stringify({
            tasa: nuevaTasa,
            fecha: new Date().toISOString()
          }));
        } catch (storageError) {
          console.error('Error guardando en localStorage:', storageError);
        }
      } else {
        throw new Error('No se pudo obtener una tasa válida');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al obtener tasa: ${errorMessage}`);
      setTasa(TASA_POR_DEFECTO); // Usar tasa por defecto en caso de error
    } finally {
      setLoading(false);
    }
  }, [obtenerTasa]);

  // Cargar la tasa al iniciar y configurar intervalo
  useEffect(() => {
    actualizar();

    // Configurar actualización automática cada 30 minutos
    const intervalo = setInterval(() => {
      const ahora = new Date();
      const hora = ahora.getHours();
      
      // Solo actualizar en horario laboral (8 AM a 5 PM)
      if (hora >= 8 && hora < 17) {
        console.log('🔄 Actualización automática de tasa');
        actualizar();
      }
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(intervalo);
  }, [actualizar]);

  return {
    tasa,
    loading,
    error,
    actualizar,
    ultimaActualizacion
  };
};

export default useTasaBCV;
// components/CarList.tsx
import { Carro } from '@/data/mockData';
import { Clock, CheckCircle, AlertCircle, User, Phone, Check } from 'lucide-react';
import { useState } from 'react';

interface CarListProps {
  carros: Carro[];
  onUpdateEstado?: (id: number, nuevoEstado: 'Pagado' | 'Pendiente' | 'En Proceso') => void;
}

export default function CarList({ carros, onUpdateEstado }: CarListProps) {
  const [copied, setCopied] = useState<number | null>(null);

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'Pagado': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pendiente': return 'bg-red-100 text-red-700 border-red-200';
      case 'En Proceso': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const copyToClipboard = (telefono: string, id: number) => {
    navigator.clipboard.writeText(telefono);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-3">
      {carros.map((car) => (
        <div key={car.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          
          {/* Información del Cliente */}
          <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-blue-500" />
                <span className="font-medium text-slate-800 text-sm">{car.cliente}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-green-500" />
                <span className="text-slate-600 text-sm">{car.telefono}</span>
                <button
                  onClick={() => copyToClipboard(car.telefono, car.id)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium ml-2"
                >
                </button>
              </div>
            </div>
            
            {/* Botones de acción rápida */}
            <div className="flex gap-1">
              <button
                onClick={() => onUpdateEstado?.(car.id, 'Pagado')}
                className={`p-1.5 rounded-lg ${car.estado === 'Pagado' ? 'bg-green-100 text-green-600' : 'text-slate-400 hover:bg-green-50 hover:text-green-600'}`}
                title="Marcar como Pagado"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={() => onUpdateEstado?.(car.id, 'En Proceso')}
                className={`p-1.5 rounded-lg ${car.estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-600' : 'text-slate-400 hover:bg-yellow-50 hover:text-yellow-600'}`}
                title="Marcar como En Proceso"
              >
                <div className="w-4 h-4 rounded-full border-2 border-current"></div>
              </button>
              <button
                onClick={() => onUpdateEstado?.(car.id, 'Pendiente')}
                className={`p-1.5 rounded-lg ${car.estado === 'Pendiente' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                title="Marcar como Pendiente"
              >
                <AlertCircle size={16} />
              </button>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-800">{car.modelo}</h3>
                <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                  {car.placa}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-2">{car.servicio}</p>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock size={12} />
                <span>{car.hora}</span>
              </div>
            </div>

            {/* Precio y Estado */}
            <div className="text-right">
              <p className="font-bold text-lg text-slate-800 mb-2">
                $ {car.precio.toFixed(2)}
              </p>
              
              <select
                value={car.estado}
                onChange={(e) => onUpdateEstado?.(car.id, e.target.value as any)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusStyle(car.estado)} appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="Pendiente">PENDIENTE</option>
                <option value="En Proceso">EN PROCESO</option>
                <option value="Pagado">PAGADO</option>
              </select>
            </div>
          </div>

          {/* Botón de WhatsApp */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <a
              href={`https://wa.me/${car.telefono.replace(/\D/g, '')}?text=Hola ${car.cliente}, su vehículo ${car.modelo} (Placa: ${car.placa}) está ${car.estado === 'Pagado' ? 'listo para recoger' : car.estado === 'En Proceso' ? 'siendo atendido' : 'pendiente de pago'}. Total: $${car.precio}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              Enviar WhatsApp
            </a>
          </div>
        </div>
      ))}
      
      {/* Mensaje cuando no hay vehículos */}
      {carros.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-100">
          <div className="text-slate-400 mb-2">🚗</div>
          <p className="text-slate-500 font-medium">No hay vehículos registrados</p>
          <p className="text-slate-400 text-sm mt-1">Agrega el primero con el botón +</p>
        </div>
      )}
    </div>
  );
}
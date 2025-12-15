import { Carro } from '@/data/mockData';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface CarListProps {
  carros: Carro[];
}

export default function CarList({ carros }: CarListProps) {
  
  // Función para dar color según el estado
  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'Pagado': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pendiente': return 'bg-red-100 text-red-700 border-red-200';
      case 'En Proceso': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-3 pb-24"> {/* pb-24 para que el botón flotante no tape el último */}
      {carros.map((car) => (
        <div key={car.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          
          {/* Info del Carro */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-800">{car.modelo}</h3>
              <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                {car.placa}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-2">{car.servicio}</p>
            
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={12} />
              <span>{car.hora}</span>
            </div>
          </div>

          {/* Precio y Estado */}
          <div className="text-right">
            <p className="font-bold text-lg text-slate-800 mb-1">
              $ {car.precio}
            </p>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 justify-end ${getStatusStyle(car.estado)}`}>
               {car.estado === 'Pagado' ? <CheckCircle size={10}/> : <AlertCircle size={10}/>}
               {car.estado.toUpperCase()}
            </span>
          </div>
          
        </div>
      ))}
    </div>
  );
}
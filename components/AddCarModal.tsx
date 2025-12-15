import { X } from 'lucide-react';

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (datos: any) => void;
}

export default function AddCarModal({ isOpen, onClose, onSave }: AddCarModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    // Creamos un objeto con los datos del formulario
    const nuevoCarro = {
      modelo: (form.elements.namedItem('modelo') as HTMLInputElement).value,
      placa: (form.elements.namedItem('placa') as HTMLInputElement).value,
      servicio: (form.elements.namedItem('servicio') as HTMLSelectElement).value,
      precio: Number((form.elements.namedItem('precio') as HTMLInputElement).value),
      estado: 'Pendiente', // Por defecto entra como pendiente
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now(), // ID único falso
    };

    onSave(nuevoCarro);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Fondo oscuro transparente */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Contenido del Modal */}
      <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom-10">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Nuevo Ingreso</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Modelo del Carro</label>
            <input name="modelo" type="text" placeholder="Ej: Toyota Yaris" required 
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Placa</label>
              <input name="placa" type="text" placeholder="ABC-123" required 
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Precio ($)</label>
              <input name="precio" type="number" placeholder="0.00" required 
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Servicio</label>
            <select name="servicio" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Lavado Sencillo</option>
              <option>Lavado + Aspirado</option>
              <option>Lavado Motor</option>
              <option>Full Equipo</option>
            </select>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all mt-4">
            Registrar Vehículo
          </button>
        </form>

      </div>
    </div>
  );
}
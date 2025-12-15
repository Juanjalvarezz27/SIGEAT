// data/mockData.ts

export type Carro = {
  id: number;
  placa: string;
  modelo: string;
  servicio: string;
  precio: number;
  estado: 'Pagado' | 'Pendiente' | 'En Proceso';
  hora: string;
};

export const estadisticasHoy = {
  ingresos: 185.00,  // Dinero real en caja
  carrosAtendidos: 12,
  porCobrar: 45.00,  // Dinero en la calle (dolor del cliente)
};

export const listaCarros: Carro[] = [
  { id: 1, placa: 'AB123CD', modelo: 'Toyota Corolla', servicio: 'Lavado General', precio: 6, estado: 'Pagado', hora: '08:30 AM' },
  { id: 2, placa: 'VE999XX', modelo: 'Jeep Grand Cherokee', servicio: 'Lavado + Motor', precio: 25, estado: 'En Proceso', hora: '10:15 AM' },
  { id: 3, placa: 'AA000BB', modelo: 'Ford Fiesta', servicio: 'Lavado General', precio: 6, estado: 'Pagado', hora: '11:00 AM' },
  { id: 4, placa: 'GE552OP', modelo: 'Toyota Hilux', servicio: 'Full Equipo', precio: 30, estado: 'Pendiente', hora: '12:45 PM' },
  { id: 5, placa: 'MB2021Z', modelo: 'Chevrolet Aveo', servicio: 'Lavado General', precio: 6, estado: 'Pendiente', hora: '01:20 PM' },
];
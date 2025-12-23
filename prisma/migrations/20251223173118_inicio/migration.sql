-- CreateTable
CREATE TABLE "TipoVehiculo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,

    CONSTRAINT "TipoVehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioExtra" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ServicioExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoCarro" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EstadoCarro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoPago" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EstadoPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_vehiculo_servicio_extra" (
    "id" SERIAL NOT NULL,
    "registroVehiculoId" INTEGER NOT NULL,
    "servicioExtraId" INTEGER NOT NULL,

    CONSTRAINT "registro_vehiculo_servicio_extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroVehiculo" (
    "id" SERIAL NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'America/Caracas'),
    "nombre" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "tipoVehiculoId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "estadoCarroId" INTEGER NOT NULL,
    "estadoPagoId" INTEGER NOT NULL,
    "precioServicio" DECIMAL(10,2) NOT NULL,
    "precioServiciosExtra" DECIMAL(10,2),
    "precioTotal" DECIMAL(10,2) NOT NULL,
    "precioTotalBs" DECIMAL(15,2),
    "referenciaPago" TEXT,
    "notas" TEXT,
    "tasaCambio" DECIMAL(10,2),

    CONSTRAINT "RegistroVehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoVehiculo_nombre_key" ON "TipoVehiculo"("nombre");

-- CreateIndex
CREATE INDEX "TipoVehiculo_categoria_idx" ON "TipoVehiculo"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_nombre_key" ON "Servicio"("nombre");

-- CreateIndex
CREATE INDEX "Servicio_nombre_idx" ON "Servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ServicioExtra_nombre_key" ON "ServicioExtra"("nombre");

-- CreateIndex
CREATE INDEX "ServicioExtra_nombre_idx" ON "ServicioExtra"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "EstadoCarro_nombre_key" ON "EstadoCarro"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "EstadoPago_nombre_key" ON "EstadoPago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "registro_vehiculo_servicio_extra_registroVehiculoId_servici_key" ON "registro_vehiculo_servicio_extra"("registroVehiculoId", "servicioExtraId");

-- CreateIndex
CREATE INDEX "RegistroVehiculo_placa_idx" ON "RegistroVehiculo"("placa");

-- CreateIndex
CREATE INDEX "RegistroVehiculo_cedula_idx" ON "RegistroVehiculo"("cedula");

-- CreateIndex
CREATE INDEX "RegistroVehiculo_fechaHora_idx" ON "RegistroVehiculo"("fechaHora");

-- CreateIndex
CREATE INDEX "RegistroVehiculo_estadoCarroId_idx" ON "RegistroVehiculo"("estadoCarroId");

-- CreateIndex
CREATE INDEX "RegistroVehiculo_estadoPagoId_idx" ON "RegistroVehiculo"("estadoPagoId");

-- CreateIndex
CREATE INDEX "RegistroVehiculo_telefono_idx" ON "RegistroVehiculo"("telefono");

-- AddForeignKey
ALTER TABLE "registro_vehiculo_servicio_extra" ADD CONSTRAINT "registro_vehiculo_servicio_extra_registroVehiculoId_fkey" FOREIGN KEY ("registroVehiculoId") REFERENCES "RegistroVehiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_vehiculo_servicio_extra" ADD CONSTRAINT "registro_vehiculo_servicio_extra_servicioExtraId_fkey" FOREIGN KEY ("servicioExtraId") REFERENCES "ServicioExtra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroVehiculo" ADD CONSTRAINT "RegistroVehiculo_tipoVehiculoId_fkey" FOREIGN KEY ("tipoVehiculoId") REFERENCES "TipoVehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroVehiculo" ADD CONSTRAINT "RegistroVehiculo_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroVehiculo" ADD CONSTRAINT "RegistroVehiculo_estadoCarroId_fkey" FOREIGN KEY ("estadoCarroId") REFERENCES "EstadoCarro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroVehiculo" ADD CONSTRAINT "RegistroVehiculo_estadoPagoId_fkey" FOREIGN KEY ("estadoPagoId") REFERENCES "EstadoPago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

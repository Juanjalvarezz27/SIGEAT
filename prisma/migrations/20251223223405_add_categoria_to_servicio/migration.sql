/*
  Warnings:

  - Added the required column `categoria` to the `Servicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RegistroVehiculo" ALTER COLUMN "fechaHora" SET DEFAULT (now() AT TIME ZONE 'America/Caracas');

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "categoria" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Servicio_categoria_idx" ON "Servicio"("categoria");

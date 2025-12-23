-- AlterTable
ALTER TABLE "RegistroVehiculo" ALTER COLUMN "fechaHora" SET DEFAULT (now() AT TIME ZONE 'America/Caracas');

-- CreateTable
CREATE TABLE "usuarios_sistema" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_sistema_username_key" ON "usuarios_sistema"("username");

-- CreateIndex
CREATE INDEX "usuarios_sistema_username_idx" ON "usuarios_sistema"("username");

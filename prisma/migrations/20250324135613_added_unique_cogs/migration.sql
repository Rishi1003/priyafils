/*
  Warnings:

  - A unique constraint covering the columns `[time_id]` on the table `CpCogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `HdpeCogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `MdCogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `MonofilCogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `MonofilSFGnFGClosingStock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `MonofilSFGnFGOpeningStock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `MonofilSFGnFGPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `RmConsumptionCogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `TotalCogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `TradingCogs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CpCogs_time_id_key" ON "CpCogs"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "HdpeCogs_time_id_key" ON "HdpeCogs"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MdCogs_time_id_key" ON "MdCogs"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MonofilCogs_time_id_key" ON "MonofilCogs"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MonofilSFGnFGClosingStock_time_id_key" ON "MonofilSFGnFGClosingStock"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MonofilSFGnFGOpeningStock_time_id_key" ON "MonofilSFGnFGOpeningStock"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MonofilSFGnFGPurchase_time_id_key" ON "MonofilSFGnFGPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "RmConsumptionCogs_time_id_key" ON "RmConsumptionCogs"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TotalCogs_time_id_key" ON "TotalCogs"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TradingCogs_time_id_key" ON "TradingCogs"("time_id");

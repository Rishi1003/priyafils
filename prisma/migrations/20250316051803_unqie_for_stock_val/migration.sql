/*
  Warnings:

  - A unique constraint covering the columns `[time_id,material_type]` on the table `stock_valuation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stock_valuation_time_id_material_type_key" ON "stock_valuation"("time_id", "material_type");

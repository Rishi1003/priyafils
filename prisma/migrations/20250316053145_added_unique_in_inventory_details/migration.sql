/*
  Warnings:

  - A unique constraint covering the columns `[time_id,materialName]` on the table `inventoryDetails` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "inventoryDetails_time_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "inventoryDetails_time_id_materialName_key" ON "inventoryDetails"("time_id", "materialName");

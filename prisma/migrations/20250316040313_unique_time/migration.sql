/*
  Warnings:

  - A unique constraint covering the columns `[time_id]` on the table `HDPEStockQtyAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `MBStockQtyAnalysis` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HDPEStockQtyAnalysis_time_id_key" ON "HDPEStockQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MBStockQtyAnalysis_time_id_key" ON "MBStockQtyAnalysis"("time_id");

/*
  Warnings:

  - You are about to drop the `TradingPL` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TradingPL";

-- CreateTable
CREATE TABLE "TradingPLOtherPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TradingPLOtherPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradingPLOtherPurchase_time_id_key" ON "TradingPLOtherPurchase"("time_id");

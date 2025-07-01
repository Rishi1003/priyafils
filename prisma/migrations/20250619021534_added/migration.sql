/*
  Warnings:

  - You are about to drop the `TradinPLExpenses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TradinPLExpenses";

-- CreateTable
CREATE TABLE "TradingPLExpenses" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "Conveyance_Charges" DOUBLE PRECISION NOT NULL,
    "salary_And_Wages" DOUBLE PRECISION NOT NULL,
    "commision_on_Sales" DOUBLE PRECISION NOT NULL,
    "travelling_charges" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TradingPLExpenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradingPLExpenses_time_id_key" ON "TradingPLExpenses"("time_id");

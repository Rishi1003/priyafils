/*
  Warnings:

  - You are about to drop the `fixedExpenses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "fixedExpenses";

-- CreateTable
CREATE TABLE "fixedExpenses2" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "employeesWelfareExp" DOUBLE PRECISION NOT NULL,
    "salariesOffice" DOUBLE PRECISION NOT NULL,
    "directorsRemuneration" DOUBLE PRECISION NOT NULL,
    "depreciation" DOUBLE PRECISION NOT NULL,
    "admnExpns" DOUBLE PRECISION NOT NULL,
    "sellingExpns" DOUBLE PRECISION NOT NULL,
    "financeCostIntOnECLGS" DOUBLE PRECISION NOT NULL,
    "financeCostIntOnDeposits" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fixedExpenses2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fixedExpenses2_time_id_key" ON "fixedExpenses2"("time_id");

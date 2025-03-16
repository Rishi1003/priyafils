/*
  Warnings:

  - You are about to drop the column `timeId` on the `AdministrativeExpense` table. All the data in the column will be lost.
  - You are about to drop the column `timeId` on the `FinancialExpense` table. All the data in the column will be lost.
  - You are about to drop the column `timeId` on the `SellingExpense` table. All the data in the column will be lost.
  - You are about to drop the column `timeId` on the `extrasManaufacturingDirectExpenses` table. All the data in the column will be lost.
  - You are about to drop the column `timeId` on the `fixedExpenses` table. All the data in the column will be lost.
  - You are about to drop the column `timeId` on the `manufacturingExpensesDirectExpenses` table. All the data in the column will be lost.
  - You are about to drop the column `timeId` on the `variableAndDirect` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[time_id]` on the table `AdministrativeExpense` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `CPPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `CPStock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `ConsolidatedQtyAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `ConsumablesPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `FinancialExpense` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `HDPEMonofilamentFabricatorQtyAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `HDPEMonofilamentFactoryQtyAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `HDPEWovenFabricQtyAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `MBPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `MSNPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `PPSPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `RMSFGFGSeparatedQtyAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `SellingExpense` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `ShadeNetsTradingQtyAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `SravyaOthersPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `TRDNGPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `TSNConsumedPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `TSNPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `TSNRMConsumedPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `TSNTotalRMConsumedPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `TotalPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `WastageComputationQtyAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `WasteQtyAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `YarnPurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `extrasManaufacturingDirectExpenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `fixedExpenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `hdpePurchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `inventoryDetails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `manufacturingExpensesDirectExpenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `salesDetails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `stock_valuation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[time_id]` on the table `variableAndDirect` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `time_id` to the `AdministrativeExpense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_id` to the `FinancialExpense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_id` to the `SellingExpense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_id` to the `extrasManaufacturingDirectExpenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_id` to the `fixedExpenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_id` to the `manufacturingExpensesDirectExpenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_id` to the `variableAndDirect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdministrativeExpense" DROP COLUMN "timeId",
ADD COLUMN     "time_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FinancialExpense" DROP COLUMN "timeId",
ADD COLUMN     "time_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SellingExpense" DROP COLUMN "timeId",
ADD COLUMN     "time_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "extrasManaufacturingDirectExpenses" DROP COLUMN "timeId",
ADD COLUMN     "time_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "fixedExpenses" DROP COLUMN "timeId",
ADD COLUMN     "time_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "manufacturingExpensesDirectExpenses" DROP COLUMN "timeId",
ADD COLUMN     "time_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "variableAndDirect" DROP COLUMN "timeId",
ADD COLUMN     "time_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AdministrativeExpense_time_id_key" ON "AdministrativeExpense"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "CPPurchase_time_id_key" ON "CPPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "CPStock_time_id_key" ON "CPStock"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidatedQtyAnalysis_time_id_key" ON "ConsolidatedQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumablesPurchase_time_id_key" ON "ConsumablesPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialExpense_time_id_key" ON "FinancialExpense"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "HDPEMonofilamentFabricatorQtyAnalysis_time_id_key" ON "HDPEMonofilamentFabricatorQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "HDPEMonofilamentFactoryQtyAnalysis_time_id_key" ON "HDPEMonofilamentFactoryQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "HDPEWovenFabricQtyAnalysis_time_id_key" ON "HDPEWovenFabricQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MBPurchase_time_id_key" ON "MBPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MSNPurchase_time_id_key" ON "MSNPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "PPSPurchase_time_id_key" ON "PPSPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "RMSFGFGSeparatedQtyAnalysis_time_id_key" ON "RMSFGFGSeparatedQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "SellingExpense_time_id_key" ON "SellingExpense"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShadeNetsTradingQtyAnalysis_time_id_key" ON "ShadeNetsTradingQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "SravyaOthersPurchase_time_id_key" ON "SravyaOthersPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TRDNGPurchase_time_id_key" ON "TRDNGPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TSNConsumedPurchase_time_id_key" ON "TSNConsumedPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TSNPurchase_time_id_key" ON "TSNPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TSNRMConsumedPurchase_time_id_key" ON "TSNRMConsumedPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TSNTotalRMConsumedPurchase_time_id_key" ON "TSNTotalRMConsumedPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TotalPurchase_time_id_key" ON "TotalPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "WastageComputationQtyAnalysis_time_id_key" ON "WastageComputationQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "WasteQtyAnalysis_time_id_key" ON "WasteQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "YarnPurchase_time_id_key" ON "YarnPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "extrasManaufacturingDirectExpenses_time_id_key" ON "extrasManaufacturingDirectExpenses"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "fixedExpenses_time_id_key" ON "fixedExpenses"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "hdpePurchase_time_id_key" ON "hdpePurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventoryDetails_time_id_key" ON "inventoryDetails"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturingExpensesDirectExpenses_time_id_key" ON "manufacturingExpensesDirectExpenses"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "salesDetails_time_id_key" ON "salesDetails"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_valuation_time_id_key" ON "stock_valuation"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "variableAndDirect_time_id_key" ON "variableAndDirect"("time_id");

/*
  Warnings:

  - You are about to drop the `MBStockQtuAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductionQtyAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hdpeMonofilament` to the `WastageComputationQtyAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hdpeMonofilamentSec` to the `WastageComputationQtyAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packingMaterials` to the `WastageComputationQtyAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalProduction` to the `WastageComputationQtyAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wastage` to the `WastageComputationQtyAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wastagePercentage` to the `WastageComputationQtyAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WastageComputationQtyAnalysis" ADD COLUMN     "hdpeMonofilament" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hdpeMonofilamentSec" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "packingMaterials" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalProduction" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "wastage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "wastagePercentage" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "MBStockQtuAnalysis";

-- DropTable
DROP TABLE "ProductionQtyAnalysis";

-- CreateTable
CREATE TABLE "MBStockQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingStock" DOUBLE PRECISION NOT NULL,
    "purchases" DOUBLE PRECISION NOT NULL,
    "purchaseReturn" DOUBLE PRECISION NOT NULL,
    "consumptionMonofil" DOUBLE PRECISION NOT NULL,
    "consumptionShadeNet" DOUBLE PRECISION NOT NULL,
    "consumptionPPFabricSales" DOUBLE PRECISION NOT NULL,
    "consumption" DOUBLE PRECISION NOT NULL,
    "sales" DOUBLE PRECISION NOT NULL,
    "closingStock" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MBStockQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPStock" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingStock" DOUBLE PRECISION NOT NULL,
    "purchases" DOUBLE PRECISION NOT NULL,
    "purchaseReturn" DOUBLE PRECISION NOT NULL,
    "consumptionMonofil" DOUBLE PRECISION NOT NULL,
    "consumptionShadeNet" DOUBLE PRECISION NOT NULL,
    "consumptionPPFabric" DOUBLE PRECISION NOT NULL,
    "consumption" DOUBLE PRECISION NOT NULL,
    "closingStock" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CPStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HDPEWovenFabricQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL,
    "production" DOUBLE PRECISION NOT NULL,
    "purchases" DOUBLE PRECISION NOT NULL,
    "productionJWSalesReturn" DOUBLE PRECISION NOT NULL,
    "sales" DOUBLE PRECISION NOT NULL,
    "stockTransferSales" DOUBLE PRECISION NOT NULL,
    "jwIssues" DOUBLE PRECISION NOT NULL,
    "samplesAndCutPieces" DOUBLE PRECISION NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HDPEWovenFabricQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hdpePurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "hdpePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MBPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MBPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CPPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumablesPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ConsumablesPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TSNPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TSNPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MSNPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MSNPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PPSPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PPSPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TotalPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TotalPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SravyaOthersPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SravyaOthersPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "YarnPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TSNRMConsumedPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TSNRMConsumedPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TSNConsumedPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TSNConsumedPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TSNTotalRMConsumedPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TSNTotalRMConsumedPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TRDNGPurchase" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "kgs" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TRDNGPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventoryDetails" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "materialName" TEXT NOT NULL,
    "outwardQty" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "inventoryDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salesDetails" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "grandTotalValue" DOUBLE PRECISION NOT NULL,
    "grandTotalOutward" DOUBLE PRECISION NOT NULL,
    "otherIncome" DOUBLE PRECISION NOT NULL,
    "grossSales" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "tcs" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "creditNote" DOUBLE PRECISION NOT NULL,
    "pal1FinalSales" DOUBLE PRECISION NOT NULL,
    "RMPurchaseForSales" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "salesDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturingExpensesDirectExpenses" (
    "id" SERIAL NOT NULL,
    "timeId" INTEGER NOT NULL,
    "employeeRemuneration" DOUBLE PRECISION NOT NULL,
    "coolieCartage" DOUBLE PRECISION NOT NULL,
    "depreciation" DOUBLE PRECISION NOT NULL,
    "fabricationChargesBlore" DOUBLE PRECISION NOT NULL,
    "fabricationChargesSircilla" DOUBLE PRECISION NOT NULL,
    "factoryRepair" DOUBLE PRECISION NOT NULL,
    "forwardingChargesPaid" DOUBLE PRECISION NOT NULL,
    "freightInwards" DOUBLE PRECISION NOT NULL,
    "insuranceOnAssets" DOUBLE PRECISION NOT NULL,
    "itcReversal" DOUBLE PRECISION NOT NULL,
    "medicalExpenses" DOUBLE PRECISION NOT NULL,
    "packingMaterial" DOUBLE PRECISION NOT NULL,
    "electricity" DOUBLE PRECISION NOT NULL,
    "processingCharges" DOUBLE PRECISION NOT NULL,
    "rent" DOUBLE PRECISION NOT NULL,
    "repairAMC" DOUBLE PRECISION NOT NULL,
    "yarnProcessing" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "manufacturingExpensesDirectExpenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extrasManaufacturingDirectExpenses" (
    "id" SERIAL NOT NULL,
    "timeId" INTEGER NOT NULL,
    "manufacturing" DOUBLE PRECISION NOT NULL,
    "itcReserved" DOUBLE PRECISION NOT NULL,
    "inHouseFabrication" DOUBLE PRECISION NOT NULL,
    "fabrication" DOUBLE PRECISION NOT NULL,
    "directExpenses" DOUBLE PRECISION NOT NULL,
    "deprecation" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "totalFabrication" DOUBLE PRECISION NOT NULL,
    "inHouseQty" DOUBLE PRECISION NOT NULL,
    "fabricators" DOUBLE PRECISION NOT NULL,
    "yarnProcessingQty" DOUBLE PRECISION NOT NULL,
    "indirect" DOUBLE PRECISION NOT NULL,
    "totalExpenses" DOUBLE PRECISION NOT NULL,
    "PnL" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "extrasManaufacturingDirectExpenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variableAndDirect" (
    "id" SERIAL NOT NULL,
    "timeId" INTEGER NOT NULL,
    "wagesFabric" DOUBLE PRECISION NOT NULL,
    "wagesInspectionDispatch" DOUBLE PRECISION NOT NULL,
    "fabricationCharges" DOUBLE PRECISION NOT NULL,
    "wagesYarn" DOUBLE PRECISION NOT NULL,
    "yarnProcessingCharges" DOUBLE PRECISION NOT NULL,
    "freightInward" DOUBLE PRECISION NOT NULL,
    "powerBill" DOUBLE PRECISION NOT NULL,
    "rmMachinery" DOUBLE PRECISION NOT NULL,
    "rmElectricals" DOUBLE PRECISION NOT NULL,
    "rent" DOUBLE PRECISION NOT NULL,
    "packingCharges" DOUBLE PRECISION NOT NULL,
    "misc" DOUBLE PRECISION NOT NULL,
    "workingCapitalBankCharges" DOUBLE PRECISION NOT NULL,
    "workingCapitalLc" DOUBLE PRECISION NOT NULL,
    "workingCapitalOcc" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "variableAndDirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixedExpenses" (
    "id" SERIAL NOT NULL,
    "timeId" INTEGER NOT NULL,
    "employeesWelfareExp" DOUBLE PRECISION NOT NULL,
    "salariesOffice" DOUBLE PRECISION NOT NULL,
    "directorsRemuneration" DOUBLE PRECISION NOT NULL,
    "depreciation" DOUBLE PRECISION NOT NULL,
    "admnExpns" DOUBLE PRECISION NOT NULL,
    "sellingExpns" DOUBLE PRECISION NOT NULL,
    "financeCostIntOnECLGS" DOUBLE PRECISION NOT NULL,
    "financeCostIntOnDeposits" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fixedExpenses_pkey" PRIMARY KEY ("id")
);

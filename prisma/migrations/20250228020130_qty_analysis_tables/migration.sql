/*
  Warnings:

  - You are about to alter the column `value` on the `stock_valuation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "stock_valuation" ALTER COLUMN "qty" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "HDPEStockQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingStock" DOUBLE PRECISION NOT NULL,
    "purchases" DOUBLE PRECISION NOT NULL,
    "jobWorkReceipts" DOUBLE PRECISION NOT NULL,
    "purchaseReturn" DOUBLE PRECISION NOT NULL,
    "consumptionMonofil" DOUBLE PRECISION NOT NULL,
    "consumptionShadeNet" DOUBLE PRECISION NOT NULL,
    "consumptionPPFabric" DOUBLE PRECISION NOT NULL,
    "sales" DOUBLE PRECISION NOT NULL,
    "closingStock" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HDPEStockQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MBStockQtuAnalysis" (
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

    CONSTRAINT "MBStockQtuAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WastageComputationQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "consumptionMonofil" DOUBLE PRECISION NOT NULL,
    "consumptionShadeNet" DOUBLE PRECISION NOT NULL,
    "consumptionPPFabric" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WastageComputationQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "hdpeMonofilament" DOUBLE PRECISION NOT NULL,
    "hdpeMonofilamentSec" DOUBLE PRECISION NOT NULL,
    "packingMaterials" DOUBLE PRECISION NOT NULL,
    "totalProduction" DOUBLE PRECISION NOT NULL,
    "wastage" DOUBLE PRECISION NOT NULL,
    "wastagePercentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductionQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HDPEMonofilamentFactoryQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL,
    "production" DOUBLE PRECISION NOT NULL,
    "jobWorkProduction" DOUBLE PRECISION NOT NULL,
    "rf" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "consumption" DOUBLE PRECISION NOT NULL,
    "sales" DOUBLE PRECISION NOT NULL,
    "jobWork" DOUBLE PRECISION NOT NULL,
    "totalConsumption" DOUBLE PRECISION NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HDPEMonofilamentFactoryQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HDPEMonofilamentFabricatorQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL,
    "hdpeMonofilamentReceipt" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "hdpeWovenFabrics" DOUBLE PRECISION NOT NULL,
    "hdpeWovenFabricsRF" DOUBLE PRECISION NOT NULL,
    "hdpeWovenFabricsSec" DOUBLE PRECISION NOT NULL,
    "waste" DOUBLE PRECISION NOT NULL,
    "ropeHanks" DOUBLE PRECISION NOT NULL,
    "totalProcessed" DOUBLE PRECISION NOT NULL,
    "wastePercentage" DOUBLE PRECISION NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HDPEMonofilamentFabricatorQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShadeNetsTradingQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL,
    "receiptsTapeShadePurchase" DOUBLE PRECISION NOT NULL,
    "receiptsTSNJobWork" DOUBLE PRECISION NOT NULL,
    "receiptsMonoShade" DOUBLE PRECISION NOT NULL,
    "receiptsWeedMat" DOUBLE PRECISION NOT NULL,
    "receiptsMulch" DOUBLE PRECISION NOT NULL,
    "receiptsPPFabric" DOUBLE PRECISION NOT NULL,
    "receiptsPPSacks" DOUBLE PRECISION NOT NULL,
    "totalReceipts" DOUBLE PRECISION NOT NULL,
    "buringLoss" DOUBLE PRECISION NOT NULL,
    "salesMSN" DOUBLE PRECISION NOT NULL,
    "salesTSN" DOUBLE PRECISION NOT NULL,
    "salesWeedMat" DOUBLE PRECISION NOT NULL,
    "salesMulch" DOUBLE PRECISION NOT NULL,
    "salesPPFabric" DOUBLE PRECISION NOT NULL,
    "salesPPSacks" DOUBLE PRECISION NOT NULL,
    "salesTotal" DOUBLE PRECISION NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ShadeNetsTradingQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL,
    "receipts" DOUBLE PRECISION NOT NULL,
    "issuedForProcessing" DOUBLE PRECISION NOT NULL,
    "buringLoss" DOUBLE PRECISION NOT NULL,
    "sales" DOUBLE PRECISION NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WasteQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsolidatedQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingStock" DOUBLE PRECISION NOT NULL,
    "purchases" DOUBLE PRECISION NOT NULL,
    "totalStock" DOUBLE PRECISION NOT NULL,
    "closingStock" DOUBLE PRECISION NOT NULL,
    "consumption" DOUBLE PRECISION NOT NULL,
    "sales" DOUBLE PRECISION NOT NULL,
    "waste" DOUBLE PRECISION NOT NULL,
    "wastePercentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ConsolidatedQtyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RMSFGFGSeparatedQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingStockRM" DOUBLE PRECISION NOT NULL,
    "purchases" DOUBLE PRECISION NOT NULL,
    "totalStock" DOUBLE PRECISION NOT NULL,
    "closingStockRM" DOUBLE PRECISION NOT NULL,
    "saleFromRM" DOUBLE PRECISION NOT NULL,
    "saleFromSFGFG" DOUBLE PRECISION NOT NULL,
    "saleAndWasteConsumption" DOUBLE PRECISION NOT NULL,
    "sales" DOUBLE PRECISION NOT NULL,
    "waste" DOUBLE PRECISION NOT NULL,
    "wastePercentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RMSFGFGSeparatedQtyAnalysis_pkey" PRIMARY KEY ("id")
);

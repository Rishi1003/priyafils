-- CreateTable
CREATE TABLE "TimeRecord" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_valuation" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "material_type" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "stock_valuation_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "WastageComputationQtyAnalysis" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "consumptionMonofil" DOUBLE PRECISION NOT NULL,
    "consumptionShadeNet" DOUBLE PRECISION NOT NULL,
    "consumptionPPFabric" DOUBLE PRECISION NOT NULL,
    "hdpeMonofilament" DOUBLE PRECISION NOT NULL,
    "hdpeMonofilamentSec" DOUBLE PRECISION NOT NULL,
    "packingMaterials" DOUBLE PRECISION NOT NULL,
    "totalProduction" DOUBLE PRECISION NOT NULL,
    "wastage" DOUBLE PRECISION NOT NULL,
    "wastagePercentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WastageComputationQtyAnalysis_pkey" PRIMARY KEY ("id")
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
    "time_id" INTEGER NOT NULL,
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
    "time_id" INTEGER NOT NULL,
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
    "time_id" INTEGER NOT NULL,
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
    "time_id" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "AdministrativeExpense" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AdministrativeExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialExpense" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FinancialExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellingExpense" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SellingExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimeRecord_time_key" ON "TimeRecord"("time");

-- CreateIndex
CREATE UNIQUE INDEX "stock_valuation_time_id_material_type_key" ON "stock_valuation"("time_id", "material_type");

-- CreateIndex
CREATE UNIQUE INDEX "HDPEStockQtyAnalysis_time_id_key" ON "HDPEStockQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MBStockQtyAnalysis_time_id_key" ON "MBStockQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "CPStock_time_id_key" ON "CPStock"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "WastageComputationQtyAnalysis_time_id_key" ON "WastageComputationQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "HDPEMonofilamentFactoryQtyAnalysis_time_id_key" ON "HDPEMonofilamentFactoryQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "HDPEMonofilamentFabricatorQtyAnalysis_time_id_key" ON "HDPEMonofilamentFabricatorQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "HDPEWovenFabricQtyAnalysis_time_id_key" ON "HDPEWovenFabricQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShadeNetsTradingQtyAnalysis_time_id_key" ON "ShadeNetsTradingQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "WasteQtyAnalysis_time_id_key" ON "WasteQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidatedQtyAnalysis_time_id_key" ON "ConsolidatedQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "RMSFGFGSeparatedQtyAnalysis_time_id_key" ON "RMSFGFGSeparatedQtyAnalysis"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "hdpePurchase_time_id_key" ON "hdpePurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MBPurchase_time_id_key" ON "MBPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "CPPurchase_time_id_key" ON "CPPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumablesPurchase_time_id_key" ON "ConsumablesPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TSNPurchase_time_id_key" ON "TSNPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MSNPurchase_time_id_key" ON "MSNPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "PPSPurchase_time_id_key" ON "PPSPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TotalPurchase_time_id_key" ON "TotalPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "SravyaOthersPurchase_time_id_key" ON "SravyaOthersPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "YarnPurchase_time_id_key" ON "YarnPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TSNRMConsumedPurchase_time_id_key" ON "TSNRMConsumedPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TSNConsumedPurchase_time_id_key" ON "TSNConsumedPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TSNTotalRMConsumedPurchase_time_id_key" ON "TSNTotalRMConsumedPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TRDNGPurchase_time_id_key" ON "TRDNGPurchase"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventoryDetails_time_id_materialName_key" ON "inventoryDetails"("time_id", "materialName");

-- CreateIndex
CREATE UNIQUE INDEX "salesDetails_time_id_key" ON "salesDetails"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturingExpensesDirectExpenses_time_id_key" ON "manufacturingExpensesDirectExpenses"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "extrasManaufacturingDirectExpenses_time_id_key" ON "extrasManaufacturingDirectExpenses"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "variableAndDirect_time_id_key" ON "variableAndDirect"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "fixedExpenses_time_id_key" ON "fixedExpenses"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "AdministrativeExpense_time_id_type_key" ON "AdministrativeExpense"("time_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialExpense_time_id_type_key" ON "FinancialExpense"("time_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "SellingExpense_time_id_type_key" ON "SellingExpense"("time_id", "type");

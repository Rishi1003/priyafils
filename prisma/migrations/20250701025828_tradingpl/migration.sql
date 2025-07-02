-- CreateTable
CREATE TABLE "TradingConsumption" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "openingStockQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openingStockValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "purchases_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "purchases_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closing_stock_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "closing_stock_value" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "TradingConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradingConsumption_time_id_key" ON "TradingConsumption"("time_id");

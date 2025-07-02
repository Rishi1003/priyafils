-- AlterTable
ALTER TABLE "TradingConsumption" ADD COLUMN     "consumptionTrading_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "consumptionTrading_value" DOUBLE PRECISION NOT NULL DEFAULT 0;

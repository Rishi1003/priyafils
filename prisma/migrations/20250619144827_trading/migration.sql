-- CreateTable
CREATE TABLE "TradingPL" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TradingPL_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradingPL_time_id_key" ON "TradingPL"("time_id");

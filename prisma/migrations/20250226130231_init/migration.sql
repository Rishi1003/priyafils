-- CreateTable
CREATE TABLE "stock_valuation" (
    "id" SERIAL NOT NULL,
    "time_id" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "material_type" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "stock_valuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeRecord" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimeRecord_time_key" ON "TimeRecord"("time");

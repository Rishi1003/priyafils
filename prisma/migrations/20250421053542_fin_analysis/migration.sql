-- CreateTable
CREATE TABLE "Sales" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "monofil" DOUBLE PRECISION NOT NULL,
    "trading" DOUBLE PRECISION NOT NULL,
    "rm" DOUBLE PRECISION NOT NULL,
    "otherInc" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consumption" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "monofil" DOUBLE PRECISION NOT NULL,
    "mfPurchase" DOUBLE PRECISION NOT NULL,
    "sfgFG" DOUBLE PRECISION NOT NULL,
    "tradingSFGfg" DOUBLE PRECISION NOT NULL,
    "rm" DOUBLE PRECISION NOT NULL,
    "totalMonofil" DOUBLE PRECISION NOT NULL,
    "totalConsumption" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingExpenses" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "totalVariableAndDirect" DOUBLE PRECISION NOT NULL,
    "frabic" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OperatingExpenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedExpenses" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "depreciation" DOUBLE PRECISION NOT NULL,
    "overheads" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FixedExpenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sales_time_id_key" ON "Sales"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "Consumption_time_id_key" ON "Consumption"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "OperatingExpenses_time_id_key" ON "OperatingExpenses"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "FixedExpenses_time_id_key" ON "FixedExpenses"("time_id");

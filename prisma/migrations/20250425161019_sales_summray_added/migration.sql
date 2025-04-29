-- CreateTable
CREATE TABLE "McfSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "McfSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WmSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WmSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InhSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InhSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "YarnSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TsnSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TsnSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MsnSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MsnSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiscSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MiscSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PpsSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PpsSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RmSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RmSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteSalesSummary" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "salesKgs" DOUBLE PRECISION NOT NULL,
    "salesValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WasteSalesSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "McfSalesSummary_time_id_key" ON "McfSalesSummary"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "WmSalesSummary_time_id_key" ON "WmSalesSummary"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "InhSalesSummary_time_id_key" ON "InhSalesSummary"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "YarnSalesSummary_time_id_key" ON "YarnSalesSummary"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "TsnSalesSummary_time_id_key" ON "TsnSalesSummary"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MsnSalesSummary_time_id_key" ON "MsnSalesSummary"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "MiscSalesSummary_time_id_key" ON "MiscSalesSummary"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "PpsSalesSummary_time_id_key" ON "PpsSalesSummary"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "RmSalesSummary_time_id_key" ON "RmSalesSummary"("time_id");

-- CreateIndex
CREATE UNIQUE INDEX "WasteSalesSummary_time_id_key" ON "WasteSalesSummary"("time_id");

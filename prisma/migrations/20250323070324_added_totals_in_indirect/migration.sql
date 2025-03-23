-- CreateTable
CREATE TABLE "Totals" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Totals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Totals_time_id_type_key" ON "Totals"("time_id", "type");

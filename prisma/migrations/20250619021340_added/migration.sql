-- CreateTable
CREATE TABLE "TradinPLExpenses" (
    "id" SERIAL NOT NULL,
    "time_id" INTEGER NOT NULL,
    "Conveyance_Charges" DOUBLE PRECISION NOT NULL,
    "salary_And_Wages" DOUBLE PRECISION NOT NULL,
    "commision_on_Sales" DOUBLE PRECISION NOT NULL,
    "travelling_charges" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TradinPLExpenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradinPLExpenses_time_id_key" ON "TradinPLExpenses"("time_id");

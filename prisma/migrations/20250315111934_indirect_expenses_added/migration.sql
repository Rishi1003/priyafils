-- CreateTable
CREATE TABLE "AdministrativeExpense" (
    "id" SERIAL NOT NULL,
    "timeId" INTEGER NOT NULL,
    "vehicleFourWheelersExpenses" DOUBLE PRECISION NOT NULL,
    "installationProgrammingCharges" DOUBLE PRECISION NOT NULL,
    "arrearsOfTax" DOUBLE PRECISION NOT NULL,
    "auditFees" DOUBLE PRECISION NOT NULL,
    "booksPeriodical" DOUBLE PRECISION NOT NULL,
    "buildingRepairMaintenanceExp" DOUBLE PRECISION NOT NULL,
    "computerStoresMaint" DOUBLE PRECISION NOT NULL,
    "conveyanceCharges" DOUBLE PRECISION NOT NULL,
    "goldenJubileeCelebrationExps" DOUBLE PRECISION NOT NULL,
    "donation" DOUBLE PRECISION NOT NULL,
    "generalExpenses" DOUBLE PRECISION NOT NULL,
    "generalRepairMaintainance" DOUBLE PRECISION NOT NULL,
    "auditFeesGST" DOUBLE PRECISION NOT NULL,
    "incomeTaxExps" DOUBLE PRECISION NOT NULL,
    "medicalExps" DOUBLE PRECISION NOT NULL,
    "medicalclaimExps" DOUBLE PRECISION NOT NULL,
    "officeMaintenance" DOUBLE PRECISION NOT NULL,
    "poojaExpenses" DOUBLE PRECISION NOT NULL,
    "postageTelTelexCharges" DOUBLE PRECISION NOT NULL,
    "printingStationary" DOUBLE PRECISION NOT NULL,
    "professionalCharges" DOUBLE PRECISION NOT NULL,
    "professionalConsultationCharges" DOUBLE PRECISION NOT NULL,
    "ratesTaxes" DOUBLE PRECISION NOT NULL,
    "registrationRenewal" DOUBLE PRECISION NOT NULL,
    "repairsServiceCharges" DOUBLE PRECISION NOT NULL,
    "freightCharges" DOUBLE PRECISION NOT NULL,
    "roundOff" DOUBLE PRECISION NOT NULL,
    "seminarTrainingDvtExp" DOUBLE PRECISION NOT NULL,
    "softwareMaintenance" DOUBLE PRECISION NOT NULL,
    "serviceCharges" DOUBLE PRECISION NOT NULL,
    "subscriptionMembership" DOUBLE PRECISION NOT NULL,
    "tdsInterestOnTDS" DOUBLE PRECISION NOT NULL,
    "telephoneChargesAirtel" DOUBLE PRECISION NOT NULL,
    "telephoneChargesBSNL" DOUBLE PRECISION NOT NULL,
    "fluctuationInForeignCurrency" DOUBLE PRECISION NOT NULL,
    "VehicleMaintainance" DOUBLE PRECISION NOT NULL,
    "WatchWard" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AdministrativeExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialExpense" (
    "id" SERIAL NOT NULL,
    "timeId" INTEGER NOT NULL,
    "BankCharges" DOUBLE PRECISION NOT NULL,
    "InterestAndBankChargesILC" DOUBLE PRECISION NOT NULL,
    "InterestOnUnsecuredLoansMonthly" DOUBLE PRECISION NOT NULL,
    "InterestOnCarLoans" DOUBLE PRECISION NOT NULL,
    "InterestOnOCC" DOUBLE PRECISION NOT NULL,
    "InterestOnPNBHousingFinance" DOUBLE PRECISION NOT NULL,
    "InterestOnTermLoan" DOUBLE PRECISION NOT NULL,
    "LoanProcessingCharges" DOUBLE PRECISION NOT NULL,
    "InterestToOthersVSL" DOUBLE PRECISION NOT NULL,
    "InterestToDepositors" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FinancialExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellingExpense" (
    "id" SERIAL NOT NULL,
    "timeId" INTEGER NOT NULL,
    "Advertisement" DOUBLE PRECISION NOT NULL,
    "AdvertisementBadDebts" DOUBLE PRECISION NOT NULL,
    "CommissionOnSales" DOUBLE PRECISION NOT NULL,
    "DebitBalancesWrittenOff" DOUBLE PRECISION NOT NULL,
    "FreightOutwardsOceanFreight" DOUBLE PRECISION NOT NULL,
    "GiftArticles" DOUBLE PRECISION NOT NULL,
    "MarketingExpenses" DOUBLE PRECISION NOT NULL,
    "SalesPromotion" DOUBLE PRECISION NOT NULL,
    "TransportationCharges" DOUBLE PRECISION NOT NULL,
    "TravellingExpenses" DOUBLE PRECISION NOT NULL,
    "DiscountAllowed" DOUBLE PRECISION NOT NULL,
    "Discount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SellingExpense_pkey" PRIMARY KEY ("id")
);

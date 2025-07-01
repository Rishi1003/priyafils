/*
  Warnings:

  - You are about to drop the column `Conveyance_Charges` on the `TradingPLExpenses` table. All the data in the column will be lost.
  - You are about to drop the column `commision_on_Sales` on the `TradingPLExpenses` table. All the data in the column will be lost.
  - You are about to drop the column `salary_And_Wages` on the `TradingPLExpenses` table. All the data in the column will be lost.
  - Added the required column `commision_on_sales` to the `TradingPLExpenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conveyance_charges` to the `TradingPLExpenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_and_wages` to the `TradingPLExpenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TradingPLExpenses" DROP COLUMN "Conveyance_Charges",
DROP COLUMN "commision_on_Sales",
DROP COLUMN "salary_And_Wages",
ADD COLUMN     "commision_on_sales" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "conveyance_charges" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "salary_and_wages" DOUBLE PRECISION NOT NULL;

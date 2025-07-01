/*
  Warnings:

  - You are about to drop the column `commision_on_sales` on the `TradingPLExpenses` table. All the data in the column will be lost.
  - Added the required column `commission_on_sales` to the `TradingPLExpenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TradingPLExpenses" DROP COLUMN "commision_on_sales",
ADD COLUMN     "commission_on_sales" DOUBLE PRECISION NOT NULL;

/*
  Warnings:

  - Changed the type of `time_id` on the `stock_valuation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "stock_valuation" DROP COLUMN "time_id",
ADD COLUMN     "time_id" INTEGER NOT NULL;

/*
  Warnings:

  - A unique constraint covering the columns `[property_id,crop]` on the table `farm_harvest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "farm_harvest_property_id_crop_key" ON "farm_harvest"("property_id", "crop");

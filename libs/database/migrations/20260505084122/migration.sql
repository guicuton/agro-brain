/*
  Warnings:

  - A unique constraint covering the columns `[harvest_id,alias]` on the table `farm_crops` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "farm_crops_harvest_id_alias_key" ON "farm_crops"("harvest_id", "alias");

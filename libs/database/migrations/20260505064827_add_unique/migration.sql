/*
  Warnings:

  - A unique constraint covering the columns `[owner_id,alias]` on the table `farm_property` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "farm_property_owner_id_alias_key" ON "farm_property"("owner_id", "alias");

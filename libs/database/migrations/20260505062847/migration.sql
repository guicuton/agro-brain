-- CreateEnum
CREATE TYPE "AREA_TYPE" AS ENUM ('HECTAR', 'METER', 'KM');

-- CreateTable
CREATE TABLE "login" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(40) NOT NULL,
    "password" VARCHAR(60) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_owner" (
    "id" TEXT NOT NULL,
    "fullname" VARCHAR(255) NOT NULL,
    "doc" VARCHAR(20) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "farm_owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_property" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "alias" VARCHAR(255) NOT NULL,
    "area_total" INTEGER NOT NULL,
    "area_arable" INTEGER NOT NULL,
    "area_vegetation" INTEGER NOT NULL,
    "area_type" "AREA_TYPE" NOT NULL DEFAULT 'HECTAR',
    "city" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "metadata" JSONB,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_harvest" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "metadata" JSONB,
    "crop" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_crops" (
    "id" TEXT NOT NULL,
    "alias" VARCHAR(255) NOT NULL,
    "area_arable" INTEGER NOT NULL,
    "owner_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "harvest_id" TEXT NOT NULL,
    "metadata" JSONB,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_crops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_username_key" ON "login"("username");

-- CreateIndex
CREATE INDEX "login_username_idx" ON "login"("username");

-- CreateIndex
CREATE INDEX "login_password_idx" ON "login"("password");

-- CreateIndex
CREATE INDEX "login_email_idx" ON "login"("email");

-- CreateIndex
CREATE INDEX "farm_owner_city_idx" ON "farm_owner"("city");

-- CreateIndex
CREATE INDEX "farm_owner_state_idx" ON "farm_owner"("state");

-- CreateIndex
CREATE INDEX "farm_owner_city_state_idx" ON "farm_owner"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "farm_owner_doc_key" ON "farm_owner"("doc");

-- CreateIndex
CREATE INDEX "farm_property_city_idx" ON "farm_property"("city");

-- CreateIndex
CREATE INDEX "farm_property_state_idx" ON "farm_property"("state");

-- CreateIndex
CREATE INDEX "farm_property_city_state_idx" ON "farm_property"("city", "state");

-- CreateIndex
CREATE INDEX "farm_harvest_crop_idx" ON "farm_harvest"("crop");

-- CreateIndex
CREATE INDEX "farm_crops_area_arable_idx" ON "farm_crops"("area_arable");

-- AddForeignKey
ALTER TABLE "farm_property" ADD CONSTRAINT "farm_property_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "farm_owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_harvest" ADD CONSTRAINT "farm_harvest_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "farm_owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_harvest" ADD CONSTRAINT "farm_harvest_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "farm_property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_crops" ADD CONSTRAINT "farm_crops_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "farm_owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_crops" ADD CONSTRAINT "farm_crops_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "farm_property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_crops" ADD CONSTRAINT "farm_crops_harvest_id_fkey" FOREIGN KEY ("harvest_id") REFERENCES "farm_harvest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

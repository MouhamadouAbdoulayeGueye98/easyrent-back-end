-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('LOCATION', 'VENTE');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "charges" DOUBLE PRECISION,
ADD COLUMN     "deposit" DOUBLE PRECISION,
ADD COLUMN     "listingType" "ListingType",
ADD COLUMN     "region" TEXT;

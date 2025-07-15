-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "affiliateId" INTEGER;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

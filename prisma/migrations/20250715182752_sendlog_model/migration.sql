-- CreateTable
CREATE TABLE "SendLog" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "chatId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SendLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SendLog" ADD CONSTRAINT "SendLog_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

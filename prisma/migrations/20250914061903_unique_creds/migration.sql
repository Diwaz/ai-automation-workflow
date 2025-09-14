/*
  Warnings:

  - A unique constraint covering the columns `[apiKey]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Credential_apiKey_key" ON "public"."Credential"("apiKey");

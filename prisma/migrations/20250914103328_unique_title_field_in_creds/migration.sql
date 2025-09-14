/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Credential_title_key" ON "public"."Credential"("title");

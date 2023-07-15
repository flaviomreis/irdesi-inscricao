/*
  Warnings:

  - A unique constraint covering the columns `[short_name]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Course_short_name_key" ON "Course"("short_name");

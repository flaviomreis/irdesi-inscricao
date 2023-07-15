/*
  Warnings:

  - A unique constraint covering the columns `[course_id,institution_id,description]` on the table `CourseClass` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `CourseClass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseClass" ADD COLUMN     "description" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CourseClass_course_id_institution_id_description_key" ON "CourseClass"("course_id", "institution_id", "description");

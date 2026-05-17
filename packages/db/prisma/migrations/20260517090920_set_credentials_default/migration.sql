/*
 Warnings:
 
 - Made the column `auth_type` on table `User` required. This step will fail if there are existing NULL values in that column.
 
 */
-- AlterTable
-- Fill existing NULLs before making column required
UPDATE "User"
SET "auth_type" = 'Credentials'
WHERE "auth_type" IS NULL;
-- Now make it required with default
ALTER TABLE "User"
ALTER COLUMN "auth_type"
SET NOT NULL;
ALTER TABLE "User"
ALTER COLUMN "auth_type"
SET DEFAULT 'Credentials';
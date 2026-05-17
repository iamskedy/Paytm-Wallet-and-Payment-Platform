-- AlterEnum
ALTER TYPE "AuthType" ADD VALUE 'Credentials';

-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "number" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auth_type" "AuthType",
ALTER COLUMN "number" SET DEFAULT '',
ALTER COLUMN "password" SET DEFAULT '';

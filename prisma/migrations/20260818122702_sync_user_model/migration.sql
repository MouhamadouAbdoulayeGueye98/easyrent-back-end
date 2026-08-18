-- Ajouter les nouvelles colonnes
ALTER TABLE "User"
ADD COLUMN "city" TEXT,
ADD COLUMN "publisherType" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Préparer le nouvel enum
BEGIN;

CREATE TYPE "Role_new" AS ENUM ('CLIENT', 'ANNONCEUR', 'ADMIN');

ALTER TABLE "User"
ALTER COLUMN "role" DROP DEFAULT;

-- Transformer directement les anciennes valeurs vers les nouvelles
ALTER TABLE "User"
ALTER COLUMN "role" TYPE "Role_new"
USING (
  CASE "role"::text
    WHEN 'LOCATAIRE' THEN 'CLIENT'::"Role_new"
    WHEN 'PROPRIETAIRE' THEN 'ANNONCEUR'::"Role_new"
    WHEN 'ADMIN' THEN 'ADMIN'::"Role_new"
  END
);

ALTER TYPE "Role" RENAME TO "Role_old";

ALTER TYPE "Role_new" RENAME TO "Role";

DROP TYPE "Role_old";

ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'CLIENT';

COMMIT;

-- name devient nullable
ALTER TABLE "User"
ALTER COLUMN "name" DROP NOT NULL;

-- Le DEFAULT servait uniquement à remplir les anciennes lignes
ALTER TABLE "User"
ALTER COLUMN "updatedAt" DROP DEFAULT;
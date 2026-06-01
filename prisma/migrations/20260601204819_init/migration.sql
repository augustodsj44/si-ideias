-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'outro',
    "typeLabel" TEXT NOT NULL DEFAULT 'Outro',
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "author" TEXT NOT NULL DEFAULT 'Anônimo',
    "votes" INTEGER NOT NULL DEFAULT 0,
    "duplicateIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

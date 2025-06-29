-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recordings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `duration` INTEGER NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'FAILED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `format` VARCHAR(191) NOT NULL DEFAULT 'webm',
    `totalSize` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,

    INDEX `recordings_userId_idx`(`userId`),
    INDEX `recordings_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `recordings_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audio_chunks` (
    `id` VARCHAR(191) NOT NULL,
    `recordingId` VARCHAR(191) NOT NULL,
    `chunkIndex` INTEGER NOT NULL,
    `audioData` LONGBLOB NOT NULL,
    `size` INTEGER NOT NULL,
    `duration` INTEGER NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audio_chunks_recordingId_idx`(`recordingId`),
    INDEX `audio_chunks_recordingId_chunkIndex_idx`(`recordingId`, `chunkIndex`),
    UNIQUE INDEX `audio_chunks_recordingId_chunkIndex_key`(`recordingId`, `chunkIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `recordings` ADD CONSTRAINT `recordings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audio_chunks` ADD CONSTRAINT `audio_chunks_recordingId_fkey` FOREIGN KEY (`recordingId`) REFERENCES `recordings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

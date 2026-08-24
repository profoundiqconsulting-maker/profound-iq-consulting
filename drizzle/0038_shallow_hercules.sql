CREATE TABLE `course_active_positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`moduleIndex` int NOT NULL DEFAULT 0,
	`lessonId` varchar(180),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_active_positions_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_active_positions_enrollmentId_unique` UNIQUE(`enrollmentId`)
);
--> statement-breakpoint
CREATE TABLE `course_payment_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(160) NOT NULL,
	`enrollmentId` int,
	`paymentStageId` int,
	`reference` varchar(120),
	`eventType` varchar(64) NOT NULL,
	`transactionStatus` varchar(32),
	`amountKes` int,
	`currency` varchar(8),
	`payload` json,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`errorMessage` text,
	CONSTRAINT `course_payment_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_payment_events_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
ALTER TABLE `course_payment_stages` ADD `lastCheckedAt` timestamp;--> statement-breakpoint
ALTER TABLE `course_payment_stages` ADD `lastError` text;--> statement-breakpoint
ALTER TABLE `course_payment_stages` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;
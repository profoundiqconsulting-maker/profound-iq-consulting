CREATE TABLE `admin_analytics_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminOpenId` varchar(64) NOT NULL,
	`paidBenchmark` int NOT NULL DEFAULT 35,
	`downloadBenchmark` int NOT NULL DEFAULT 60,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_analytics_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_analytics_settings_adminOpenId_unique` UNIQUE(`adminOpenId`)
);
--> statement-breakpoint
ALTER TABLE `scheduled_exports` ADD `retentionDays` int DEFAULT 30 NOT NULL;
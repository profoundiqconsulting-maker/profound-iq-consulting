CREATE TABLE `psychometric_delivery_acknowledgement_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attemptId` int NOT NULL,
	`actorOpenId` varchar(64) NOT NULL,
	`actorName` varchar(160),
	`note` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `psychometric_delivery_acknowledgement_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychometric_recommendation_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`testSlug` varchar(120) NOT NULL,
	`courseSlug` varchar(120) NOT NULL,
	`rating` int NOT NULL,
	`goal` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `psychometric_recommendation_feedback_id` PRIMARY KEY(`id`),
	CONSTRAINT `psychometric_recommendation_feedback_unique` UNIQUE(`userOpenId`,`testSlug`,`courseSlug`)
);
--> statement-breakpoint
ALTER TABLE `scheduled_exports` ADD `pausedAt` timestamp;--> statement-breakpoint
ALTER TABLE `scheduled_exports` ADD `pausedByOpenId` varchar(64);--> statement-breakpoint
ALTER TABLE `scheduled_exports` ADD `pausedByName` varchar(160);
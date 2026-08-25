CREATE TABLE `login_unlock_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetOpenId` varchar(64) NOT NULL,
	`targetEmail` varchar(320),
	`actorOpenId` varchar(64) NOT NULL,
	`actorName` varchar(160),
	`clearedAttemptCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_unlock_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `login_events` ADD `networkAddress` varchar(64);
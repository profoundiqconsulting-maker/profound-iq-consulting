CREATE TABLE `assessment_drafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`answers` json NOT NULL,
	`currentModule` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resumedAt` timestamp,
	CONSTRAINT `assessment_drafts_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_drafts_tokenHash_unique` UNIQUE(`tokenHash`)
);

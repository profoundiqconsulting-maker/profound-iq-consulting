CREATE TABLE `assessment_reflection_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attemptId` int NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`dimensionKey` varchar(48) NOT NULL,
	`promptIndex` int NOT NULL,
	`promptText` text NOT NULL,
	`note` text,
	`status` varchar(16) NOT NULL DEFAULT 'planned',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_reflection_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_reflection_attempt_prompt_unique` UNIQUE(`attemptId`,`dimensionKey`,`promptIndex`)
);
--> statement-breakpoint
CREATE INDEX `assessment_reflection_owner_attempt_idx` ON `assessment_reflection_responses` (`ownerOpenId`,`attemptId`);
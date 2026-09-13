CREATE TABLE `communication_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(240) NOT NULL,
	`body` text NOT NULL,
	`recipientType` varchar(24) NOT NULL,
	`filters` json NOT NULL DEFAULT ('{}'),
	`sentByOpenId` varchar(64) NOT NULL,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communication_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communication_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(240) NOT NULL,
	`description` text NOT NULL,
	`assignedToOpenId` varchar(64),
	`assignedToName` varchar(160),
	`status` varchar(24) NOT NULL DEFAULT 'open',
	`priority` varchar(16) NOT NULL DEFAULT 'medium',
	`relatedConversationId` int,
	`createdByOpenId` varchar(64) NOT NULL,
	`dueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communication_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`analysisJson` json NOT NULL,
	`insightsJson` json NOT NULL,
	`advisoryJson` json NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`generatedByOpenId` varchar(64) NOT NULL,
	CONSTRAINT `survey_analysis_id` PRIMARY KEY(`id`),
	CONSTRAINT `survey_analysis_surveyId_unique` UNIQUE(`surveyId`)
);
--> statement-breakpoint
CREATE TABLE `survey_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`respondentOpenId` varchar(64),
	`respondentEmail` varchar(320),
	`answers` json NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `survey_responses_id` PRIMARY KEY(`id`)
);

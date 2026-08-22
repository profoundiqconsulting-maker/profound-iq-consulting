CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventName` varchar(80) NOT NULL,
	`attemptId` int,
	`userOpenId` varchar(64),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseTitle` varchar(180) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'new',
	`consentedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateKey` varchar(80) NOT NULL,
	`label` varchar(160) NOT NULL,
	`subject` varchar(240) NOT NULL,
	`body` text NOT NULL,
	`updatedByOpenId` varchar(64),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_templates_templateKey_unique` UNIQUE(`templateKey`)
);

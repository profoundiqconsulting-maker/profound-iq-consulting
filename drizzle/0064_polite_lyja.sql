CREATE TABLE `course_access_grant_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`courseSlug` varchar(120) NOT NULL,
	`action` varchar(16) NOT NULL,
	`actorOpenId` varchar(64) NOT NULL,
	`actorName` varchar(160),
	`actorEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_access_grant_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_access_grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`courseSlug` varchar(120) NOT NULL,
	`grantedByOpenId` varchar(64) NOT NULL,
	`grantedByName` varchar(160),
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_access_grants_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_access_grant_user_course_unique` UNIQUE(`userOpenId`,`courseSlug`)
);
--> statement-breakpoint
CREATE INDEX `course_access_grant_audit_user_idx` ON `course_access_grant_audits` (`userOpenId`);--> statement-breakpoint
CREATE INDEX `course_access_grant_audit_created_idx` ON `course_access_grant_audits` (`createdAt`);--> statement-breakpoint
CREATE INDEX `course_access_grant_user_idx` ON `course_access_grants` (`userOpenId`);--> statement-breakpoint
CREATE INDEX `course_access_grant_course_idx` ON `course_access_grants` (`courseSlug`);
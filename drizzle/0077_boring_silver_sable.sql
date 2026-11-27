CREATE TABLE `assessment_roadmap_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`courseSlug` varchar(120) NOT NULL,
	`source` varchar(32) NOT NULL DEFAULT 'assessment',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_roadmap_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_roadmap_user_course_unique` UNIQUE(`userOpenId`,`courseSlug`)
);
--> statement-breakpoint
CREATE INDEX `assessment_roadmap_user_idx` ON `assessment_roadmap_items` (`userOpenId`);
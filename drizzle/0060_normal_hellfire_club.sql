CREATE TABLE `course_saved_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`courseSlug` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_saved_courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_saved_course_unique` UNIQUE(`userOpenId`,`courseSlug`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `recommendationAnswers` json;--> statement-breakpoint
CREATE INDEX `course_saved_course_learner_idx` ON `course_saved_courses` (`userOpenId`);
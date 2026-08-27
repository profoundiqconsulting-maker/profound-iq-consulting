CREATE TABLE `course_lesson_illustration_bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`courseSlug` varchar(120) NOT NULL,
	`lessonId` varchar(180) NOT NULL,
	`illustrationMode` varchar(24) NOT NULL,
	`label` varchar(180) NOT NULL,
	`title` varchar(240) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_lesson_illustration_bookmarks_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_illustration_bookmark_unique` UNIQUE(`userOpenId`,`courseSlug`,`lessonId`,`illustrationMode`)
);
--> statement-breakpoint
CREATE INDEX `course_illustration_bookmark_learner_course_idx` ON `course_lesson_illustration_bookmarks` (`userOpenId`,`courseSlug`);
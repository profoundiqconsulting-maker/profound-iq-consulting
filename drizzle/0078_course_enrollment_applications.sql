CREATE TABLE `course_enrollment_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollment_id` int NOT NULL,
	`user_open_id` varchar(64) NOT NULL,
	`course_slug` varchar(120) NOT NULL,
	`application` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_enrollment_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_enrollment_applications_enrollment_unique` UNIQUE(`enrollment_id`)
);
--> statement-breakpoint
CREATE INDEX `course_enrollment_applications_owner_course_idx` ON `course_enrollment_applications` (`user_open_id`,`course_slug`);
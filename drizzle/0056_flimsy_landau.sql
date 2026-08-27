CREATE TABLE `course_lesson_response_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_open_id` varchar(64) NOT NULL,
	`enrollment_id` int NOT NULL,
	`response_id` int NOT NULL,
	`review_id` int NOT NULL,
	`course_slug` varchar(160) NOT NULL,
	`lesson_id` varchar(180) NOT NULL,
	`task_id` varchar(120) NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_lesson_response_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `course_feedback_notifications_user_unread_idx` ON `course_lesson_response_notifications` (`user_open_id`,`read_at`);--> statement-breakpoint
CREATE INDEX `course_feedback_notifications_review_idx` ON `course_lesson_response_notifications` (`review_id`);
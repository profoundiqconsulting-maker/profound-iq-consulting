CREATE TABLE `course_lesson_response_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`responseId` int NOT NULL,
	`enrollmentId` int NOT NULL,
	`lessonId` varchar(180) NOT NULL,
	`taskId` varchar(120) NOT NULL,
	`reviewerOpenId` varchar(64) NOT NULL,
	`reviewerName` varchar(160),
	`feedback` text NOT NULL,
	`status` varchar(24) NOT NULL DEFAULT 'reviewed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_lesson_response_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_response_reviewer_unique` UNIQUE(`responseId`,`reviewerOpenId`)
);

CREATE TABLE `course_lesson_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`lessonId` varchar(180) NOT NULL,
	`taskId` varchar(120) NOT NULL,
	`responseHtml` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_lesson_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_enrollment_lesson_task_unique` UNIQUE(`enrollmentId`,`lessonId`,`taskId`)
);

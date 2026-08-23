CREATE TABLE `course_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`certificateNumber` varchar(80) NOT NULL,
	`recipientName` varchar(160) NOT NULL,
	`courseTitle` varchar(180) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'issued',
	`fileKey` varchar(512),
	`fileUrl` varchar(512),
	`emailStatus` varchar(32) NOT NULL DEFAULT 'pending',
	`emailedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_certificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE TABLE `course_learner_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`courseSlug` varchar(120) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_learner_enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_learner_course_unique` UNIQUE(`userOpenId`,`courseSlug`)
);
--> statement-breakpoint
CREATE TABLE `course_lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`lessonId` varchar(180) NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_lesson_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_enrollment_lesson_unique` UNIQUE(`enrollmentId`,`lessonId`)
);
--> statement-breakpoint
CREATE TABLE `course_payment_stages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`stage` int NOT NULL,
	`amountKes` int NOT NULL,
	`paymentStatus` varchar(32) NOT NULL DEFAULT 'pending',
	`paystackReference` varchar(120),
	`initializedAt` timestamp,
	`paidAt` timestamp,
	CONSTRAINT `course_payment_stages_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_payment_stages_paystackReference_unique` UNIQUE(`paystackReference`),
	CONSTRAINT `course_enrollment_stage_unique` UNIQUE(`enrollmentId`,`stage`)
);
--> statement-breakpoint
CREATE TABLE `course_quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`moduleId` varchar(120) NOT NULL,
	`score` int NOT NULL,
	`passed` boolean NOT NULL DEFAULT false,
	`answers` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_quiz_attempts_id` PRIMARY KEY(`id`)
);

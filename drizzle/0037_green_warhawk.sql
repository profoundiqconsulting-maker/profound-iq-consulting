CREATE TABLE `course_delivery_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`enrollmentId` int NOT NULL,
	`certificateId` int,
	`step` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL,
	`recipientEmail` varchar(320),
	`organizationName` varchar(180),
	`metadata` json,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_delivery_events_id` PRIMARY KEY(`id`)
);

CREATE TABLE `course_recommendation_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`careerGoal` varchar(80) NOT NULL,
	`skillLevel` varchar(24) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_recommendation_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `course_recommendation_history_learner_idx` ON `course_recommendation_history` (`userOpenId`);--> statement-breakpoint
CREATE INDEX `course_recommendation_history_created_idx` ON `course_recommendation_history` (`userOpenId`,`createdAt`);
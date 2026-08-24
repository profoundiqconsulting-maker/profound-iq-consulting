CREATE TABLE `career_path_active_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`moduleIndex` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `career_path_active_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `career_path_active_modules_userOpenId_unique` UNIQUE(`userOpenId`)
);

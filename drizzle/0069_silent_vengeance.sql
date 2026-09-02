CREATE TABLE `user_activity_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`activityType` varchar(32) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`href` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_activity_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_nav_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`navHref` varchar(255) NOT NULL,
	`navLabel` varchar(120) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_nav_favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_nav_favorites_user_href_unique` UNIQUE(`userOpenId`,`navHref`)
);
--> statement-breakpoint
CREATE INDEX `user_activity_events_user_idx` ON `user_activity_events` (`userOpenId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `user_nav_favorites_user_idx` ON `user_nav_favorites` (`userOpenId`);
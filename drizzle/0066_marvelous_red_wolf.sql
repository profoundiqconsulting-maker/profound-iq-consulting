CREATE TABLE `certificate_usage_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificateNumber` varchar(80) NOT NULL,
	`enrollmentId` int NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`eventType` varchar(24) NOT NULL,
	`platform` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificate_usage_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_certificate_settings` ADD `fieldLayout` json;
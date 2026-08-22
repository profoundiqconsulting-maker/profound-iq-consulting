CREATE TABLE `email_preview_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateKey` varchar(80) NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(240) NOT NULL,
	`status` varchar(20) NOT NULL,
	`errorMessage` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_preview_deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_export_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exportKey` varchar(80) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` varchar(512) NOT NULL,
	`rowCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_export_runs_id` PRIMARY KEY(`id`)
);

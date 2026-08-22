CREATE TABLE `scheduled_exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exportKey` varchar(80) NOT NULL,
	`scheduleTaskUid` varchar(65),
	`lastRunAt` timestamp,
	`lastFileKey` varchar(512),
	`lastFileUrl` varchar(512),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_exports_id` PRIMARY KEY(`id`),
	CONSTRAINT `scheduled_exports_exportKey_unique` UNIQUE(`exportKey`)
);

CREATE TABLE `unlock_audit_export_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminOpenId` varchar(64) NOT NULL,
	`adminName` varchar(160),
	`filename` varchar(220) NOT NULL,
	`filterSummary` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `unlock_audit_export_downloads_id` PRIMARY KEY(`id`)
);

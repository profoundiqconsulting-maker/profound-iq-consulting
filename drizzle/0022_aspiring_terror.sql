CREATE TABLE `report_share_audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shareId` int NOT NULL,
	`attemptId` int NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`eventType` varchar(24) NOT NULL,
	`recipientPurpose` varchar(40),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `report_share_audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `report_shares` ADD `recipientPurpose` varchar(40);
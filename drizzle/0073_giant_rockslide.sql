CREATE TABLE `payment_reconciliation_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stageId` int,
	`userOpenId` varchar(64),
	`action` varchar(32) NOT NULL,
	`outcome` varchar(32) NOT NULL,
	`note` text,
	`ip` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_reconciliation_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `payment_reconciliation_log_stage_idx` ON `payment_reconciliation_log` (`stageId`);--> statement-breakpoint
CREATE INDEX `payment_reconciliation_log_user_idx` ON `payment_reconciliation_log` (`userOpenId`);
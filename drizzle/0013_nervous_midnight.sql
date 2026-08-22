CREATE TABLE `delivery_log_export_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestedByOpenId` varchar(64) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'queued',
	`filters` json,
	`fileKey` varchar(512),
	`fileUrl` varchar(512),
	`rowCount` int,
	`errorMessage` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `delivery_log_export_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification_revocation_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetOpenId` varchar(64) NOT NULL,
	`targetEmail` varchar(320),
	`actorOpenId` varchar(64) NOT NULL,
	`actorName` varchar(160),
	`actorEmail` varchar(320),
	`reason` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_revocation_audits_id` PRIMARY KEY(`id`)
);

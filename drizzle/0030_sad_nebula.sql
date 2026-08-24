CREATE TABLE `organization_approval_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invitationId` int NOT NULL,
	`organizationName` varchar(180) NOT NULL,
	`organizationEmail` varchar(320) NOT NULL,
	`requesterOpenId` varchar(64) NOT NULL,
	`actorOpenId` varchar(64) NOT NULL,
	`eventType` varchar(24) NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organization_approval_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`organizationName` varchar(180) NOT NULL,
	`organizationEmail` varchar(320) NOT NULL,
	`requesterOpenId` varchar(64) NOT NULL,
	`reportType` varchar(40) NOT NULL,
	`reportId` int NOT NULL,
	`status` varchar(24) NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp NOT NULL,
	`reminderSentAt` timestamp,
	`reviewedAt` timestamp,
	`reviewedByOpenId` varchar(64),
	`reviewNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organization_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_invitations_tokenHash_unique` UNIQUE(`tokenHash`)
);

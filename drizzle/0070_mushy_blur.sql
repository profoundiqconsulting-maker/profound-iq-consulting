CREATE TABLE `admin_system_settings` (
	`settingKey` varchar(80) NOT NULL,
	`settingValue` text NOT NULL,
	`masked` varchar(20) NOT NULL DEFAULT 'plain',
	`updatedByOpenId` varchar(64) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_system_settings_settingKey` PRIMARY KEY(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participantOpenIds` json NOT NULL,
	`subject` varchar(200),
	`contextType` varchar(32) NOT NULL,
	`contextId` varchar(120),
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`createdByOpenId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastMessageAt` timestamp,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messageNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`messageId` int NOT NULL,
	`conversationId` int NOT NULL,
	`type` varchar(20) NOT NULL,
	`sentEmail` boolean NOT NULL DEFAULT false,
	`emailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messageNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderOpenId` varchar(64) NOT NULL,
	`senderName` varchar(160) NOT NULL,
	`senderRole` varchar(20) NOT NULL,
	`body` text NOT NULL,
	`htmlBody` text,
	`attachmentUrls` json DEFAULT ('[]'),
	`readBy` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(240) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(120) NOT NULL,
	`fileUrl` varchar(512),
	`fileType` varchar(64),
	`fileSize` int,
	`coverImageUrl` varchar(512),
	`status` varchar(24) NOT NULL DEFAULT 'published',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdByOpenId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(240) NOT NULL,
	`description` text NOT NULL,
	`type` varchar(24) NOT NULL,
	`status` varchar(24) NOT NULL DEFAULT 'draft',
	`options` json NOT NULL,
	`responses` json NOT NULL DEFAULT ('{}'),
	`totalResponses` int NOT NULL DEFAULT 0,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`createdByOpenId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `surveys_id` PRIMARY KEY(`id`)
);

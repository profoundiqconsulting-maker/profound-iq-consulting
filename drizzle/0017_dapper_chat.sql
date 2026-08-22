CREATE TABLE `admin_security_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminOpenId` varchar(64) NOT NULL,
	`alertThreshold` int NOT NULL DEFAULT 5,
	`reviewWindowDays` int NOT NULL DEFAULT 7,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_security_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_security_settings_admin_unique` UNIQUE(`adminOpenId`)
);
--> statement-breakpoint
CREATE TABLE `login_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64),
	`identifierType` varchar(16) NOT NULL,
	`success` boolean NOT NULL,
	`failureCode` varchar(32),
	`networkHash` varchar(64) NOT NULL,
	`userAgent` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`networkHash` varchar(64),
	`userAgent` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_sessions_token_hash_unique` UNIQUE(`tokenHash`)
);

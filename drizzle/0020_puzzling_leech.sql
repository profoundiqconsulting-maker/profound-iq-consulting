CREATE TABLE `report_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attemptId` int NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	CONSTRAINT `report_shares_id` PRIMARY KEY(`id`),
	CONSTRAINT `report_shares_tokenHash_unique` UNIQUE(`tokenHash`)
);

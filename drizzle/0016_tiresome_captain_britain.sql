CREATE TABLE `auth_login_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`identifierHash` varchar(64) NOT NULL,
	`networkHash` varchar(64) NOT NULL,
	`failedCount` int NOT NULL DEFAULT 0,
	`windowStartedAt` timestamp NOT NULL,
	`lastFailedAt` timestamp NOT NULL,
	`alertSentAt` timestamp,
	CONSTRAINT `auth_login_attempts_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_login_attempts_identifier_network_unique` UNIQUE(`identifierHash`,`networkHash`)
);

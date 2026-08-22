CREATE TABLE `career_path_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`answers` json NOT NULL,
	`paystackReference` varchar(120),
	`paymentStatus` varchar(32) NOT NULL DEFAULT 'pending',
	`report` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`paidAt` timestamp,
	`consentedAt` timestamp NOT NULL,
	CONSTRAINT `career_path_attempts_id` PRIMARY KEY(`id`),
	CONSTRAINT `career_path_attempts_paystackReference_unique` UNIQUE(`paystackReference`)
);

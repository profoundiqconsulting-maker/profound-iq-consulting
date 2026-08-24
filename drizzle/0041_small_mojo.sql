CREATE TABLE `psychometric_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testSlug` varchar(120) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`answers` json NOT NULL,
	`paystackReference` varchar(120),
	`paymentStatus` varchar(32) NOT NULL DEFAULT 'pending',
	`report` json,
	`reportEmailStatus` varchar(16) NOT NULL DEFAULT 'pending',
	`reportEmailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`paidAt` timestamp,
	`consentedAt` timestamp NOT NULL,
	CONSTRAINT `psychometric_attempts_id` PRIMARY KEY(`id`),
	CONSTRAINT `psychometric_attempts_paystackReference_unique` UNIQUE(`paystackReference`)
);

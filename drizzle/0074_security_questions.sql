CREATE TABLE `resource_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resourceId` int NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`userEmail` varchar(320) NOT NULL,
	`amountKes` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'KES',
	`paystackReference` varchar(120),
	`paymentStatus` varchar(24) NOT NULL DEFAULT 'pending',
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resource_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `resource_purchases_paystackReference_unique` UNIQUE(`paystackReference`)
);
--> statement-breakpoint
ALTER TABLE `resources` ADD `price` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `resources` ADD `currency` varchar(3) DEFAULT 'KES' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `securityQuestion1` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `securityAnswer1Hash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `securityQuestion2` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `securityAnswer2Hash` varchar(255);
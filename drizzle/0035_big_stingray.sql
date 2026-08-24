CREATE TABLE `staff_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(160) NOT NULL,
	`role` varchar(32) NOT NULL DEFAULT 'staff',
	`token_hash` varchar(128) NOT NULL,
	`invited_by_open_id` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`accepted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_invitations_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD `due_date` timestamp;--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD `priority` varchar(16) DEFAULT 'normal' NOT NULL;
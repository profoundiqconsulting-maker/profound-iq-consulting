CREATE TABLE `contact_inquiry_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inquiry_id` int NOT NULL,
	`actor_open_id` varchar(64) NOT NULL,
	`actor_name` varchar(160),
	`actor_email` varchar(320),
	`action` varchar(32) NOT NULL,
	`previous_value` text,
	`next_value` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_inquiry_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD `assigned_to_open_id` varchar(64);--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD `assigned_to_name` varchar(160);
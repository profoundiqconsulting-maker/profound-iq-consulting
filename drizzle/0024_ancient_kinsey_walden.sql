ALTER TABLE `career_path_attempts` ADD `reportEmailStatus` varchar(32) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `career_path_attempts` ADD `reportEmailSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `career_path_attempts` ADD `reportEmailClaimedAt` timestamp;
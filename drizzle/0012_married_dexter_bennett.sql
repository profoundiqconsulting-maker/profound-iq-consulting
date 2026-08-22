ALTER TABLE `email_preview_deliveries` MODIFY COLUMN `body` text;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerifiedAt` timestamp;
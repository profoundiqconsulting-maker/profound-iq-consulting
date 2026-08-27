ALTER TABLE `newsletter_subscribers` MODIFY COLUMN `status` varchar(24) NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `confirmedAt` timestamp;--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `confirmationTokenHash` varchar(64);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `confirmationExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `confirmationSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `unsubscribeTokenHash` varchar(64);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `unsubscribedAt` timestamp;
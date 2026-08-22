ALTER TABLE `admin_security_settings` ADD `loginEventRetentionDays` int DEFAULT 90 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `deviceType` varchar(32);--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `estimatedLocation` varchar(120);--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `trustedDevice` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD `trustExpiresAt` timestamp;
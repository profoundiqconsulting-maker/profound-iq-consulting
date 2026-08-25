ALTER TABLE `psychometric_attempts` ADD `deliveryAcknowledgedAt` timestamp;--> statement-breakpoint
ALTER TABLE `psychometric_attempts` ADD `deliveryAcknowledgedByOpenId` varchar(64);--> statement-breakpoint
ALTER TABLE `psychometric_attempts` ADD `deliveryAcknowledgedByName` varchar(160);--> statement-breakpoint
ALTER TABLE `psychometric_attempts` ADD `deliveryAcknowledgementNote` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `learningGoals` json;
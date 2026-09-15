ALTER TABLE `contact_inquiries` ADD `ticketNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD CONSTRAINT `contact_inquiries_ticketNumber_unique` UNIQUE(`ticketNumber`);
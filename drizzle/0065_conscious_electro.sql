CREATE TABLE `admin_certificate_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminOpenId` varchar(64) NOT NULL,
	`trainerName` varchar(160) NOT NULL DEFAULT 'Stephen Mwihaki',
	`trainerTitle` varchar(160) NOT NULL DEFAULT 'Managing Director',
	`signatureDataUri` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_certificate_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_certificate_settings_adminOpenId_unique` UNIQUE(`adminOpenId`)
);

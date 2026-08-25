CREATE TABLE `site_seo_settings` (
	`settingKey` varchar(80) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedByOpenId` varchar(64) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_seo_settings_settingKey` PRIMARY KEY(`settingKey`)
);

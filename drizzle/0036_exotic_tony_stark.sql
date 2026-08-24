CREATE TABLE `catalog_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`itemType` varchar(32) NOT NULL DEFAULT 'course',
	`title` varchar(180) NOT NULL,
	`strapline` varchar(240) NOT NULL,
	`description` text NOT NULL,
	`audience` varchar(300) NOT NULL,
	`duration` varchar(120) NOT NULL,
	`outcomes` json NOT NULL,
	`priceKes` int NOT NULL DEFAULT 4999,
	`published` boolean NOT NULL DEFAULT false,
	`createdByOpenId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalog_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalog_items_slug_unique` UNIQUE(`slug`)
);

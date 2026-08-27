CREATE TABLE `insight_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`category` varchar(120) NOT NULL,
	`title` varchar(240) NOT NULL,
	`excerpt` text NOT NULL,
	`readTime` varchar(40) NOT NULL,
	`accent` varchar(180) NOT NULL,
	`sectionsJson` text NOT NULL,
	`status` varchar(24) NOT NULL DEFAULT 'draft',
	`socialImageUrl` varchar(512),
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insight_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `insight_articles_slug_unique` UNIQUE(`slug`)
);

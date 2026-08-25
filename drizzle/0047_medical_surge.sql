CREATE TABLE `reset_link_revocation_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`target_open_id` varchar(64) NOT NULL,
	`target_email` varchar(320) NOT NULL,
	`actor_open_id` varchar(64) NOT NULL,
	`actor_name` varchar(160),
	`revoked_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reset_link_revocation_audits_id` PRIMARY KEY(`id`)
);

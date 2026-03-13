CREATE TABLE `visibility_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessName` varchar(256) NOT NULL,
	`city` varchar(128) NOT NULL,
	`website` varchar(512),
	`email` varchar(320),
	`auditResult` json,
	`score` int,
	`leadConverted` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visibility_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `referredBy` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `referralSource` varchar(128);
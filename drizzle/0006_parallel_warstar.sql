CREATE TABLE `linkedin_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(512) NOT NULL,
	`tone` varchar(64) NOT NULL DEFAULT 'mcconaughey',
	`generatedPosts` text NOT NULL,
	`savedPost` text,
	`used` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `linkedin_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waitlist_signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(256),
	`company` varchar(256),
	`source` varchar(128) NOT NULL DEFAULT 'waitlist_page',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waitlist_signups_id` PRIMARY KEY(`id`)
);

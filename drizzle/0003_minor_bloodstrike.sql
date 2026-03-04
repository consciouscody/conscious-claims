CREATE TABLE `ebook_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(256),
	`phone` varchar(32),
	`source` varchar(128) DEFAULT 'free-guide',
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ebook_leads_id` PRIMARY KEY(`id`)
);

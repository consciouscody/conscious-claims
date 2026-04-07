CREATE TABLE `claim_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`userId` int NOT NULL,
	`senderRole` enum('admin','customer') NOT NULL DEFAULT 'admin',
	`message` text NOT NULL,
	`isRead` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `claim_messages_id` PRIMARY KEY(`id`)
);

CREATE TABLE `crm_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crmType` enum('jobnimbus','acculynx','roofr','contractors_cloud','hubspot','zapier') NOT NULL,
	`apiKey` text,
	`webhookSecret` varchar(64),
	`displayName` varchar(128),
	`status` enum('active','error','disconnected') NOT NULL DEFAULT 'active',
	`lastSyncAt` timestamp,
	`lastSyncStatus` text,
	`jobsSynced` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_integrations_id` PRIMARY KEY(`id`)
);

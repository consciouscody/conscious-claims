CREATE TABLE `adjuster_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`subject` text,
	`body` text,
	`emailType` enum('supplement_request','reinspection_request','follow_up') DEFAULT 'supplement_request',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adjuster_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`userId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` text NOT NULL,
	`filename` varchar(512),
	`label` text,
	`aiAnalysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`fromStatus` varchar(64),
	`toStatus` varchar(64) NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyAddress` text NOT NULL,
	`homeownerName` varchar(256),
	`claimNumber` varchar(128),
	`insuranceCarrier` varchar(256),
	`adjusterName` varchar(256),
	`adjusterEmail` varchar(320),
	`adjusterPhone` varchar(32),
	`dateOfLoss` timestamp,
	`originalEstimateUrl` text,
	`originalEstimateKey` text,
	`originalEstimateAmount` decimal(12,2),
	`parsedLineItems` json,
	`supplementAmount` decimal(12,2),
	`recoveredAmount` decimal(12,2),
	`feePercentage` decimal(5,2) DEFAULT '12.00',
	`feeAmount` decimal(12,2),
	`status` enum('draft','estimate_uploaded','supplement_generated','email_drafted','submitted','approved','denied','paid') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplement_line_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`xactimateCode` varchar(64) NOT NULL,
	`description` text NOT NULL,
	`unit` varchar(16) NOT NULL,
	`quantity` decimal(10,2),
	`unitPrice` decimal(10,2),
	`totalPrice` decimal(12,2),
	`justification` text,
	`codeReference` text,
	`manufacturerReference` text,
	`photoEvidence` text,
	`source` enum('auto_detected','ai_photo','manual') DEFAULT 'auto_detected',
	`isIncluded` enum('yes','no') DEFAULT 'yes',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplement_line_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `companyName` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);
CREATE TABLE `dossier_line_items` (
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
	CONSTRAINT `dossier_line_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `supplement_line_items`;--> statement-breakpoint
ALTER TABLE `jobs` MODIFY COLUMN `status` enum('draft','estimate_uploaded','dossier_generating','dossier_generated','email_drafted','submitted','approved','denied','paid') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `jobs` ADD `rcvAmount` decimal(12,2);--> statement-breakpoint
ALTER TABLE `jobs` ADD `depreciationAmount` decimal(12,2);--> statement-breakpoint
ALTER TABLE `jobs` ADD `acvAmount` decimal(12,2);--> statement-breakpoint
ALTER TABLE `jobs` ADD `typeOfLoss` varchar(128);--> statement-breakpoint
ALTER TABLE `jobs` ADD `roofArea` decimal(10,2);--> statement-breakpoint
ALTER TABLE `jobs` ADD `roofPitch` varchar(32);--> statement-breakpoint
ALTER TABLE `jobs` ADD `roofComplexity` varchar(64);--> statement-breakpoint
ALTER TABLE `jobs` ADD `dossierGeneratedAt` timestamp;--> statement-breakpoint
ALTER TABLE `jobs` ADD `dossierPdfUrl` text;
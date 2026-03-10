CREATE TABLE `affiliate_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`referralCode` varchar(32) NOT NULL,
	`ipAddress` varchar(64),
	`userAgent` text,
	`landingPage` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`referralCode` varchar(32) NOT NULL,
	`productType` enum('storm_the_door_book','supplement_pro_monthly','supplement_pro_annual') NOT NULL,
	`productName` varchar(256) NOT NULL,
	`saleAmount` decimal(12,2) NOT NULL,
	`commissionRate` decimal(5,2) NOT NULL,
	`commissionAmount` decimal(12,2) NOT NULL,
	`stripePaymentIntentId` varchar(128),
	`stripeSessionId` varchar(128),
	`buyerEmail` varchar(320),
	`payoutStatus` enum('pending','approved','paid','refunded') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(256) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32),
	`company` varchar(256),
	`referralCode` varchar(32) NOT NULL,
	`commissionRate` decimal(5,2) DEFAULT '40.00',
	`status` enum('pending','active','suspended') NOT NULL DEFAULT 'pending',
	`paypalEmail` varchar(320),
	`totalClicks` int NOT NULL DEFAULT 0,
	`totalConversions` int NOT NULL DEFAULT 0,
	`totalEarned` decimal(12,2) NOT NULL DEFAULT '0.00',
	`totalPaid` decimal(12,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_email_unique` UNIQUE(`email`),
	CONSTRAINT `affiliates_referralCode_unique` UNIQUE(`referralCode`)
);

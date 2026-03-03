ALTER TABLE `jobs` ADD `stripePaymentIntentId` varchar(128);--> statement-breakpoint
ALTER TABLE `jobs` ADD `stripeInvoiceId` varchar(128);--> statement-breakpoint
ALTER TABLE `jobs` ADD `paymentStatus` enum('unpaid','invoice_sent','paid') DEFAULT 'unpaid';--> statement-breakpoint
ALTER TABLE `jobs` ADD `paidAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(128);
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ip_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`date` integer DEFAULT 1745685162477 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_ip_requests`("id", "ip", "count", "date") SELECT "id", "ip", "count", "date" FROM `ip_requests`;--> statement-breakpoint
DROP TABLE `ip_requests`;--> statement-breakpoint
ALTER TABLE `__new_ip_requests` RENAME TO `ip_requests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
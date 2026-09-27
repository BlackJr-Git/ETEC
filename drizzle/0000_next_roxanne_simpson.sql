CREATE TABLE `demandes` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`nom` text NOT NULL,
	`telephone` text NOT NULL,
	`email` text,
	`ville` text NOT NULL,
	`site` text,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'nouveau' NOT NULL
);

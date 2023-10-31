CREATE TABLE `links` (
	`short-link` text PRIMARY KEY NOT NULL,
	`long-link` text DEFAULT '/' NOT NULL
);

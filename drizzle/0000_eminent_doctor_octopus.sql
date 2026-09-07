CREATE TABLE `consultation_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`submitted_at` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`interest` text NOT NULL,
	`care_mode` text NOT NULL,
	`location` text NOT NULL,
	`provider` text,
	`contact_preference` text NOT NULL,
	`notes` text,
	`source` text,
	`request_contact_disclosure_version` text NOT NULL,
	`marketing_consent` integer NOT NULL,
	`sms_consent_version` text,
	`sms_consent_client_timestamp` text,
	`sms_consent_server_timestamp` text,
	`sms_consent_source_url` text,
	`sms_consent_disclosure` text,
	`verification_token_hash` text NOT NULL,
	`ip_hash` text NOT NULL,
	`user_agent` text,
	`email_status` text NOT NULL,
	`email_message_id` text,
	`email_updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consultation_verification_token_unique` ON `consultation_submissions` (`verification_token_hash`);--> statement-breakpoint
CREATE INDEX `consultation_ip_submitted_idx` ON `consultation_submissions` (`ip_hash`,`submitted_at`);--> statement-breakpoint
CREATE INDEX `consultation_email_status_idx` ON `consultation_submissions` (`email_status`,`submitted_at`);
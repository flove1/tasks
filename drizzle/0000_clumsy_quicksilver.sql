CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" timestamp,
	"status" varchar(50) DEFAULT 'pending' NOT NULL
);

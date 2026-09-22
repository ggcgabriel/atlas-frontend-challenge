ALTER TABLE "professionals" ADD COLUMN "specialties" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "free_quote" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "response_time_hours" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "warranty_months" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "professions" ADD COLUMN "name_plural" varchar(140) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "rating_punctuality" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "rating_finish" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "rating_cleanliness" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "rating_value" integer DEFAULT 5 NOT NULL;
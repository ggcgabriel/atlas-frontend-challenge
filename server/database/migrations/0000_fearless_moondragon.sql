CREATE TABLE "professionals" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(140) NOT NULL,
	"name" varchar(140) NOT NULL,
	"avatar_url" text NOT NULL,
	"profession_id" integer NOT NULL,
	"hourly_rate_cents" integer NOT NULL,
	"rating" numeric(2, 1) DEFAULT '0' NOT NULL,
	"reviews_count" integer DEFAULT 0 NOT NULL,
	"city" varchar(120) NOT NULL,
	"state" varchar(2) NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"bio" text NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professionals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "professions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"category" varchar(80) NOT NULL,
	CONSTRAINT "professions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"professional_id" integer NOT NULL,
	"author_name" varchar(140) NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"professional_id" integer NOT NULL,
	"title" varchar(160) NOT NULL,
	"price_cents" integer NOT NULL,
	"duration_minutes" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_profession_id_professions_id_fk" FOREIGN KEY ("profession_id") REFERENCES "public"."professions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "professionals_profession_id_idx" ON "professionals" USING btree ("profession_id");--> statement-breakpoint
CREATE INDEX "professionals_hourly_rate_idx" ON "professionals" USING btree ("hourly_rate_cents");--> statement-breakpoint
CREATE INDEX "professionals_rating_idx" ON "professionals" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "professionals_city_idx" ON "professionals" USING btree ("city");--> statement-breakpoint
CREATE INDEX "professionals_created_at_idx" ON "professionals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reviews_professional_id_idx" ON "reviews" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "services_professional_id_idx" ON "services" USING btree ("professional_id");
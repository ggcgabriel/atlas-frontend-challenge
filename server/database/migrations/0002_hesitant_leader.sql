CREATE TABLE "portfolio_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"professional_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt" varchar(200) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"lqip" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "avatar_lqip" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "experience_years" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "service_radius_km" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "accepts_urgent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_images" ADD CONSTRAINT "portfolio_images_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolio_images_professional_id_idx" ON "portfolio_images" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "professionals_experience_idx" ON "professionals" USING btree ("experience_years");
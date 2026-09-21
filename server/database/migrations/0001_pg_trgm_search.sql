-- Hand-written: drizzle's schema DSL cannot express a pg_trgm GIN index.
--
-- The catalog search is `name ILIKE '%term%'`. A leading wildcard makes a btree
-- index useless, so without this Postgres sequential-scans `professionals` on
-- every keystroke. A trigram GIN index makes that predicate index-backed.
-- Covers `professions.name` too, since the challenge asks for search by name OR
-- profession.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "professionals_name_trgm_idx"
  ON "professionals" USING gin ("name" gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "professions_name_trgm_idx"
  ON "professions" USING gin ("name" gin_trgm_ops);

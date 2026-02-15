-- ─── PostGIS Extension & Spatial Indexing ──────────────────────
-- Run this AFTER the initial Prisma migration.
-- Adds a computed geography column and spatial index on Incident
-- to enable radius queries (ST_DWithin), nearest-unit matching,
-- and heatmap generation.
--
-- Usage:
--   psql $DATABASE_URL -f add_postgis.sql
-- ────────────────────────────────────────────────────────────────

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add computed geography column to Incident
ALTER TABLE "Incident"
  ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

-- Populate from existing lat/lng
UPDATE "Incident"
SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
WHERE geom IS NULL;

-- Auto-populate geom on INSERT/UPDATE via trigger
CREATE OR REPLACE FUNCTION update_incident_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incident_geom ON "Incident";
CREATE TRIGGER trg_incident_geom
  BEFORE INSERT OR UPDATE OF lat, lng ON "Incident"
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_geom();

-- Spatial index for fast geoqueries
CREATE INDEX IF NOT EXISTS idx_incident_geom ON "Incident" USING GIST (geom);

-- Same for Resource table
ALTER TABLE "Resource"
  ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

UPDATE "Resource"
SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
WHERE geom IS NULL;

CREATE OR REPLACE FUNCTION update_resource_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_resource_geom ON "Resource";
CREATE TRIGGER trg_resource_geom
  BEFORE INSERT OR UPDATE OF lat, lng ON "Resource"
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_geom();

CREATE INDEX IF NOT EXISTS idx_resource_geom ON "Resource" USING GIST (geom);

-- Same for Volunteer table
ALTER TABLE "Volunteer"
  ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

UPDATE "Volunteer"
SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
WHERE geom IS NULL;

CREATE OR REPLACE FUNCTION update_volunteer_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_volunteer_geom ON "Volunteer";
CREATE TRIGGER trg_volunteer_geom
  BEFORE INSERT OR UPDATE OF lat, lng ON "Volunteer"
  FOR EACH ROW
  EXECUTE FUNCTION update_volunteer_geom();

CREATE INDEX IF NOT EXISTS idx_volunteer_geom ON "Volunteer" USING GIST (geom);

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  settings    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'worker'
                  CHECK (role IN ('viewer', 'worker', 'supervisor', 'admin')),
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_org ON users(organization_id);

-- ============================================================
-- RECORDS
-- ============================================================
CREATE TABLE records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  preferred_name  TEXT,
  aliases         TEXT[] NOT NULL DEFAULT '{}',
  dob             DATE,
  approximate_age INTEGER,
  gender          TEXT,
  phone           TEXT,
  email           TEXT,
  org_record_id   TEXT,
  photo_url       TEXT,
  status          TEXT NOT NULL DEFAULT 'active',
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_team   TEXT,
  program         TEXT,
  notes           TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  search_vector   TSVECTOR,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_records_org        ON records(organization_id);
CREATE INDEX idx_records_status     ON records(status);
CREATE INDEX idx_records_assigned   ON records(assigned_user_id);
CREATE INDEX idx_records_updated    ON records(updated_at DESC);
CREATE INDEX idx_records_full_name  ON records USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_records_tsvector   ON records USING GIN (search_vector);

-- Full-text search vector update function
CREATE OR REPLACE FUNCTION update_record_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.preferred_name, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(NEW.aliases, ' ')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.program, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.org_record_id, '')), 'B');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_record_search_vector
  BEFORE INSERT OR UPDATE ON records
  FOR EACH ROW EXECUTE FUNCTION update_record_search_vector();

-- ============================================================
-- INTERACTIONS (Timeline Events)
-- ============================================================
CREATE TABLE interactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id       UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  type            TEXT NOT NULL DEFAULT 'note'
                  CHECK (type IN ('note', 'status_change', 'assignment', 'call',
                                  'referral', 'placement', 'flag', 'other')),
  content         TEXT NOT NULL,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_record ON interactions(record_id);
CREATE INDEX idx_interactions_org    ON interactions(organization_id);
CREATE INDEX idx_interactions_author ON interactions(author_id);
CREATE INDEX idx_interactions_ts     ON interactions(created_at DESC);

-- ============================================================
-- FLAGS
-- ============================================================
CREATE TABLE flags (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id       UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  type            TEXT NOT NULL DEFAULT 'custom'
                  CHECK (type IN ('high_risk', 'medical', 'escalated', 'priority', 'custom')),
  label           TEXT NOT NULL,
  description     TEXT,
  resolved        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flags_record   ON flags(record_id);
CREATE INDEX idx_flags_org      ON flags(organization_id);
CREATE INDEX idx_flags_resolved ON flags(resolved) WHERE NOT resolved;

-- ============================================================
-- CUSTOM FIELDS
-- ============================================================
CREATE TABLE custom_fields (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  label           TEXT NOT NULL,
  field_type      TEXT NOT NULL DEFAULT 'text'
                  CHECK (field_type IN ('text', 'number', 'boolean', 'select', 'date')),
  options         TEXT[],
  required        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, name)
);

CREATE INDEX idx_custom_fields_org ON custom_fields(organization_id);

-- ============================================================
-- CUSTOM FIELD VALUES
-- ============================================================
CREATE TABLE custom_field_values (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id       UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value           JSONB,
  UNIQUE (record_id, custom_field_id)
);

CREATE INDEX idx_cfv_record ON custom_field_values(record_id);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  user_id         UUID NOT NULL,
  table_name      TEXT NOT NULL,
  record_id       UUID,
  action          TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data        JSONB,
  new_data        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_org    ON audit_log(organization_id);
CREATE INDEX idx_audit_record ON audit_log(record_id);
CREATE INDEX idx_audit_ts     ON audit_log(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE records             ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags               ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields       ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's org
CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Users policy: can see only their org
CREATE POLICY "users_org_isolation"
  ON users FOR ALL
  USING (organization_id = current_user_org_id());

-- Records: org isolation
CREATE POLICY "records_org_select"
  ON records FOR SELECT
  USING (organization_id = current_user_org_id());

CREATE POLICY "records_org_insert"
  ON records FOR INSERT
  WITH CHECK (organization_id = current_user_org_id()
    AND current_user_role() IN ('worker', 'supervisor', 'admin'));

CREATE POLICY "records_org_update"
  ON records FOR UPDATE
  USING (organization_id = current_user_org_id()
    AND current_user_role() IN ('worker', 'supervisor', 'admin'));

CREATE POLICY "records_org_delete"
  ON records FOR DELETE
  USING (organization_id = current_user_org_id()
    AND current_user_role() IN ('supervisor', 'admin'));

-- Interactions: org isolation
CREATE POLICY "interactions_org_select"
  ON interactions FOR SELECT
  USING (organization_id = current_user_org_id());

CREATE POLICY "interactions_org_insert"
  ON interactions FOR INSERT
  WITH CHECK (organization_id = current_user_org_id()
    AND current_user_role() IN ('worker', 'supervisor', 'admin'));

-- Flags: org isolation
CREATE POLICY "flags_org_select"
  ON flags FOR SELECT
  USING (organization_id = current_user_org_id());

CREATE POLICY "flags_org_write"
  ON flags FOR INSERT
  WITH CHECK (organization_id = current_user_org_id()
    AND current_user_role() IN ('supervisor', 'admin'));

-- Custom fields: org isolation
CREATE POLICY "custom_fields_org"
  ON custom_fields FOR ALL
  USING (organization_id = current_user_org_id());

CREATE POLICY "custom_field_values_org"
  ON custom_field_values FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM records r
      WHERE r.id = custom_field_values.record_id
        AND r.organization_id = current_user_org_id()
    )
  );

-- ============================================================
-- FUZZY SEARCH FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION search_records(
  p_org_id UUID,
  p_query  TEXT,
  p_limit  INTEGER DEFAULT 20
)
RETURNS TABLE (
  id          UUID,
  full_name   TEXT,
  status      TEXT,
  rank        FLOAT4
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.full_name,
    r.status,
    ts_rank(r.search_vector, plainto_tsquery('english', p_query)) +
    similarity(r.full_name, p_query) * 0.5 AS rank
  FROM records r
  WHERE r.organization_id = p_org_id
    AND (
      r.search_vector @@ plainto_tsquery('english', p_query)
      OR similarity(r.full_name, p_query) > 0.2
      OR r.full_name ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

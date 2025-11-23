-- Create app schema for application tables
CREATE SCHEMA IF NOT EXISTS app;

-- Grant permissions
GRANT USAGE ON SCHEMA app TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA app TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO anon, authenticated;



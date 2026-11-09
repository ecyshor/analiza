/* Harden the database roles (PostgreSQL 18).
 *
 * 1. Role memberships of the postgrest authenticator are made non-inheriting.
 *    ALTER ROLE ... NOINHERIT alone does not change memberships that were
 *    granted before PG16, so the memberships are revoked and re-granted
 *    explicitly WITH INHERIT FALSE (SET TRUE keeps SET ROLE working, which
 *    PostgREST relies on to switch to anon/analiza per request).
 * 2. postgrest only needs CONNECT on the eye_admin database.
 * 3. metabase_ro gets read-only access to api.domains only (RLS policy included).
 */

REVOKE analiza FROM postgrest;
REVOKE anon FROM postgrest;
GRANT analiza TO postgrest WITH INHERIT FALSE, SET TRUE;
GRANT anon TO postgrest WITH INHERIT FALSE, SET TRUE;

REVOKE ALL ON DATABASE eye_admin FROM postgrest;
GRANT CONNECT ON DATABASE eye_admin TO postgrest;

/* Read-only role for Metabase. An infra migration may have created it
   already, so create it only when missing. */
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'metabase_ro') THEN
        CREATE ROLE metabase_ro NOLOGIN;
    END IF;
END
$$;

GRANT USAGE ON SCHEMA api TO metabase_ro;
GRANT SELECT ON api.domains TO metabase_ro;

/* api.domains has RLS enabled (V1); without a policy for metabase_ro it
   would see no rows. Guarded so the migration stays idempotent. */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'api'
          AND tablename = 'domains'
          AND policyname = 'domains_metabase_ro_read'
    ) THEN
        CREATE POLICY domains_metabase_ro_read ON api.domains
            FOR SELECT
            TO metabase_ro
            USING (true);
    END IF;
END
$$;

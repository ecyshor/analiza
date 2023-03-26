/*Role used for all authenticated users*/
/*User id can be accessed through current_setting('request.jwt.claims', true)::json->>'https://analiza.dev/user'*/
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA IF NOT EXISTS api;
CREATE ROLE analiza NOLOGIN;
GRANT analiza TO postgrest;
GRANT USAGE ON SCHEMA api TO analiza;

CREATE TABLE api.domains
(
    id        UUID primary key      DEFAULT uuid_generate_v4(),
    tenant_id uuid         NOT NUll,
    domain    varchar(300) NOT NULL,
    created   TIMESTAMP    NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE, UPDATE
    ON api.domains TO analiza;

ALTER TABLE api.domains
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY domains_tenant_policy ON api.domains
    TO analiza
    USING (tenant_id = uuid(current_setting('request.jwt.claims', true)::json ->> 'https://analiza.dev/user'));

CREATE OR REPLACE FUNCTION api.upsert_domain() RETURNS TRIGGER AS
$$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.domain IS NOT NULL) THEN
        NEW.tenant_id = current_setting('request.jwt.claims', true)::json ->> 'https://analiza.dev/user';
        NEW.created = now();
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE' AND NEW.domain IS NOT NULL) THEN
        OLD.domain = NEW.domain;
        return OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER before_insert_api_domains
    BEFORE INSERT
    ON api.domains
    FOR EACH ROW
EXECUTE FUNCTION api.upsert_domain();

CREATE TRIGGER before_update_api_domains
    BEFORE UPDATE
    ON api.domains
    FOR EACH ROW
EXECUTE FUNCTION api.upsert_domain();

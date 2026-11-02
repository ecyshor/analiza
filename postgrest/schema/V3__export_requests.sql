/*Export requests: a signed-in user asks for their analytics data to be exported and emailed.
  The request is only stored here; a separate notifier process will later poll unnotified
  rows (see idx_export_requests_pending) and set notified_at once the operator is notified.*/
CREATE TABLE api.export_requests
(
    id          UUID primary key      DEFAULT uuid_generate_v4(),
    tenant_id   uuid         NOT NULL,
    email       varchar(320) NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    created     TIMESTAMP    NOT NULL DEFAULT now(),
    notified_at TIMESTAMP    NULL
);

GRANT SELECT, INSERT
    ON api.export_requests TO analiza;

ALTER TABLE api.export_requests
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY export_requests_tenant_policy ON api.export_requests
    TO analiza
    USING (tenant_id = uuid(current_setting('request.jwt.claims', true)::json ->> 'https://analiza.dev/user'))
    WITH CHECK (tenant_id = uuid(current_setting('request.jwt.claims', true)::json ->> 'https://analiza.dev/user'));

CREATE OR REPLACE FUNCTION api.before_insert_export_request() RETURNS TRIGGER AS
$$
BEGIN
    NEW.tenant_id = current_setting('request.jwt.claims', true)::json ->> 'https://analiza.dev/user';
    NEW.created = now();
    NEW.notified_at = NULL;
    NEW.email = lower(btrim(NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_api_export_requests
    BEFORE INSERT
    ON api.export_requests
    FOR EACH ROW
EXECUTE FUNCTION api.before_insert_export_request();

/*Lets the future notifier find unnotified requests without a full table scan.*/
CREATE INDEX idx_export_requests_pending
    ON api.export_requests (created)
    WHERE notified_at IS NULL;

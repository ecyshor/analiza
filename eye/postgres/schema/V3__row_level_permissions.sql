CREATE POLICY eye_read ON api.domains
    FOR SELECT
    TO eye
    USING (true);

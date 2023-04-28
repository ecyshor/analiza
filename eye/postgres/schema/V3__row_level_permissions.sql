CREATE POLICY eye_read ON api.domains
    TO eye
    FOR SELECT
    USING (true);

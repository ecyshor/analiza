CREATE USER metabase WITH PASSWORD 'metabase_super_password';
CREATE DATABASE metabase;
GRANT ALL PRIVILEGES ON DATABASE metabase TO metabase;

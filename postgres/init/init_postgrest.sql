CREATE USER postgrest WITH PASSWORD 'super_secret_password';
CREATE DATABASE eye_admin;
GRANT ALL PRIVILEGES ON DATABASE eye_admin TO postgrest;


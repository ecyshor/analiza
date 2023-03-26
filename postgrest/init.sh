#!/bin/bash

set -ex pipefail

export PGPASSWORD="super_secret_password"
psql -d eye_admin -h localhost -U postgres -a -f schema.sql
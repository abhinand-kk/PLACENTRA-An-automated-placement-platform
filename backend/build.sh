#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install production dependencies
pip install -r requirements.txt

# Collect static assets for WhiteNoise
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate --no-input

# Seed verified institutions (idempotent, safe to rerun)
python manage.py seed_verified_institutions


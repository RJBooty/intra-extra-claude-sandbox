#!/bin/bash
# Supabase Database Connection String
# DO NOT COMMIT THIS FILE TO GIT - ADD TO .gitignore

# Your Supabase Database URL
# Replace [YOUR-PASSWORD] with your actual database password
export SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.wyixydnywhpiewgsfimc.supabase.co:5432/postgres"

# Usage:
# source .supabase-db-url.sh
# supabase db push --db-url "$SUPABASE_DB_URL"

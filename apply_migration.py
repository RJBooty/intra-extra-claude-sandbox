#!/usr/bin/env python3
"""
Apply database migration to add equipment_name column
Run this script to update your Supabase database
"""

import os
import sys

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase package not installed")
    print("Run: pip install supabase")
    sys.exit(1)

# Supabase credentials from your config
SUPABASE_URL = "https://wyixydnywhpiewgsfimc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXh5ZG55d2hwaWV3Z3NmaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTU5OTIsImV4cCI6MjA3MjU3MTk5Mn0.aIdEtvdALRzYEOJH6jgfVli0wtliDVTZSkTIDW8Su-I"

def main():
    print("Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # SQL to add the column
    sql = """
    ALTER TABLE project_equipment_planning
    ADD COLUMN IF NOT EXISTS equipment_name TEXT;
    """

    print("Applying migration: Adding equipment_name column...")

    try:
        # Execute the SQL
        result = supabase.rpc('exec_sql', {'query': sql}).execute()
        print("✅ Migration applied successfully!")
        print("\nColumn 'equipment_name' has been added to 'project_equipment_planning' table")

    except Exception as e:
        print(f"❌ Error applying migration: {e}")
        print("\nPlease run this SQL manually in Supabase SQL Editor:")
        print("-" * 60)
        print(sql)
        print("-" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()

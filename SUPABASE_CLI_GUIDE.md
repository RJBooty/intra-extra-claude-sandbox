# Supabase CLI Guide for IntraExtra

## ✅ Setup Complete
- Supabase CLI installed (v2.48.3)
- Migration file created: `supabase/migrations/008_add_roi_config_columns.sql`
- Configuration file ready: `.supabase-db-url.sh` (don't commit this!)

## 🔑 Getting Your Database Password

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project (wyixydnywhpiewgsfimc)
3. Go to **Settings** → **Database**
4. Find the **Connection String** section
5. Click **URI** and copy the connection string
6. The password is in the format: `postgresql://postgres:[PASSWORD]@db.wyixydnywhpiewgsfimc.supabase.co:5432/postgres`

## 🚀 Running Migrations

### Method 1: Using the Helper Script (Recommended)

1. Edit `.supabase-db-url.sh` and replace `[YOUR-PASSWORD]` with your actual database password
2. Run migrations:
```bash
# Load the database URL
source .supabase-db-url.sh

# Push all pending migrations to remote database
supabase db push --db-url "$SUPABASE_DB_URL"
```

### Method 2: Direct Command

```bash
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.wyixydnywhpiewgsfimc.supabase.co:5432/postgres"
```

## 📝 Common CLI Commands

### Create a New Migration
```bash
# Creates a new migration file with timestamp
supabase migration new add_new_feature
```

### Check Migration Status
```bash
# See which migrations have been applied
supabase migration list --db-url "$SUPABASE_DB_URL"
```

### Generate Migration from Remote Changes
```bash
# If you made changes in the dashboard, capture them as a migration
supabase db diff --db-url "$SUPABASE_DB_URL" -f new_migration_name
```

### Reset Local Database (if running locally)
```bash
# Warning: This will destroy all local data!
supabase db reset
```

### Pull Remote Schema
```bash
# Download the current remote schema
supabase db pull --db-url "$SUPABASE_DB_URL"
```

### Run a Specific SQL File
```bash
# Execute a SQL file against the database
psql "$SUPABASE_DB_URL" -f supabase/migrations/008_add_roi_config_columns.sql
```

## 🔍 Verifying Migrations

After running a migration, verify it worked:

```bash
# Using psql
psql "$SUPABASE_DB_URL" -c "\d project_roi_calculations"

# Or in Supabase Dashboard SQL Editor:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'project_roi_calculations'
  AND column_name IN ('revenue_config', 'cost_config');
```

## 📁 Project Structure

```
supabase/
├── migrations/           # All migration files (tracked in git)
│   ├── 007_add_roi_rls_policies.sql
│   └── 008_add_roi_config_columns.sql  # ✅ Your new migration
├── config.toml          # Supabase configuration
└── schema.sql           # Full schema snapshot

.supabase-db-url.sh      # ⚠️ NOT tracked in git (contains password)
```

## 🎯 Workflow for Future Migrations

1. **Create Migration File**:
   ```bash
   supabase migration new descriptive_name
   ```

2. **Write Your SQL**:
   Edit the newly created file in `supabase/migrations/`

3. **Test Locally** (optional):
   ```bash
   supabase db reset  # Applies all migrations to local DB
   ```

4. **Push to Remote**:
   ```bash
   source .supabase-db-url.sh
   supabase db push --db-url "$SUPABASE_DB_URL"
   ```

5. **Commit to Git**:
   ```bash
   git add supabase/migrations/
   git commit -m "Add migration: descriptive_name"
   ```

## ⚠️ Important Notes

- **Never commit** `.supabase-db-url.sh` to git (it contains your password)
- Always test migrations on a staging environment first
- Migrations are irreversible - write carefully!
- Keep migration files small and focused
- Name migrations descriptively (e.g., `add_user_roles`, `fix_permissions_table`)

## 🐛 Troubleshooting

### "No such container" error
This is normal when not running local Supabase. Always use `--db-url` flag for remote operations.

### "Permission denied"
Make sure your database user has the necessary privileges. Check your Supabase dashboard settings.

### "Migration already applied"
The CLI tracks which migrations have run. This is normal if you manually ran it in the dashboard.

### "Connection refused"
Check your database password and ensure your IP is allowed in Supabase dashboard settings.

## 🔗 Useful Links

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Migration Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Your Supabase Dashboard](https://app.supabase.com/project/wyixydnywhpiewgsfimc)

## ✨ Pro Tips

1. **Use descriptive migration names**: `add_roi_config_columns` is better than `migration_001`
2. **One purpose per migration**: Don't mix unrelated changes
3. **Add rollback comments**: Include SQL comments showing how to undo changes
4. **Test with data**: Always test migrations with realistic data
5. **Backup before big migrations**: Use Supabase dashboard to create a backup

## 🎉 You're All Set!

Your RevenueBuilder and CostBuilder components will now automatically save data to your database. Happy coding! 🚀

# EventRadius Consolidated Database Migrations

This directory contains the **consolidated** database migration files, split into logical parts for better organization and maintainability.

## Structure

| File | Description | Lines | Purpose |
|------|-------------|-------|---------|
| `00_run_all.sql` | Master runner | ~50 | Executes all parts in order |
| `01_schema.sql` | Schema (Types & Tables) | ~527 | ENUMs, DROP VIEWs, CREATE TABLEs |
| `02_functions.sql` | Functions & Procedures | ~644 | All functions and stored procedures |
| `03_indexes_rls_views.sql` | Triggers, RLS, Indexes, Views | ~2,096 | Everything else |

## Run Order

**Option 1: Use the master runner (recommended)**
```sql
\ir 00_run_all.sql
```

**Option 2: Run each file individually**
```sql
-- 1. Create schema first
\ir 01_schema.sql

-- 2. Then create functions
\ir 02_functions.sql

-- 3. Finally add triggers, RLS, indexes, views
\ir 03_indexes_rls_views.sql
```

## What Was Merged

These files consolidate the following original migrations:
- `01_eventradius_complete_setup.sql` (base schema)
- `02_add_quick_create_fields.sql`
- `07_add_approval_fields.sql`
- `08_add_cancellation_request.sql`
- `09_add_event_geolocation.sql`
- `add_event_contact_phone.sql`
- `add_event_wizard_fields.sql`

## Key Features

### 01_schema.sql
- **ENUM types**: `app_role`, `event_type`, `event_format`, `event_privacy`, `refund_policy`, `currency_type`
- **All tables** with consolidated columns (no ALTER TABLE for new columns):
  - `profiles`, `user_roles`, `venues`, `events`, `user_preferences`
  - `event_participants` (with approval & cancellation columns)
  - `event_categories`, `event_registrations`, `event_audit`
  - `event_venues`, `ticket_types`, `registration_fields`
  - `event_media`, `event_notifications`, `event_tags`, `event_schedule`

### 02_functions.sql
- **Utility functions**: `update_updated_at_column()`, `has_role()`, `handle_new_user()`
- **Event functions**: `update_participant_count()`, `update_event_status()`, `validate_event_data()`, `log_event_changes()`
- **Geolocation functions**: `calculate_distance_km()`, `events_within_radius()`, `events_within_radius_fast()`, `get_nearby_events_with_details()`
- **Approval workflow**: `submit_approval_request()`
- **Cancellation**: `process_cancellation_action()`, `cancel_approved_participation()`
- **API functions**: `search_events()`, `get_user_events()`, etc.

### 03_indexes_rls_views.sql
- **Triggers**: timestamp updates, participant count, audit logging
- **RLS policies**: Security policies for all tables
- **Indexes**: Performance indexes including geolocation and approval indexes
- **Views**: `events_with_participants`, `events_enhanced_view`, `ticket_sales_view`, `event_geolocation_stats`
- **Comments**: Column documentation
- **Verification queries**: Check setup completion

## Benefits of This Structure

1. **Separation of concerns**: Schema, logic, and access control are separated
2. **Easier maintenance**: Find and modify specific parts quickly
3. **Better code review**: Review schema changes separately from functions
4. **Flexible deployment**: Can run just the functions file if only logic changes
5. **No ALTER TABLE**: All columns are in CREATE TABLE statements

## Safety

All files are idempotent:
- Uses `IF NOT EXISTS` for tables
- Uses `CREATE OR REPLACE` for functions
- Uses `DROP IF EXISTS` + `CREATE` for triggers
- Uses `DROP POLICY IF EXISTS` + `CREATE POLICY` for RLS

## Important Notes

- **Order matters**: Always run in sequence (01 → 02 → 03)
- **Clean migration**: If you have an existing database, run `clear/drop_all_tables.sql` first
- **Supabase**: These files are designed to run in the Supabase SQL Editor

## Original Files

The original single-file consolidated migration remains at:
- `../combined_eventradius_setup.sql`

Use that if you prefer a single-file approach, or use these split files for better organization.

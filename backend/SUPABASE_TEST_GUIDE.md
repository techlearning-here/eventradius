# Supabase Test Script Usage Guide

## Overview
The `test_supabase.py` script tests the connection to your Supabase backend and verifies table access permissions.

## Prerequisites
1. Virtual environment activated: `source venv/bin/activate`
2. `.env` file configured with `SUPABASE_URL` and `SUPABASE_KEY`
3. Dependencies installed: `pip install -r requirements.txt`

## Running the Test
```bash
source venv/bin/activate && python test_supabase.py
```

## What the Test Does

### 1. Connection Test
- Verifies Supabase client initialization
- Tests basic connectivity to your Supabase project

### 2. Schema Test
- Reads the events table structure
- Shows current event count
- Displays sample event data if available

### 3. CRUD Operations Test
- **READ**: Tests reading events (should work without authentication)
- **CREATE**: Tests creating events (blocked without authentication - expected)
- **UPDATE**: Tests updating events (blocked without authentication - expected)
- **DELETE**: Tests deleting events (blocked without authentication - expected)

## Expected Results

### ✅ PASS - All Tests Working
```
🎉 ALL TESTS PASSED! Supabase is working correctly.
🔐 Write operations are correctly protected by authentication.
```

### 🔐 Authentication Behavior
- **READ operations**: Should work for public/approved events
- **WRITE operations**: Blocked without authentication (correct behavior)
- Write operations require authentication via `auth.uid()` in RLS policies

## Table Schema (Current)
Based on migrations, the events table includes:
- `id` (UUID, Primary Key)
- `title`, `creator`, `description`, `date`, `time`, `address`
- `background_image_url`, `target_date`
- `created_by` (UUID, references auth.users, NOT NULL)
- `category`, `kid_friendly`, `price`, `tags`, `status`
- `event_type`, `event_status`, `is_public`, `admin_remark`
- `latitude`, `longitude`, `city`

## Troubleshooting

### ❌ Connection Failed
- Check `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Verify network connectivity
- Check Supabase project status

### ❌ Read Operation Failed
- Check RLS policies for SELECT operations
- Verify table exists in your Supabase project

### ❌ Unexpected CREATE/UPDATE/DELETE Success
- RLS policies might be too permissive
- Check authentication requirements

## Testing with Authentication
To test write operations, you'll need to:
1. Implement authentication in your test script
2. Use Supabase Auth to sign in a user
3. Pass the auth token to the client

The current test correctly validates that unauthenticated write operations are blocked, which is the expected secure behavior.

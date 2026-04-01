"""
Pytest configuration file for backend tests.
Adds the parent directory to sys.path so imports work correctly.
"""

import os
import sys
from pathlib import Path


# CI and minimal environments often have no .env; integration/unit tests patch DB
# calls but some paths still call SupabaseClient.get_client(). Placeholders avoid
# ValueError. Tests that assert missing-env behavior use patch.dict to isolate env.
def _ensure_placeholder_supabase_env() -> None:
    if not (os.environ.get("SUPABASE_URL") or "").strip():
        os.environ["SUPABASE_URL"] = "http://127.0.0.1:54321"
    if not (os.environ.get("SUPABASE_KEY") or "").strip():
        os.environ["SUPABASE_KEY"] = "test-anon-key"


_ensure_placeholder_supabase_env()

# Add the backend directory to sys.path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

"""
Supabase database connection and utilities.
"""

from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import Optional, Dict, Any
import logging

load_dotenv()

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Singleton Supabase client"""

    _instance: Optional[Client] = None

    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client instance"""
        if cls._instance is None:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")

            if not supabase_url or not supabase_key:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_KEY must be set in environment variables"
                )

            cls._instance = create_client(supabase_url, supabase_key)
            logger.info("Supabase client initialized")

        return cls._instance

    @classmethod
    def test_connection(cls) -> bool:
        """Test connection to Supabase"""
        try:
            client = cls.get_client()
            # Simple query to test connection
            response = client.table("events").select("*").limit(1).execute()
            logger.info("Supabase connection test successful")
            return True
        except Exception as e:
            logger.error(f"Supabase connection test failed: {e}")
            return False


# Helper functions for common operations
def get_table(table_name: str):
    """Get a Supabase table reference"""
    client = SupabaseClient.get_client()
    return client.table(table_name)


def insert_record(table_name: str, data: Dict[str, Any]):
    """Insert a record into a table"""
    table = get_table(table_name)
    return table.insert(data).execute()


def update_record(table_name: str, record_id: str, data: Dict[str, Any]):
    """Update a record in a table"""
    table = get_table(table_name)
    return table.update(data).eq("id", record_id).execute()


def delete_record(table_name: str, record_id: str):
    """Delete a record from a table"""
    table = get_table(table_name)
    return table.delete().eq("id", record_id).execute()


def fetch_records(
    table_name: str,
    filters: Optional[Dict[str, Any]] = None,
    limit: int = 100,
    offset: int = 0,
):
    """Fetch records from a table with optional filters"""
    table = get_table(table_name)
    query = table.select("*")

    if filters:
        for key, value in filters.items():
            query = query.eq(key, value)

    return query.range(offset, offset + limit - 1).execute()


def fetch_single_record(table_name: str, record_id: str):
    """Fetch a single record by ID"""
    table = get_table(table_name)
    return table.select("*").eq("id", record_id).single().execute()

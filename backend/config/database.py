"""
Supabase database connection and utilities.
"""

import logging
import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from supabase import Client, create_client

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
            # Use service role key for backend operations
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv(
                "SUPABASE_KEY"
            )

            if not supabase_url or not supabase_key:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set "
                    "in environment variables"
                )

            cls._instance = create_client(supabase_url, supabase_key)
            logger.info("Supabase client initialized with service role key")

        return cls._instance

    @classmethod
    def test_connection(cls) -> bool:
        """Test connection to Supabase"""
        try:
            client = cls.get_client()
            # Simple query to test connection
            client.table("events").select("*").limit(1).execute()
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
    logger.info(f"Inserting record into {table_name}: {data}")
    table = get_table(table_name)
    result = table.insert(data).execute()
    logger.info(f"Insert result for {table_name}: {result}")
    return result


def update_record(table_name: str, record_id: str, data: Dict[str, Any]):
    """Update a record in a table"""
    logger.info(f"Updating record {record_id} in {table_name}: {data}")
    table = get_table(table_name)
    result = table.update(data).eq("id", record_id).execute()
    logger.info(f"Update result for {table_name}: {result}")
    return result


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
    logger.info(f"Fetching single record {record_id} from {table_name}")
    table = get_table(table_name)
    try:
        result = table.select("*").eq("id", record_id).single().execute()
        logger.info(f"Fetch result for {table_name}: {result}")
        return result
    except Exception as e:
        # If no records found, return a result with empty data
        if "PGRST116" in str(e) or "The result contains 0 rows" in str(e):
            logger.info(f"No record found for {record_id} in {table_name}")
            return type("Result", (), {"data": None})()
        else:
            logger.error(f"Error fetching single record from {table_name}: {e}")
            raise


def call_rpc(function_name: str, params: Dict[str, Any]):
    """Call a Supabase RPC (stored procedure)"""
    logger.info(f"Calling RPC {function_name} with params: {params}")
    client = SupabaseClient.get_client()
    try:
        result = client.rpc(function_name, params).execute()
        logger.info(f"RPC {function_name} result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error calling RPC {function_name}: {e}")
        raise

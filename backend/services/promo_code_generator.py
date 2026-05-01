"""
Promo Code Generator Service.

Generates memorable, unique promo codes for dynamic pricing discounts.
"""

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)


def sanitize_prefix(text: str, max_length: int = 4) -> str:
    """
    Sanitize event name to create a clean prefix.
    
    - Removes special characters
    - Converts to uppercase
    - Takes first N alphanumeric characters
    
    Args:
        text: Event name or title
        max_length: Maximum length of prefix (default 4)
        
    Returns:
        Clean uppercase prefix
    """
    if not text:
        return "EVENT"
    
    # Remove special characters, keep only alphanumeric
    cleaned = re.sub(r'[^a-zA-Z0-9]', '', text)
    
    # Convert to uppercase and truncate
    prefix = cleaned.upper()[:max_length]
    
    # Ensure we have at least some characters
    if len(prefix) < 2:
        prefix = (prefix + "EVENT")[:max_length]
    
    return prefix


def generate_promo_code(event_title: str, discount_percent: int, suffix: str = "ER") -> str:
    """
    Generate a promo code from event name and discount.
    
    Format: {PREFIX}{DISCOUNT}-{SUFFIX}
    Example: "Yoga Class" + 30% → "YOGA30-ER"
    
    Args:
        event_title: Event title/name
        discount_percent: Discount percentage (1-100)
        suffix: Suffix to append (default "ER" for EventRadius)
        
    Returns:
        Generated promo code
    """
    prefix = sanitize_prefix(event_title, max_length=4)
    
    # Ensure discount is valid
    discount = max(1, min(100, discount_percent))
    
    code = f"{prefix}{discount}-{suffix}"
    
    logger.debug(f"Generated promo code: {code} from '{event_title}' {discount}%")
    
    return code


def generate_unique_promo_code(
    event_title: str,
    discount_percent: int,
    existing_codes: Optional[set] = None,
    suffix: str = "ER",
    max_attempts: int = 100,
) -> str:
    """
    Generate a unique promo code, avoiding collisions.
    
    If collision detected, appends a counter to make it unique.
    
    Args:
        event_title: Event title/name
        discount_percent: Discount percentage
        existing_codes: Set of existing codes to avoid
        suffix: Suffix to append
        max_attempts: Maximum attempts to find unique code
        
    Returns:
        Unique promo code
    """
    if existing_codes is None:
        existing_codes = set()
    
    base_code = generate_promo_code(event_title, discount_percent, suffix)
    
    if base_code not in existing_codes:
        return base_code
    
    # Collision detected, try variations
    prefix = sanitize_prefix(event_title, max_length=4)
    discount = max(1, min(100, discount_percent))
    
    for attempt in range(1, max_attempts + 1):
        # Try adding a letter suffix (A, B, C...)
        if attempt <= 26:
            letter = chr(64 + attempt)  # A=65, B=66, etc.
            code = f"{prefix}{discount}{letter}-{suffix}"
        else:
            # Try with number suffix
            code = f"{prefix}{discount}{attempt}-{suffix}"
        
        if code not in existing_codes:
            logger.info(f"Generated unique code after {attempt} attempts: {code}")
            return code
    
    # Fallback: use timestamp
    import time
    code = f"{prefix}{discount}{int(time.time()) % 1000}-{suffix}"
    logger.warning(f"Used fallback code generation: {code}")
    
    return code


def parse_promo_code(code: str) -> dict:
    """
    Parse a promo code to extract components.
    
    Args:
        code: Promo code string
        
    Returns:
        Dictionary with prefix, discount, suffix
    """
    # Expected format: PREFIX##-SUFFIX
    pattern = r'^([A-Z]+)(\d+)-([A-Z]+)$'
    match = re.match(pattern, code.upper())
    
    if match:
        return {
            'prefix': match.group(1),
            'discount': int(match.group(2)),
            'suffix': match.group(3),
            'valid': True,
        }
    
    return {'valid': False, 'code': code}


def is_valid_promo_code_format(code: str) -> bool:
    """
    Check if a string matches the promo code format.
    
    Args:
        code: String to validate
        
    Returns:
        True if valid format
    """
    if not code or len(code) < 5 or len(code) > 20:
        return False
    
    pattern = r'^[A-Z0-9]+-[A-Z]+$'
    return bool(re.match(pattern, code.upper()))

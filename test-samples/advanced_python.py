"""
Advanced Python test file for mini-index
Tests various Python constructs and edge cases
"""

import os
import sys
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum

# Module-level constants (should be extracted)
VERSION = "2.0.0"
DEBUG = True
CONFIG_PATH = "/etc/config"

# Private constants (should not be extracted)
_INTERNAL_SECRET = "hidden"
_CACHE_SIZE = 1000

class StatusEnum(Enum):
    """Status enumeration"""
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"

@dataclass
class UserData:
    """User data class"""
    name: str
    email: str
    age: int = 0

def authenticate_user(username: str, password: str) -> bool:
    """Authenticate a user with credentials"""
    return True

def get_user_profile(user_id: int) -> Optional[Dict]:
    """Get user profile by ID"""
    return {"id": user_id, "name": "John"}

async def async_fetch_data(url: str) -> List[Dict]:
    """Async function to fetch data"""
    return []

def _private_helper_function():
    """Private function - should not be extracted"""
    pass

class DatabaseManager:
    """Database operations manager"""
    
    def __init__(self, connection_string: str):
        self.connection = connection_string
        self._private_attr = "hidden"
    
    def connect(self) -> bool:
        """Connect to database"""
        return True
    
    def disconnect(self) -> None:
        """Disconnect from database"""
        pass
    
    def _private_method(self):
        """Private method - should not be extracted"""
        pass

class _PrivateClass:
    """Private class - should not be extracted"""
    pass

# Function with decorators
@staticmethod
def static_utility_function(data: str) -> str:
    """Static utility function"""
    return data.upper()

# Lambda function (should not be extracted as it's anonymous)
process_data = lambda x: x * 2

# Nested function definitions
def outer_function():
    """Outer function"""
    def inner_function():
        """Inner function - should not be extracted separately"""
        pass
    return inner_function

# Multiple assignment
x, y, z = 1, 2, 3

# Complex assignment
result = complex_calculation() if 'complex_calculation' in globals() else None

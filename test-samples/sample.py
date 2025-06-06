# Sample Python module for testing
import os
import sys
from datetime import datetime

# Module-level constants
API_VERSION = "1.0.0"
DEBUG_MODE = True
_PRIVATE_CONSTANT = "should not be extracted"

def get_user_data(user_id):
    """Fetch user data from database"""
    return {"id": user_id, "name": "test"}

def process_payment(amount, currency="USD"):
    """Process a payment transaction"""
    return {"status": "success", "amount": amount}

class UserManager:
    """Manages user operations"""
    
    def __init__(self):
        self.users = {}
    
    def create_user(self, name, email):
        """Create a new user"""
        return {"name": name, "email": email}
    
    def delete_user(self, user_id):
        """Delete a user"""
        pass

class PaymentProcessor:
    """Handles payment processing"""
    
    def process(self, payment_data):
        return True

def _private_function():
    """This should not be extracted"""
    pass

#nadheem
# import os
# from supabase import create_client, Client
# from typing import Optional, Dict, Any, List
# import logging

# logger = logging.getLogger(__name__)

# class SupabaseClient:
#     def __init__(self):
#         url = os.getenv("SUPABASE_URL")
#         key = os.getenv("SUPABASE_ANON_KEY")
        
#         if not url or not key:
#             raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables.")
        
#         self.supabase: Client = create_client(url, key)
#         logger.info("Supabase client initialized.")
    
#     async def get_customer_by_account_number(self, account_number: str) -> Optional[Dict[str, Any]]:
#         """Get customer details by account number."""
#         try:
#             logger.debug(f"Querying customers table for account_number: '{account_number}'")
#             response = self.supabase.table("customers").select("*").eq("account_number", account_number).execute()
#             logger.debug(f"Supabase response data: {response.data}")
            
#             if response.data:
#                 logger.debug(f"Found customer for account_number: {account_number}")
#                 return response.data[0]
#             logger.debug(f"No customer found for account_number: {account_number}")
#             return None
#         except Exception as e:
#             logger.error(f"Error fetching customer with account_number {account_number}: {e}", exc_info=True)
#             return None
    
#     async def get_booking_by_confirmation(self, confirmation_number: str) -> Optional[Dict[str, Any]]:
#         """Get booking details with customer and flight info."""
#         try:
#             response = self.supabase.table("bookings").select("""
#                 *,
#                 customers:customer_id(*),
#                 flights:flight_id(*)
#             """).eq("confirmation_number", confirmation_number).execute()
            
#             if response.data:
#                 logger.debug(f"Found booking for confirmation_number: {confirmation_number}")
#                 return response.data[0]
#             logger.debug(f"No booking found for confirmation_number: {confirmation_number}")
#             return None
#         except Exception as e:
#             logger.error(f"Error fetching booking with confirmation_number {confirmation_number}: {e}", exc_info=True)
#             return None
    
#     async def get_flight_status(self, flight_number: str) -> Optional[Dict[str, Any]]:
#         """Get flight status information."""
#         try:
#             response = self.supabase.table("flights").select("*").eq("flight_number", flight_number).execute()
#             if response.data:
#                 logger.debug(f"Found flight status for flight_number: {flight_number}")
#                 return response.data[0]
#             logger.debug(f"No flight status found for flight_number: {flight_number}")
#             return None
#         except Exception as e:
#             logger.error(f"Error fetching flight status for flight_number {flight_number}: {e}", exc_info=True)
#             return None
    
#     async def update_seat_number(self, confirmation_number: str, new_seat: str) -> bool:
#         """Update seat number for a booking."""
#         try:
#             response = self.supabase.table("bookings").update({
#                 "seat_number": new_seat
#             }).eq("confirmation_number", confirmation_number).execute()
            
#             updated = len(response.data) > 0
#             if updated:
#                 logger.info(f"Successfully updated seat to {new_seat} for confirmation {confirmation_number}.")
#             else:
#                 logger.warning(f"Failed to update seat for confirmation {confirmation_number}: no matching booking found or no change.")
#             return updated
#         except Exception as e:
#             logger.error(f"Error updating seat for confirmation {confirmation_number}: {e}", exc_info=True)
#             return False
    
#     async def cancel_booking(self, confirmation_number: str) -> bool:
#         """Cancel a booking by setting its status to 'Cancelled'."""
#         try:
#             response = self.supabase.table("bookings").update({
#                 "booking_status": "Cancelled"
#             }).eq("confirmation_number", confirmation_number).execute()
            
#             cancelled = len(response.data) > 0
#             if cancelled:
#                 logger.info(f"Successfully cancelled booking with confirmation {confirmation_number}.")
#             else:
#                 logger.warning(f"Failed to cancel booking for confirmation {confirmation_number}: no matching booking found or already cancelled.")
#             return cancelled
#         except Exception as e:
#             logger.error(f"Error cancelling booking for confirmation {confirmation_number}: {e}", exc_info=True)
#             return False
    
#     async def get_bookings_by_customer_id(self, customer_id: str) -> List[Dict[str, Any]]:
#         """Get all bookings for a customer by their customer_id."""
#         try:
#             response = self.supabase.table("bookings").select("""
#                 *,
#                 flights:flight_id(*)
#             """).eq("customer_id", customer_id).execute() 

#             if response.data:
#                 logger.debug(f"Found {len(response.data)} bookings for customer_id: {customer_id}")
#             else:
#                 logger.debug(f"No bookings found for customer_id: {customer_id}")
#             return response.data or []
#         except Exception as e:
#             logger.error(f"Error fetching bookings for customer ID {customer_id}: {e}", exc_info=True)
#             return []

#     async def get_customer_bookings(self, account_number: str) -> List[Dict[str, Any]]:
#         """
#         [NOTE: This method might not be correctly configured for Supabase RLS policies
#         or table relationships if 'customers.account_number' is not directly queryable
#         through the 'bookings' table for security reasons. 
#         'get_bookings_by_customer_id' is generally more robust.]

#         Get all bookings for a customer by their account number.
#         """
#         try:
#             # This query assumes a direct join or RLS setup that allows filtering
#             # bookings by a customer's account_number through a foreign key relationship.
#             response = self.supabase.table("bookings").select("""
#                 *,
#                 flights:flight_id(*)
#             """).eq("customers.account_number", account_number).execute()
#             if response.data:
#                 logger.debug(f"Found {len(response.data)} bookings for account_number: {account_number}")
#             else:
#                 logger.debug(f"No bookings found for account_number: {account_number}")
#             return response.data or []
#         except Exception as e:
#             logger.error(f"Error fetching customer bookings for account {account_number}: {e}", exc_info=True)
#             return []
    
#     async def save_conversation(self, session_id: str, history: List[Dict], context: Dict, current_agent: str) -> bool:
#         """Save or update conversation state to the 'conversations' table."""
#         try:
#             data = {
#                 "session_id": session_id,
#                 "history": history,
#                 "context": context,
#                 "current_agent": current_agent,
#                 "last_updated": "now()"
#             }
            
#             response = self.supabase.table("conversations").upsert(data).execute()
            
#             upserted = len(response.data) > 0
#             if upserted:
#                 logger.debug(f"Conversation {session_id} successfully saved/updated.")
#             else:
#                 logger.warning(f"Failed to upsert conversation {session_id}.")
#             return upserted
#         except Exception as e:
#             logger.error(f"Error saving conversation {session_id}: {e}", exc_info=True)
#             return False
    
#     async def load_conversation(self, session_id: str) -> Optional[Dict[str, Any]]:
#         """Load conversation state from the 'conversations' table."""
#         try:
#             response = self.supabase.table("conversations").select("*").eq("session_id", session_id).execute()
#             if response.data:
#                 logger.debug(f"Conversation {session_id} successfully loaded.")
#                 return response.data[0]
#             logger.debug(f"No conversation found for session_id: {session_id}.")
#             return None
#         except Exception as e:
#             logger.error(f"Error loading conversation {session_id}: {e}", exc_info=True)
#             return None

# # Global instance of SupabaseClient
# db_client = SupabaseClient()

































import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime, date

logger = logging.getLogger(__name__)

class SupabaseClient:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables.")
        
        self.supabase: Client = create_client(url, key)
        logger.info("Supabase client initialized.")
    
    async def get_customer_by_account_number(self, account_number: str) -> Optional[Dict[str, Any]]:
        """Get customer details by account number, including conference info."""
        try:
            logger.debug(f"Querying customers table for account_number: '{account_number}'")
            # Select all fields, including new conference-related ones
            response = self.supabase.table("customers").select("*").eq("account_number", account_number).execute()
            logger.debug(f"Supabase response data: {response.data}")
            
            if response.data:
                logger.debug(f"Found customer for account_number: {account_number}")
                return response.data[0]
            logger.debug(f"No customer found for account_number: {account_number}")
            return None
        except Exception as e:
            logger.error(f"Error fetching customer with account_number {account_number}: {e}", exc_info=True)
            return None
    
    async def get_booking_by_confirmation(self, confirmation_number: str) -> Optional[Dict[str, Any]]:
        """Get booking details with customer and flight info."""
        try:
            response = self.supabase.table("bookings").select("""
                *,
                customers:customer_id(*),
                flights:flight_id(*)
            """).eq("confirmation_number", confirmation_number).execute()
            
            if response.data:
                logger.debug(f"Found booking for confirmation_number: {confirmation_number}")
                return response.data[0]
            logger.debug(f"No booking found for confirmation_number: {confirmation_number}")
            return None
        except Exception as e:
            logger.error(f"Error fetching booking with confirmation_number {confirmation_number}: {e}", exc_info=True)
            return None
    
    async def get_flight_status(self, flight_number: str) -> Optional[Dict[str, Any]]:
        """Get flight status information."""
        try:
            response = self.supabase.table("flights").select("*").eq("flight_number", flight_number).execute()
            if response.data:
                logger.debug(f"Found flight status for flight_number: {flight_number}")
                return response.data[0]
            logger.debug(f"No flight status found for flight_number: {flight_number}")
            return None
        except Exception as e:
            logger.error(f"Error fetching flight status for flight_number {flight_number}: {e}", exc_info=True)
            return None
    
    async def update_seat_number(self, confirmation_number: str, new_seat: str) -> bool:
        """Update seat number for a booking."""
        try:
            response = self.supabase.table("bookings").update({
                "seat_number": new_seat
            }).eq("confirmation_number", confirmation_number).execute()
            
            updated = len(response.data) > 0
            if updated:
                logger.info(f"Successfully updated seat to {new_seat} for confirmation {confirmation_number}.")
            else:
                logger.warning(f"Failed to update seat for confirmation {confirmation_number}: no matching booking found or no change.")
            return updated
        except Exception as e:
            logger.error(f"Error updating seat for confirmation {confirmation_number}: {e}", exc_info=True)
            return False
    
    async def cancel_booking(self, confirmation_number: str) -> bool:
        """Cancel a booking by setting its status to 'Cancelled'."""
        try:
            response = self.supabase.table("bookings").update({
                "booking_status": "Cancelled"
            }).eq("confirmation_number", confirmation_number).execute()
            
            cancelled = len(response.data) > 0
            if cancelled:
                logger.info(f"Successfully cancelled booking with confirmation {confirmation_number}.")
            else:
                logger.warning(f"Failed to cancel booking for confirmation {confirmation_number}: no matching booking found or already cancelled.")
            return cancelled
        except Exception as e:
            logger.error(f"Error cancelling booking for confirmation {confirmation_number}: {e}", exc_info=True)
            return False
    
    async def get_bookings_by_customer_id(self, customer_id: str) -> List[Dict[str, Any]]:
        """Get all bookings for a customer by their customer_id."""
        try:
            response = self.supabase.table("bookings").select("""
                *,
                flights:flight_id(*)
            """).eq("customer_id", customer_id).execute() 

            if response.data:
                logger.debug(f"Found {len(response.data)} bookings for customer_id: {customer_id}")
            else:
                logger.debug(f"No bookings found for customer_id: {customer_id}")
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching bookings for customer ID {customer_id}: {e}", exc_info=True)
            return []

    # --- NEW METHODS FOR CONFERENCE SCHEDULE ---
    async def get_conference_schedule(
        self,
        speaker_name: Optional[str] = None,
        topic: Optional[str] = None,
        conference_room_name: Optional[str] = None,
        track_name: Optional[str] = None,
        conference_date: Optional[date] = None,
        time_range_start: Optional[datetime] = None,
        time_range_end: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetches conference schedule based on various filters.
        Converts date objects to ISO format strings for Supabase query.
        """
        try:
            query = self.supabase.table("conference_schedules").select("*")

            if speaker_name:
                query = query.ilike("speaker_name", f"%{speaker_name}%")
            if topic:
                query = query.ilike("topic", f"%{topic}%")
            if conference_room_name:
                query = query.ilike("conference_room_name", f"%{conference_room_name}%")
            if track_name:
                query = query.ilike("track_name", f"%{track_name}%")
            if conference_date:
                query = query.eq("conference_date", conference_date.isoformat()) # Convert date to ISO string
            if time_range_start:
                query = query.gte("start_time", time_range_start.isoformat()) # Convert datetime to ISO string
            if time_range_end:
                query = query.lte("end_time", time_range_end.isoformat()) # Convert datetime to ISO string

            response = query.order("start_time").execute() # Order by time for better readability
            
            if response.data:
                logger.debug(f"Found {len(response.data)} conference sessions.")
            else:
                logger.debug("No conference sessions found for the given criteria.")
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching conference schedule: {e}", exc_info=True)
            return []
    # --- END NEW METHODS ---

    async def get_customer_bookings(self, account_number: str) -> List[Dict[str, Any]]:
        """
        [NOTE: This method might not be correctly configured for Supabase RLS policies
        or table relationships if 'customers.account_number' is not directly queryable
        through the 'bookings' table for security reasons. 
        'get_bookings_by_customer_id' is generally more robust.]

        Get all bookings for a customer by their account number.
        """
        try:
            # This query assumes a direct join or RLS setup that allows filtering
            # bookings by a customer's account_number through a foreign key relationship.
            response = self.supabase.table("bookings").select("""
                *,
                flights:flight_id(*)
            """).eq("customers.account_number", account_number).execute()
            if response.data:
                logger.debug(f"Found {len(response.data)} bookings for account_number: {account_number}")
            else:
                logger.debug(f"No bookings found for account_number: {account_number}")
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching customer bookings for account {account_number}: {e}", exc_info=True)
            return []
    
    async def save_conversation(self, session_id: str, history: List[Dict], context: Dict, current_agent: str) -> bool:
        """Save or update conversation state to the 'conversations' table."""
        try:
            data = {
                "session_id": session_id,
                "history": history,
                "context": context,
                "current_agent": current_agent,
                "last_updated": "now()"
            }
            
            response = self.supabase.table("conversations").upsert(data).execute()
            
            upserted = len(response.data) > 0
            if upserted:
                logger.debug(f"Conversation {session_id} successfully saved/updated.")
            else:
                logger.warning(f"Failed to upsert conversation {session_id}.")
            return upserted
        except Exception as e:
            logger.error(f"Error saving conversation {session_id}: {e}", exc_info=True)
            return False
    
    async def load_conversation(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Load conversation state from the 'conversations' table."""
        try:
            response = self.supabase.table("conversations").select("*").eq("session_id", session_id).execute()
            if response.data:
                logger.debug(f"Conversation {session_id} successfully loaded.")
                return response.data[0]
            logger.debug(f"No conversation found for session_id: {session_id}.")
            return None
        except Exception as e:
            logger.error(f"Error loading conversation {session_id}: {e}", exc_info=True)
            return None

# Global instance of SupabaseClient
db_client = SupabaseClient()
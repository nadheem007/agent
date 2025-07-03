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
    
    async def get_user_by_registration_id(self, registration_id: str) -> Optional[Dict[str, Any]]:
        """Get user details by registration_id from the users table."""
        try:
            logger.debug(f"Querying users table for registration_id: '{registration_id}'")
            
            response = self.supabase.table("users").select("*").execute()
            
            if response.data:
                for user in response.data:
                    details = user.get("details", {})
                    if isinstance(details, dict) and str(details.get("registration_id")) == str(registration_id):
                        logger.debug(f"Found user for registration_id: {registration_id}")
                        return user
            
            logger.debug(f"No user found for registration_id: {registration_id}")
            return None
        except Exception as e:
            logger.error(f"Error fetching user with registration_id {registration_id}: {e}", exc_info=True)
            return None

    async def get_customer_by_account_number(self, account_number: str) -> Optional[Dict[str, Any]]:
        """Get customer details by account number, including conference info."""
        try:
            logger.debug(f"Querying customers table for account_number: '{account_number}'")
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
        """Fetches conference schedule based on various filters."""
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
                query = query.eq("conference_date", conference_date.isoformat())
            if time_range_start:
                query = query.gte("start_time", time_range_start.isoformat())
            if time_range_end:
                query = query.lte("end_time", time_range_end.isoformat())

            response = query.order("start_time").execute()
            
            if response.data:
                logger.debug(f"Found {len(response.data)} conference sessions.")
            else:
                logger.debug("No conference sessions found for the given criteria.")
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching conference schedule: {e}", exc_info=True)
            return []

    async def get_all_speakers(self) -> List[str]:
        """Get all unique speakers from conference_schedules."""
        try:
            response = self.supabase.table("conference_schedules").select("speaker_name").execute()
            if response.data:
                speakers = list(set([item["speaker_name"] for item in response.data]))
                speakers.sort()
                logger.debug(f"Found {len(speakers)} unique speakers.")
                return speakers
            return []
        except Exception as e:
            logger.error(f"Error fetching speakers: {e}", exc_info=True)
            return []

    async def get_all_tracks(self) -> List[str]:
        """Get all unique tracks from conference_schedules."""
        try:
            response = self.supabase.table("conference_schedules").select("track_name").execute()
            if response.data:
                tracks = list(set([item["track_name"] for item in response.data]))
                tracks.sort()
                logger.debug(f"Found {len(tracks)} unique tracks.")
                return tracks
            return []
        except Exception as e:
            logger.error(f"Error fetching tracks: {e}", exc_info=True)
            return []

    async def get_all_rooms(self) -> List[str]:
        """Get all unique rooms from conference_schedules."""
        try:
            response = self.supabase.table("conference_schedules").select("conference_room_name").execute()
            if response.data:
                rooms = list(set([item["conference_room_name"] for item in response.data]))
                rooms.sort()
                logger.debug(f"Found {len(rooms)} unique rooms.")
                return rooms
            return []
        except Exception as e:
            logger.error(f"Error fetching rooms: {e}", exc_info=True)
            return []

    # Networking Agent Database Methods
    async def get_user_businesses(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all businesses for a user."""
        try:
            response = self.supabase.table("ib_businesses").select("*").eq("user_id", user_id).execute()
            if response.data:
                logger.debug(f"Found {len(response.data)} businesses for user_id: {user_id}")
                return response.data
            return []
        except Exception as e:
            logger.error(f"Error fetching businesses for user {user_id}: {e}", exc_info=True)
            return []

    async def get_all_businesses(self, organization_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all businesses, optionally filtered by organization."""
        try:
            query = self.supabase.table("ib_businesses").select("*, users!inner(*)")
            if organization_id:
                query = query.eq("organization_id", organization_id)
            
            response = query.execute()
            if response.data:
                logger.debug(f"Found {len(response.data)} businesses.")
                return response.data
            return []
        except Exception as e:
            logger.error(f"Error fetching all businesses: {e}", exc_info=True)
            return []

    async def search_businesses(
        self,
        industry_sector: Optional[str] = None,
        location: Optional[str] = None,
        company_name: Optional[str] = None,
        sub_sector: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search businesses by various criteria."""
        try:
            response = self.supabase.table("ib_businesses").select("*, users!inner(*)").execute()
            
            if not response.data:
                return []
            
            filtered_businesses = []
            for business in response.data:
                details = business.get("details", {})
                if not isinstance(details, dict):
                    continue
                
                match = True
                if industry_sector and industry_sector.lower() not in details.get("industrySector", "").lower():
                    match = False
                if location and location.lower() not in details.get("location", "").lower():
                    match = False
                if company_name and company_name.lower() not in details.get("companyName", "").lower():
                    match = False
                if sub_sector and sub_sector.lower() not in details.get("subSector", "").lower():
                    match = False
                
                if match:
                    filtered_businesses.append(business)
            
            logger.debug(f"Found {len(filtered_businesses)} matching businesses.")
            return filtered_businesses
        except Exception as e:
            logger.error(f"Error searching businesses: {e}", exc_info=True)
            return []

    async def get_organization_info(self, organization_id: str) -> Optional[Dict[str, Any]]:
        """Get organization information."""
        try:
            response = self.supabase.table("organizations").select("*").eq("id", organization_id).execute()
            if response.data:
                logger.debug(f"Found organization for id: {organization_id}")
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching organization {organization_id}: {e}", exc_info=True)
            return None

    async def get_user_role_info(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user role information."""
        try:
            response = self.supabase.table("users").select("*, roles(*)").eq("id", user_id).execute()
            if response.data:
                logger.debug(f"Found user role info for user_id: {user_id}")
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching user role info {user_id}: {e}", exc_info=True)
            return None

    async def add_business(self, user_id: str, business_details: Dict[str, Any], organization_id: str) -> bool:
        """Add a new business for a user."""
        try:
            data = {
                "user_id": user_id,
                "details": business_details,
                "organization_id": organization_id,
                "is_active": True
            }
            
            response = self.supabase.table("ib_businesses").insert(data).execute()
            
            success = len(response.data) > 0
            if success:
                logger.info(f"Successfully added business for user {user_id}.")
            else:
                logger.warning(f"Failed to add business for user {user_id}.")
            return success
        except Exception as e:
            logger.error(f"Error adding business for user {user_id}: {e}", exc_info=True)
            return False

    async def get_customer_bookings(self, account_number: str) -> List[Dict[str, Any]]:
        """Get all bookings for a customer by their account number."""
        try:
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
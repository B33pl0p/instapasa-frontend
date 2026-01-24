class Order(Document):
    """Order model for Instagram ecommerce."""
    order_number: Annotated[str, Indexed(unique=True)]
    customer_id: str  # Marketer/customer ID (seller)
    buyer_id: str  # Buyer's Instagram user ID
    instagram_user_id: Optional[str] = None  # Deprecated: use buyer_id instead (kept for backward compatibility)
    buyer_instagram_username: Optional[str] = None  # Instagram username of buyer (for seller to identify)
    conversation_id: str  # Instagram conversation ID
    items: List[Dict[str, Any]] = []  # Store as dict for Beanie compatibility
    total: float
    
    # Customer details (optional initially, filled later)
    customer_name: Optional[str] = None
    shipping_address: Optional[str] = None
    phone: Optional[str] = None
    
    # Payment tracking
    payment_reference: Optional[str] = None
    payment_method: Optional[str] = None
    payment_confirmed_at: Optional[datetime] = None
    
    status: str = "pending_details"  # pending_details, confirmed, processing, shipped, delivered, cancelled
    notes: Optional[str] = None
    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "orders"
        indexes = ["customer_id", "buyer_id", "instagram_user_id", "conversation_id", "status"]


from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from beanie import Document, Indexed


class Conversation(Document):
    """
    Stores a single conversation thread between a Page and a user.
    """

    # Graph identifiers
    conversation_id: str  # Meta conversation ID
    page_id: str
    platform: str  # e.g. "instagram"

    # Participant identifiers (for quick filtering)
    customer_id: Optional[str] = None  # our Customer.id as string
    instagram_user_id: Optional[str] = None  # Business/seller Instagram ID
    
    # Buyer identifiers (extracted from participants for easy access)
    buyer_id: Optional[str] = None  # Buyer's Instagram user ID
    buyer_username: Optional[str] = None  # Buyer's Instagram username

    # Summary fields
    participants: List[Dict[str, Any]] = []
    last_message: Optional[Dict[str, Any]] = None
    updated_time: Optional[str] = None  # ISO8601 from Meta

    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "conversations"
        indexes = [
            "conversation_id",
            "page_id",
            "instagram_user_id",
            "buyer_id",
        ]


class ConversationMessage(Document):
    """
    Stores individual messages for a conversation, so we can show full
    history in the dashboard without re-pulling from Meta every time.
    
    Supports:
    - Text messages
    - Postback payloads (button clicks, quick replies)
    - Attachments (images, videos, files)
    - Stickers
    """

    conversation_id: str  # Meta conversation ID
    page_id: str
    platform: str  # "instagram"

    message_id: str
    created_time: str  # keep Meta's ISO8601 string
    text: Optional[str] = None
    from_user: Optional[Dict[str, Any]] = None
    to_users: List[Dict[str, Any]] = []

    is_from_business: bool = False

    # New interaction types (postbacks, attachments, stickers)
    postback: Optional[Dict[str, Any]] = None  # Contains payload from button clicks
    attachments: Optional[List[Dict[str, Any]]] = None  # Images, videos, files, etc.
    sticker: Optional[str] = None  # Sticker URL

    instagram_user_id: Optional[str] = None  # Business Instagram ID (for backward compatibility)
    buyer_id: Optional[str] = None  # Buyer's Instagram user ID
    customer_id: Optional[str] = None  # our Customer.id as string

    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "conversation_messages"
        indexes = [
            "conversation_id",
            "message_id",
            "instagram_user_id",
            "buyer_id",
        ]


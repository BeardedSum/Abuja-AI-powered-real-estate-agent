"""Schedule showing tool for ADK agents."""

import os
from typing import Dict, Any
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from google.genai.types import Tool, FunctionDeclaration

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/abuja_realty")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def schedule_showing(
    property_id: str,
    user_id: str,
    scheduled_at: str,
    notes: str = ""
) -> Dict[str, Any]:
    """
    Schedule a property showing for a user.

    Args:
        property_id: ID of the property to view
        user_id: ID of the user scheduling the showing
        scheduled_at: ISO format datetime string (e.g., "2024-01-15T14:00:00")
        notes: Optional notes about the showing

    Returns:
        Dictionary with showing details
    """
    try:
        session = SessionLocal()

        # Validate the datetime
        try:
            scheduled_datetime = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
        except ValueError:
            return {
                "success": False,
                "error": "Invalid datetime format. Use ISO format (e.g., 2024-01-15T14:00:00)"
            }

        # Check if property exists
        property_check = session.execute(
            "SELECT id, title FROM properties WHERE id = :property_id",
            {"property_id": property_id}
        ).fetchone()

        if not property_check:
            session.close()
            return {
                "success": False,
                "error": "Property not found"
            }

        # Check if user exists
        user_check = session.execute(
            "SELECT id, phone_number FROM users WHERE id = :user_id",
            {"user_id": user_id}
        ).fetchone()

        if not user_check:
            session.close()
            return {
                "success": False,
                "error": "User not found"
            }

        # Create the showing
        insert_query = """
            INSERT INTO showings (
                id, property_id, user_id, scheduled_at, status, notes, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), :property_id, :user_id, :scheduled_at, 'scheduled',
                :notes, NOW(), NOW()
            )
            RETURNING id, scheduled_at
        """

        result = session.execute(
            insert_query,
            {
                "property_id": property_id,
                "user_id": user_id,
                "scheduled_at": scheduled_datetime,
                "notes": notes
            }
        )

        showing = result.fetchone()
        session.commit()
        session.close()

        return {
            "success": True,
            "showing_id": str(showing[0]),
            "property_title": property_check[1],
            "scheduled_at": scheduled_at,
            "message": f"Showing scheduled for {scheduled_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def check_showing_availability(
    property_id: str,
    date: str
) -> Dict[str, Any]:
    """
    Check showing availability for a property on a specific date.

    Args:
        property_id: ID of the property
        date: Date to check (YYYY-MM-DD format)

    Returns:
        Dictionary with available time slots
    """
    try:
        session = SessionLocal()

        # Get existing showings for the date
        query = """
            SELECT scheduled_at
            FROM showings
            WHERE property_id = :property_id
            AND DATE(scheduled_at) = :date
            AND status IN ('scheduled', 'confirmed')
            ORDER BY scheduled_at
        """

        result = session.execute(
            query,
            {"property_id": property_id, "date": date}
        )

        booked_times = [row[0].strftime('%H:%M') for row in result.fetchall()]
        session.close()

        # Standard showing times (9 AM - 6 PM)
        available_times = []
        for hour in range(9, 18):  # 9 AM to 6 PM
            time_slot = f"{hour:02d}:00"
            if time_slot not in booked_times:
                available_times.append(time_slot)

        return {
            "success": True,
            "date": date,
            "available_times": available_times,
            "booked_times": booked_times,
            "message": f"Found {len(available_times)} available time slots"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# Define tools for ADK
schedule_showing_declaration = FunctionDeclaration(
    name="schedule_showing",
    description="""Schedule a property showing for a user.

    Use this tool when a user wants to view a property in person.
    Always confirm the date and time with the user before scheduling.

    Best practices:
    - Suggest 3 available time slots
    - Confirm user's preferred date/time
    - Standard showing hours: 9 AM - 6 PM, Monday-Saturday
    - Allow 1-hour buffer between showings""",
    parameters={
        "type": "object",
        "properties": {
            "property_id": {
                "type": "string",
                "description": "UUID of the property to view"
            },
            "user_id": {
                "type": "string",
                "description": "UUID of the user scheduling the showing"
            },
            "scheduled_at": {
                "type": "string",
                "description": "ISO format datetime (e.g., 2024-01-15T14:00:00)"
            },
            "notes": {
                "type": "string",
                "description": "Optional notes about the showing preferences"
            }
        },
        "required": ["property_id", "user_id", "scheduled_at"]
    }
)

check_availability_declaration = FunctionDeclaration(
    name="check_showing_availability",
    description="""Check what time slots are available for property showings on a specific date.

    Use this before scheduling to show the user available times.""",
    parameters={
        "type": "object",
        "properties": {
            "property_id": {
                "type": "string",
                "description": "UUID of the property"
            },
            "date": {
                "type": "string",
                "description": "Date to check in YYYY-MM-DD format"
            }
        },
        "required": ["property_id", "date"]
    }
)

# Create Tool object
schedule_showing_tool = Tool(
    function_declarations=[schedule_showing_declaration, check_availability_declaration]
)

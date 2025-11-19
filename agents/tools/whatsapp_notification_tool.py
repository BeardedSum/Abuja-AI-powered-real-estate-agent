"""WhatsApp notification tool for ADK agents."""

import os
from typing import Dict, Any
import requests
from google.genai.types import Tool, FunctionDeclaration

WHATSAPP_API_URL = os.getenv("WHATSAPP_API_URL", "https://graph.facebook.com/v18.0")
PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "")


def send_whatsapp_message(
    phone_number: str,
    message: str
) -> Dict[str, Any]:
    """
    Send a WhatsApp message to a user.

    Args:
        phone_number: User's WhatsApp phone number (with country code, e.g., +234...)
        message: Text message to send

    Returns:
        Dictionary with success status and message ID
    """
    if not ACCESS_TOKEN or not PHONE_NUMBER_ID:
        return {
            "success": False,
            "error": "WhatsApp API not configured"
        }

    try:
        url = f"{WHATSAPP_API_URL}/{PHONE_NUMBER_ID}/messages"

        headers = {
            "Authorization": f"Bearer {ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "text",
            "text": {
                "body": message
            }
        }

        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()

        data = response.json()
        message_id = data.get('messages', [{}])[0].get('id', '')

        return {
            "success": True,
            "message_id": message_id,
            "message": "WhatsApp message sent successfully"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def send_whatsapp_location(
    phone_number: str,
    latitude: float,
    longitude: float,
    name: str,
    address: str
) -> Dict[str, Any]:
    """
    Send a location via WhatsApp to a user.

    Args:
        phone_number: User's WhatsApp phone number
        latitude: Location latitude
        longitude: Location longitude
        name: Location name
        address: Location address

    Returns:
        Dictionary with success status
    """
    if not ACCESS_TOKEN or not PHONE_NUMBER_ID:
        return {
            "success": False,
            "error": "WhatsApp API not configured"
        }

    try:
        url = f"{WHATSAPP_API_URL}/{PHONE_NUMBER_ID}/messages"

        headers = {
            "Authorization": f"Bearer {ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "location",
            "location": {
                "latitude": str(latitude),
                "longitude": str(longitude),
                "name": name,
                "address": address
            }
        }

        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()

        return {
            "success": True,
            "message": "Location sent successfully"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# NOTE: These tools are typically NOT exposed directly to agents as they're handled
# by the backend after agent responses. They're included here for reference and
# potential future use in agent-initiated notifications.

# For now, agents will use suggested_actions in their responses to request
# the backend to send notifications.

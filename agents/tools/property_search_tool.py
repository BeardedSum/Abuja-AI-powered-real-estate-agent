"""Property search tool for ADK agents."""

import os
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, and_, or_
from sqlalchemy.orm import sessionmaker
from google.genai.types import Tool, FunctionDeclaration

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/abuja_realty")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def search_properties(
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    neighborhood: Optional[str] = None,
    limit: int = 5
) -> Dict[str, Any]:
    """
    Search for properties in the Abuja Realty database.

    Args:
        property_type: Type of property (house, flat, duplex, land, commercial)
        min_price: Minimum price in Naira
        max_price: Maximum price in Naira
        bedrooms: Minimum number of bedrooms
        bathrooms: Minimum number of bathrooms
        neighborhood: Abuja neighborhood name
        limit: Maximum number of results to return (default 5)

    Returns:
        Dictionary with properties list and count
    """
    try:
        session = SessionLocal()

        # Build SQL query
        query = """
            SELECT
                p.id, p.title, p.description, p.price, p.neighborhood,
                p.address, p.bedrooms, p.bathrooms, p.size_sqm,
                p.property_type, p.features, p.latitude, p.longitude,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'url', pm.url,
                            'media_type', pm.media_type,
                            'caption', pm.caption
                        ) ORDER BY pm."order"
                    ) FILTER (WHERE pm.id IS NOT NULL),
                    '[]'
                ) as media
            FROM properties p
            LEFT JOIN property_media pm ON p.id = pm.property_id
            WHERE p.status = 'available'
        """

        params = {}
        conditions = []

        if property_type:
            conditions.append("p.property_type = :property_type")
            params['property_type'] = property_type

        if min_price is not None:
            conditions.append("p.price >= :min_price")
            params['min_price'] = min_price

        if max_price is not None:
            conditions.append("p.price <= :max_price")
            params['max_price'] = max_price

        if bedrooms is not None:
            conditions.append("p.bedrooms >= :bedrooms")
            params['bedrooms'] = bedrooms

        if bathrooms is not None:
            conditions.append("p.bathrooms >= :bathrooms")
            params['bathrooms'] = bathrooms

        if neighborhood:
            conditions.append("LOWER(p.neighborhood) LIKE LOWER(:neighborhood)")
            params['neighborhood'] = f"%{neighborhood}%"

        if conditions:
            query += " AND " + " AND ".join(conditions)

        query += " GROUP BY p.id ORDER BY p.created_at DESC LIMIT :limit"
        params['limit'] = limit

        result = session.execute(query, params)
        rows = result.fetchall()

        properties = []
        for row in rows:
            properties.append({
                'id': str(row[0]),
                'title': row[1],
                'description': row[2],
                'price': float(row[3]),
                'neighborhood': row[4],
                'address': row[5],
                'bedrooms': row[6],
                'bathrooms': row[7],
                'size_sqm': float(row[8]) if row[8] else None,
                'property_type': row[9],
                'features': row[10] or [],
                'latitude': float(row[11]),
                'longitude': float(row[12]),
                'media': row[13] if row[13] != '[]' else []
            })

        session.close()

        return {
            "success": True,
            "properties": properties,
            "count": len(properties),
            "message": f"Found {len(properties)} properties matching criteria"
        }

    except Exception as e:
        return {
            "success": False,
            "properties": [],
            "count": 0,
            "error": str(e)
        }


# Define the tool for ADK
property_search_declaration = FunctionDeclaration(
    name="search_properties",
    description="""Search for properties in Abuja, Nigeria. Use this tool to find properties matching user criteria.

    Abuja neighborhoods include: Maitama, Asokoro, Gwarinpa, Wuse, Wuse 2, Jabi, Katampe,
    Lokogoma, Lugbe, Kubwa, Nyanya, Karu, Jikwoyi, Apo, Galadimawa, Central Business District (CBD).

    Property types: house, flat (apartment), duplex, land, commercial.

    Always ask clarifying questions if user criteria is vague.""",
    parameters={
        "type": "object",
        "properties": {
            "property_type": {
                "type": "string",
                "description": "Type of property: house, flat, duplex, land, or commercial",
                "enum": ["house", "flat", "duplex", "land", "commercial"]
            },
            "min_price": {
                "type": "number",
                "description": "Minimum price in Nigerian Naira (₦)"
            },
            "max_price": {
                "type": "number",
                "description": "Maximum price in Nigerian Naira (₦)"
            },
            "bedrooms": {
                "type": "integer",
                "description": "Minimum number of bedrooms"
            },
            "bathrooms": {
                "type": "integer",
                "description": "Minimum number of bathrooms"
            },
            "neighborhood": {
                "type": "string",
                "description": "Abuja neighborhood name (e.g., Maitama, Gwarinpa, Wuse)"
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of results (default 5, max 20)",
                "default": 5
            }
        }
    }
)

# Create the Tool object
property_search_tool = Tool(
    function_declarations=[property_search_declaration]
)

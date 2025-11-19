"""FastAPI server for Google ADK agents - provides HTTP API for the multi-agent system."""

import os
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Import the orchestrator agent
from orchestrator_agent import orchestrator_agent
from tools.property_search_tool import search_properties
from tools.google_maps_tool import search_nearby_places, get_neighborhood_info
from tools.schedule_showing_tool import schedule_showing, check_showing_availability

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Abuja Realty AI Agent Server",
    description="Google ADK multi-agent system for real estate operations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage (use Redis in production)
sessions: Dict[str, Dict[str, Any]] = {}


# Request/Response models
class AgentQueryRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    message: str
    message_type: str = "text"
    metadata: Optional[Dict[str, Any]] = None


class AgentQueryResponse(BaseModel):
    response: str
    session_id: str
    agent_name: Optional[str] = None
    requires_confirmation: bool = False
    suggested_actions: Optional[list] = None
    metadata: Optional[Dict[str, Any]] = None


class ToolCallRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]


# Helper function to execute tool calls
def execute_tool(tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a tool call based on name and parameters."""
    try:
        if tool_name == "search_properties":
            return search_properties(**parameters)
        elif tool_name == "search_nearby_places":
            return search_nearby_places(**parameters)
        elif tool_name == "get_neighborhood_info":
            return get_neighborhood_info(**parameters)
        elif tool_name == "schedule_showing":
            return schedule_showing(**parameters)
        elif tool_name == "check_showing_availability":
            return check_showing_availability(**parameters)
        else:
            return {"success": False, "error": f"Unknown tool: {tool_name}"}
    except Exception as e:
        logger.error(f"Tool execution error: {tool_name} - {str(e)}")
        return {"success": False, "error": str(e)}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Abuja Realty AI Agent Server",
        "version": "1.0.0",
        "status": "running",
        "agents": {
            "orchestrator": "abuja_realty_orchestrator",
            "specialists": [
                "property_search_agent",
                "showing_scheduler",
                "offer_manager",
                "market_analyst",
                "disclosure_processor"
            ]
        },
        "endpoints": {
            "health": "/health",
            "agent_query": "/agent/query",
            "tool_call": "/tool/execute"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "agents_loaded": True
    }


@app.post("/agent/query", response_model=AgentQueryResponse)
async def query_agent(request: AgentQueryRequest):
    """
    Query the ADK orchestrator agent with user input.

    The orchestrator will delegate to specialized agents as needed and
    maintain conversation context across the session.
    """
    try:
        logger.info(f"Agent query from user {request.user_id}: {request.message[:50]}...")

        # Get or create session
        session_id = request.session_id or f"session_{request.user_id}_{datetime.utcnow().timestamp()}"

        if session_id not in sessions:
            sessions[session_id] = {
                "user_id": request.user_id,
                "created_at": datetime.utcnow().isoformat(),
                "history": [],
                "context": {}
            }

        session = sessions[session_id]
        session["last_interaction"] = datetime.utcnow().isoformat()

        # Add user message to history
        session["history"].append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": request.metadata
        })

        # Prepare context for the agent
        # For Google ADK, we would use the session history and context here
        # This is a simplified version - real implementation would use ADK's session management

        # TODO: Implement actual Google ADK agent execution
        # For now, providing a structured response format

        # In production, this would be:
        # from google.adk.runners import Runner
        # runner = Runner(agent=orchestrator_agent)
        # result = runner.run(user_input=request.message, session=session_context)

        # Simulated agent response for structure
        # Replace this with actual ADK agent call
        agent_response = {
            "response": "This is where the ADK orchestrator agent would respond. " +
                       "The actual implementation requires the Google ADK SDK to be properly initialized " +
                       "with API keys and the agent runner to be configured.",
            "agent_name": "orchestrator",
            "requires_confirmation": False,
            "suggested_actions": [],
            "metadata": {
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        }

        # Add agent response to history
        session["history"].append({
            "role": "agent",
            "content": agent_response["response"],
            "timestamp": datetime.utcnow().isoformat(),
            "agent_name": agent_response.get("agent_name")
        })

        logger.info(f"Agent response generated for session {session_id}")

        return AgentQueryResponse(
            response=agent_response["response"],
            session_id=session_id,
            agent_name=agent_response.get("agent_name"),
            requires_confirmation=agent_response.get("requires_confirmation", False),
            suggested_actions=agent_response.get("suggested_actions"),
            metadata=agent_response.get("metadata")
        )

    except Exception as e:
        logger.error(f"Error processing agent query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent query failed: {str(e)}")


@app.post("/tool/execute")
async def execute_tool_endpoint(request: ToolCallRequest):
    """
    Execute a specific tool directly (for testing or direct calls).
    """
    try:
        logger.info(f"Direct tool execution: {request.tool_name}")

        result = execute_tool(request.tool_name, request.parameters)

        return {
            "success": result.get("success", False),
            "tool_name": request.tool_name,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error executing tool {request.tool_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {str(e)}")


@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear a user session."""
    if session_id in sessions:
        del sessions[session_id]
        logger.info(f"Session cleared: {session_id}")
        return {"message": "Session cleared successfully", "session_id": session_id}
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.get("/session/{session_id}")
async def get_session(session_id: str):
    """Retrieve session information."""
    if session_id in sessions:
        return sessions[session_id]
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info("🚀 Abuja Realty AI Agent Server starting...")
    logger.info("📦 Loading ADK agents...")

    # TODO: Initialize Google ADK agents properly
    # Verify API keys
    if not os.getenv("GOOGLE_GEMINI_API_KEY"):
        logger.warning("⚠️  GOOGLE_GEMINI_API_KEY not set - agent calls will fail")

    if not os.getenv("GOOGLE_MAPS_API_KEY"):
        logger.warning("⚠️  GOOGLE_MAPS_API_KEY not set - maps features will be limited")

    logger.info("✅ Agent server ready")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info("👋 Agent server shutting down...")
    # Clean up sessions, close connections, etc.
    sessions.clear()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    logger.info(f"Starting server on {host}:{port}")

    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=os.getenv("ENV") == "development",
        log_level="info"
    )

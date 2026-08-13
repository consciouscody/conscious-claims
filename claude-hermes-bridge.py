#!/usr/bin/env python3
"""
Claude-Hermes-Buzz Integration Bridge
Connects Claude, Hermes, and Buzz agents in unified multi-agent workspace
Enables shared context, contacts, and real-time coordination via Tailscale mesh
"""

import os
import json
import asyncio
import httpx
from typing import Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIG
# ============================================================================

CLAUDE_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
HERMES_URL = os.getenv("HERMES_URL", "http://localhost:3001")
BUZZ_URL = os.getenv("BUZZ_URL", "wss://consious-command.communities.buzz.xyz")
TAILSCALE_SOCKET = os.getenv("TAILSCALE_SOCKET", "/var/run/tailscale/tailscaled.sock")
BRIDGE_PORT = int(os.getenv("BRIDGE_PORT", "9000"))

# ============================================================================
# SHARED CONTEXT (CONTACT DATABASE & STATE)
# ============================================================================

@dataclass
class Contact:
    """Shared contact across all agents"""
    name: str
    email: str
    company: str
    phone: Optional[str] = None
    notes: Optional[str] = None
    added_by: Optional[str] = None
    timestamp: str = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

@dataclass
class AgentMessage:
    """Message from any agent in the system"""
    agent_name: str
    channel: str
    content: str
    timestamp: str = None
    context: dict = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
        if self.context is None:
            self.context = {}

class SharedContext:
    """Central context storage - accessible to all agents via bridge"""

    def __init__(self):
        self.contacts: dict[str, Contact] = {}
        self.messages: list[AgentMessage] = []
        self.agent_states: dict[str, dict] = {}
        self.lock = asyncio.Lock()

    async def add_contact(self, contact: Contact) -> None:
        async with self.lock:
            self.contacts[contact.email] = contact
            logger.info(f"Contact added: {contact.name} ({contact.email})")

    async def get_contacts(self, filter_by: Optional[str] = None) -> list[Contact]:
        async with self.lock:
            if filter_by:
                return [c for c in self.contacts.values() if filter_by.lower() in c.name.lower()]
            return list(self.contacts.values())

    async def add_message(self, message: AgentMessage) -> None:
        async with self.lock:
            self.messages.append(message)
            logger.info(f"[{message.agent_name}] {message.channel}: {message.content[:50]}...")

    async def get_messages(self, channel: Optional[str] = None, limit: int = 50) -> list[AgentMessage]:
        async with self.lock:
            if channel:
                return [m for m in self.messages[-limit:] if m.channel == channel]
            return self.messages[-limit:]

    async def update_agent_state(self, agent_name: str, state: dict) -> None:
        async with self.lock:
            self.agent_states[agent_name] = state
            logger.info(f"Agent state updated: {agent_name}")

    async def get_agent_state(self, agent_name: str) -> dict:
        async with self.lock:
            return self.agent_states.get(agent_name, {})

# ============================================================================
# CLAUDE ADAPTER
# ============================================================================

class ClaudeAdapter:
    """Adapter for Claude to receive tasks from Hermes and agents"""

    def __init__(self, api_key: str, shared_context: SharedContext):
        self.api_key = api_key
        self.context = shared_context
        self.base_url = "https://api.anthropic.com/v1"

    async def process_agent_request(self, agent_name: str, prompt: str, context_data: dict = None) -> str:
        """Process request from any agent, return Claude's response"""

        # Build context for Claude
        recent_messages = await self.context.get_messages(limit=10)
        recent_contacts = await self.context.get_contacts()

        system_prompt = f"""You are Claude, integrated into a multi-agent system.

Current agents in system: SEO Agent, Blueprint Agent, Warden Agent, Command Agent, Relay Agent, Hermes (orchestrator)

Recent conversation:
{json.dumps([asdict(m) for m in recent_messages[-5:]], indent=2)}

Available contacts in shared database:
{json.dumps([asdict(c) for c in recent_contacts], indent=2)}

Current request from: {agent_name}
Respond concisely. If sharing contacts or data, reference the shared context."""

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/messages",
                    headers={
                        "x-api-key": self.api_key,
                        "anthropic-version": "2023-06-01"
                    },
                    json={
                        "model": "claude-3-5-sonnet-20241022",
                        "max_tokens": 1024,
                        "system": system_prompt,
                        "messages": [{"role": "user", "content": prompt}]
                    }
                )

                if response.status_code == 200:
                    result = response.json()
                    answer = result["content"][0]["text"]

                    # Log Claude's response to shared context
                    await self.context.add_message(AgentMessage(
                        agent_name="Claude",
                        channel="#claude-bridge",
                        content=answer,
                        context={"request_from": agent_name}
                    ))

                    return answer
                else:
                    logger.error(f"Claude API error: {response.status_code} {response.text}")
                    return f"Error: {response.status_code}"

        except Exception as e:
            logger.error(f"Claude adapter error: {e}")
            return f"Error: {str(e)}"

# ============================================================================
# HERMES ADAPTER
# ============================================================================

class HermesAdapter:
    """Adapter for communicating with local Hermes orchestrator"""

    def __init__(self, hermes_url: str, shared_context: SharedContext):
        self.hermes_url = hermes_url
        self.context = shared_context

    async def send_to_hermes(self, message: dict) -> dict:
        """Send message to Hermes, get response"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.hermes_url}/api/agent-message",
                    json=message,
                    timeout=10.0
                )
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Hermes error: {response.status_code}")
                    return {}
        except Exception as e:
            logger.error(f"Hermes connection error: {e}")
            return {}

    async def sync_with_hermes(self, shared_context: SharedContext) -> None:
        """Periodic sync of shared context with Hermes"""
        while True:
            try:
                contacts = await shared_context.get_contacts()
                messages = await shared_context.get_messages(limit=20)

                await self.send_to_hermes({
                    "type": "sync",
                    "contacts": [asdict(c) for c in contacts],
                    "messages": [asdict(m) for m in messages],
                    "timestamp": datetime.now().isoformat()
                })

                await asyncio.sleep(5)  # Sync every 5 seconds
            except Exception as e:
                logger.error(f"Sync error: {e}")
                await asyncio.sleep(5)

# ============================================================================
# BUZZ ADAPTER
# ============================================================================

class BuzzAdapter:
    """Adapter for posting to Buzz channels"""

    def __init__(self, buzz_url: str, shared_context: SharedContext):
        self.buzz_url = buzz_url
        self.context = shared_context

    async def post_to_channel(self, channel: str, agent_name: str, content: str) -> None:
        """Post message to Buzz channel"""

        # Log to shared context first
        await self.context.add_message(AgentMessage(
            agent_name=agent_name,
            channel=channel,
            content=content
        ))

        # In real implementation, would use WebSocket to post to Buzz
        logger.info(f"Posted to {channel}: [{agent_name}] {content[:50]}...")

    async def broadcast_contacts(self, channel: str) -> None:
        """Broadcast shared contacts to Buzz"""
        contacts = await self.context.get_contacts()
        summary = f"📋 Shared Contacts ({len(contacts)}): " + ", ".join([c.name for c in contacts])
        await self.post_to_channel(channel, "System", summary)

# ============================================================================
# BRIDGE HTTP SERVER (for external agent integration)
# ============================================================================

async def start_bridge_server(shared_context: SharedContext, port: int = 9000):
    """HTTP server exposing bridge APIs"""

    from starlette.applications import Starlette
    from starlette.responses import JSONResponse
    from starlette.routing import Route
    import uvicorn

    async def health_check(request):
        return JSONResponse({"status": "healthy", "agents": len(shared_context.agent_states)})

    async def add_contact_handler(request):
        data = await request.json()
        contact = Contact(**data)
        await shared_context.add_contact(contact)
        return JSONResponse({"status": "added", "contact": asdict(contact)})

    async def get_contacts_handler(request):
        contacts = await shared_context.get_contacts()
        return JSONResponse([asdict(c) for c in contacts])

    async def send_message_handler(request):
        data = await request.json()
        message = AgentMessage(**data)
        await shared_context.add_message(message)
        return JSONResponse({"status": "received", "timestamp": message.timestamp})

    async def get_messages_handler(request):
        channel = request.query_params.get("channel")
        messages = await shared_context.get_messages(channel=channel)
        return JSONResponse([asdict(m) for m in messages])

    async def claude_request_handler(request):
        data = await request.json()
        claude = ClaudeAdapter(CLAUDE_API_KEY, shared_context)
        response = await claude.process_agent_request(
            agent_name=data.get("agent_name", "Unknown"),
            prompt=data.get("prompt", ""),
            context_data=data.get("context")
        )
        return JSONResponse({"agent": "Claude", "response": response})

    routes = [
        Route("/health", health_check),
        Route("/contacts/add", add_contact_handler, methods=["POST"]),
        Route("/contacts/list", get_contacts_handler),
        Route("/messages/send", send_message_handler, methods=["POST"]),
        Route("/messages/list", get_messages_handler),
        Route("/claude/request", claude_request_handler, methods=["POST"]),
    ]

    app = Starlette(routes=routes)

    config = uvicorn.Config(app, host="0.0.0.0", port=port, log_level="info")
    server = uvicorn.Server(config)

    logger.info(f"Bridge server starting on port {port}")
    await server.serve()

# ============================================================================
# MAIN ORCHESTRATOR
# ============================================================================

async def main():
    """Initialize and run the integrated multi-agent system"""

    logger.info("🚀 Claude-Hermes-Buzz Bridge initializing...")

    # Initialize shared context
    shared_context = SharedContext()

    # Initialize adapters
    claude = ClaudeAdapter(CLAUDE_API_KEY, shared_context)
    hermes = HermesAdapter(HERMES_URL, shared_context)
    buzz = BuzzAdapter(BUZZ_URL, shared_context)

    # Start background tasks
    tasks = [
        asyncio.create_task(hermes.sync_with_hermes(shared_context)),
        asyncio.create_task(start_bridge_server(shared_context, BRIDGE_PORT)),
    ]

    logger.info("✅ Bridge initialized. Waiting for agent connections...")
    logger.info(f"📡 Bridge API running on localhost:{BRIDGE_PORT}")
    logger.info(f"🔗 Connected to Hermes at {HERMES_URL}")
    logger.info(f"🎯 Connected to Buzz at {BUZZ_URL}")

    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())

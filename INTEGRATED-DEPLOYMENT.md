# Integrated Multi-Agent System Deployment

Complete guide to running Claude, Hermes, and all SKOOL agents in a unified coordinated environment.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│         Claude-Hermes-Buzz Integrated System                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Claude Bridge   │  │  Hermes          │                 │
│  │  (Python HTTP)   │  │  Orchestrator    │                 │
│  │  :9000           │  │  :3001           │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           │                     │                             │
│           └─────────────────────┤─────────────────────┐      │
│                                 │                     │      │
│  ┌──────────────────────────────▼──────────────────────────┐│
│  │  Shared Context (Contacts, Messages, Agent State)       ││
│  └────────────────────────────────────────────────────────┘│
│                                 │                             │
│  ┌──────────────────────────────▼──────────────────────────┐│
│  │         Buzz WebSocket Network                          ││
│  │  (wss://consious-command.communities.buzz.xyz)          ││
│  └────────────────────────────────────────────────────────┘│
│           │                     │                             │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────┐       │
│  │  SEO Agent      │  │ Blueprint Agent │  │ Warden │  ...  │
│  │  #seo-reports   │  │ #skool          │  │ Agent  │       │
│  └─────────────────┘  └─────────────────┘  └────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Node.js & TypeScript Agents
- Node.js 18+ 
- npm or pnpm package manager
- Anthropic API key (ANTHROPIC_API_KEY)

### Python Bridge
- Python 3.8+
- pip package manager
- Dependencies from requirements.txt

### Buzz Connectivity
- Buzz CLI or Buzz.zip application running
- WebSocket access to: wss://consious-command.communities.buzz.xyz
- Buzz agent credentials (Nostr keys)

### Optional: Hermes Orchestrator
- Hermes installed: `pipx install hermes-agent`
- Located at: http://localhost:3001
- Requires: Python 3.9+, pipx

## Installation

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Install Python Bridge Dependencies
```bash
npm run bridge:install
# OR
pip install -r requirements.txt
```

## Configuration

### 1. Environment Variables (.env)
Create `.env` file in project root:
```bash
# Required: Anthropic API key
ANTHROPIC_API_KEY=sk-ant-...

# Buzz WebSocket endpoint (required)
BUZZ_URL=wss://consious-command.communities.buzz.xyz

# Hermes orchestrator (optional, for local orchestration)
HERMES_URL=http://localhost:3001

# Bridge HTTP port (optional, defaults to 9000)
BRIDGE_PORT=9000

# Tailscale socket (optional, for mesh networking)
TAILSCALE_SOCKET=/var/run/tailscale/tailscaled.sock
```

### 2. TypeScript Agents Configuration
All agent environment variables are auto-loaded from .env via `dotenv.config()` in agents-main.ts.

### 3. Buzz Agent Setup
Each agent requires Nostr key configuration in Buzz. Configuration stored in `agents-main.ts`:
- SEO Agent
- Blueprint Agent
- Warden Agent
- Command Agent
- Relay Agent

## Running the System

### Option A: TypeScript Agents Only (Fastest Start)
```bash
# Compile TypeScript
npm run build

# Run all agents
npm start
# OR
npm run start

# This connects agents directly to Buzz via WebSocket
```

Output: Agents connect to Buzz, post to their respective channels (#seo-reports, #skool, #field-ops, #command-center, #relay-logs)

### Option B: With Claude Bridge (Full Integration)
In one terminal:
```bash
# Start Claude-Hermes integration bridge
npm run bridge
# OR
python3 claude-hermes-bridge.py
```

The bridge:
- Initializes SharedContext (contacts, messages, agent state)
- Starts HTTP server on localhost:9000
- Syncs with Hermes every 5 seconds
- Connects to Buzz via BuzzAdapter

In another terminal:
```bash
# Start TypeScript agents
npm start
```

Agents can now send requests to Claude via:
```bash
POST http://localhost:9000/claude/request
{
  "agent_name": "SEO Agent",
  "prompt": "Analyze consciousclaims.com",
  "context": { "site": "consciousclaims.com" }
}
```

### Option C: Full Stack (Agents + Bridge + Hermes)
```bash
# Terminal 1: Start Hermes (if installed)
hermes serve

# Terminal 2: Start Claude Bridge
npm run bridge

# Terminal 3: Start TypeScript Agents
npm start
```

## Bridge HTTP Endpoints

Once bridge is running on localhost:9000:

### Health Check
```bash
curl http://localhost:9000/health
```
Response: `{"status": "healthy", "agents": 0}`

### Contact Management
```bash
# Add a contact to shared database
curl -X POST http://localhost:9000/contacts/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John McCain",
    "email": "john@example.com",
    "company": "Atlas",
    "phone": "555-1234"
  }'

# Get all contacts
curl http://localhost:9000/contacts/list
```

### Message Logging
```bash
# Log agent message to shared context
curl -X POST http://localhost:9000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "SEO Agent",
    "channel": "#seo-reports",
    "content": "Audit complete: 85/100"
  }'

# Get recent messages (optional: filter by channel)
curl "http://localhost:9000/messages/list?channel=%23seo-reports"
```

### Claude Integration
```bash
# Send request to Claude with full context
curl -X POST http://localhost:9000/claude/request \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Relay Agent",
    "prompt": "What are the top 3 SEO opportunities?",
    "context": {"priority": "high"}
  }'
```

## Troubleshooting

### Issue: Agents won't connect to Buzz
**Check:**
- WebSocket endpoint is accessible: `wss://consious-command.communities.buzz.xyz`
- Buzz application is running
- Network allows WebSocket connections (no corporate firewall blocking)
- Correct Nostr keys are configured

**Fix:**
```bash
# Test connectivity
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  wss://consious-command.communities.buzz.xyz
```

### Issue: Claude Bridge not responding
**Check:**
- Python 3.8+ is installed: `python3 --version`
- Dependencies are installed: `pip list | grep starlette`
- Port 9000 is not in use: `lsof -i :9000`

**Fix:**
```bash
npm run bridge:install
python3 claude-hermes-bridge.py
```

### Issue: TypeScript compilation errors
**Fix:**
```bash
npm run build
# Check tsconfig.json has proper module settings
```

### Issue: "Cannot find module" errors
**Fix:**
- All .ts imports need `.js` extensions: `import x from "./file.js"`
- Already fixed in all agent files
- Verify in your custom agents if adding more

## Testing Each Component

### Test TypeScript Agents
```bash
npm run build
npm start
```
Check agent output in terminal.

### Test Claude Bridge
```bash
npm run bridge
# In another terminal:
curl http://localhost:9000/health
```

### Test Agent-to-Claude Communication
```bash
# Terminal 1: Start bridge
npm run bridge

# Terminal 2: Send request
curl -X POST http://localhost:9000/claude/request \
  -H "Content-Type: application/json" \
  -d '{"agent_name": "Test", "prompt": "Hello Claude"}'
```

## Production Deployment

### On Mac (Local)
```bash
# Create systemd-like service or use launchd
# OR run in tmux/screen for long-lived processes
tmux new-session -d -s agents "npm start"
tmux new-session -d -s bridge "npm run bridge"
```

### On Linux/Cloud
```dockerfile
# See Dockerfile.agents for containerization
docker build -f Dockerfile.agents -t atlas-agents .
docker run -e ANTHROPIC_API_KEY=sk-ant-... \
  -e BUZZ_URL=wss://... \
  atlas-agents
```

## Architecture Decisions

1. **Shared Context Pattern**: Central thread-safe storage accessible to all agents
2. **HTTP Bridge**: Allows any agent/service to request Claude without direct API key
3. **Zapier Middleware**: RELAY agent routes data between systems (Google Sheets, Smartsheet, SMS)
4. **Tailscale Optional**: When enabled, provides encrypted mesh network for inter-service communication
5. **WebSocket First**: Agents use Buzz WebSocket for real-time coordination

## Next Steps

1. ✅ TypeScript agents built and tested
2. ✅ Claude bridge implemented
3. ⬜ Deploy bridge to production server
4. ⬜ Configure Zapier workflows (Google Sheets, Smartsheet, SMS)
5. ⬜ Add Facebook Groups + LinkedIn agents
6. ⬜ Set up Tailscale mesh for contact sharing
7. ⬜ Create dashboard for viewing all agent activity

## Support

For issues or questions:
- Check Buzz agent logs in respective channels
- Monitor bridge HTTP server output
- Review TypeScript compilation errors
- Verify environment variables are loaded

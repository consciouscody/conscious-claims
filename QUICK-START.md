# Quick Start: Running Your Agent System

## Three Ways to Run

### 1. **TypeScript Agents Only** (Fastest, Direct to Buzz)
```bash
npm install          # One-time setup
npm run build        # Compile TypeScript
npm start            # Launch all 5 agents directly to Buzz
```
✅ SEO Agent → #seo-reports  
✅ Blueprint Agent → #skool  
✅ Warden Agent → #field-ops  
✅ Command Agent → #command-center  
✅ Relay Agent → #relay-logs  

**Result:** Agents post to Buzz channels immediately.

---

### 2. **With Claude Bridge** (Full Integration)
This lets agents access Claude + shared contacts via HTTP.

**Terminal 1:**
```bash
npm run bridge:install    # One-time: install Python deps
npm run bridge            # Start Claude bridge on :9000
```

**Terminal 2:**
```bash
npm start                 # Start TypeScript agents
```

**Result:** 
- Bridge runs on `http://localhost:9000`
- Agents can call Claude: `POST /claude/request`
- Shared contacts available: `GET /contacts/list`
- All agent messages logged: `GET /messages/list`

---

### 3. **Full Stack** (Agents + Bridge + Hermes)
If you have Hermes installed locally:

**Terminal 1:**
```bash
hermes serve              # Start Hermes on :3001
```

**Terminal 2:**
```bash
npm run bridge            # Start Claude bridge (syncs with Hermes)
```

**Terminal 3:**
```bash
npm start                 # Start TypeScript agents
```

**Result:** Complete agent OS with Hermes coordination.

---

## Testing Bridge Endpoints

Once bridge is running:

```bash
# Health check
curl http://localhost:9000/health

# Add a contact
curl -X POST http://localhost:9000/contacts/add \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","company":"Atlas"}'

# Get all contacts
curl http://localhost:9000/contacts/list

# Ask Claude something (with full context)
curl -X POST http://localhost:9000/claude/request \
  -H "Content-Type: application/json" \
  -d '{"agent_name":"SEO Agent","prompt":"Analyze consciousclaims.com"}'
```

---

## Setup Checklist

- [ ] Create `.env` file with `ANTHROPIC_API_KEY=sk-ant-...`
- [ ] Add `BUZZ_URL=wss://consious-command.communities.buzz.xyz`
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Run `npm start` (agents) or `npm run bridge` (bridge)
- [ ] Verify agents appear in Buzz channels
- [ ] Test bridge endpoints if using Claude integration

---

## File Layout

```
├── agents-main.ts           # Orchestrator - starts all agents
├── buzz-connector.ts        # WebSocket wrapper for Buzz
├── seo-agent.ts            # SEO auditing
├── blueprint-agent.ts      # Course building (GNPEC/WIOA)
├── warden-agent.ts         # Field operations tracking
├── command-agent.ts        # Business operations
├── relay-agent.ts          # Zapier middleware coordinator
├── claude-hermes-bridge.py  # Python bridge (Claude + Hermes)
├── dist/                   # Compiled JavaScript (run `npm run build`)
├── .env                    # Environment variables (create this)
└── package.json            # Dependencies & scripts
```

---

## What Agents Do

| Agent | Channel | Job |
|-------|---------|-----|
| SEO | #seo-reports | Hourly audits of consciousclaims.com & energymarshalacademy.com |
| Blueprint | #skool | Builds GNPEC-compliant training curriculum |
| Warden | #field-ops | Logs LOTO closeouts & energization events |
| Command | #command-center | Business ops dashboard - tracks deals & priorities |
| Relay | #relay-logs | Coordinates data between systems via Zapier |

---

## Common Issues

**"Cannot find module"**
- Run `npm install`
- Run `npm run build`

**Agents won't connect to Buzz**
- Check `BUZZ_URL` in `.env` is correct
- Make sure Buzz app is running
- Verify WebSocket isn't blocked by firewall

**Bridge not responding**
- Check Python 3.8+ is installed: `python3 --version`
- Install dependencies: `npm run bridge:install`
- Check port 9000 is free: `lsof -i :9000`

**Hermes errors**
- If not installed, just skip it - agents work without Hermes
- To install: `pipx install hermes-agent`

---

## Full Documentation

See `INTEGRATED-DEPLOYMENT.md` for:
- Complete architecture diagram
- All HTTP endpoints
- Production deployment
- Troubleshooting guide

---

**Ready to go?** Start with Option 1 (`npm start`) to see your agents working now.

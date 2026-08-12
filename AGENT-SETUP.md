# 🤖 Conscious Optimization Agent Network Setup

This guide walks you through setting up the AI Agent Network connecting Buzz, Hermes, and multiple intelligent agents.

---

## 🎯 What You're Building

An **Agent Coordination System** where:
- **SEO Agent** audits your 3 websites hourly
- **Buzz** is the central chat where all agents communicate
- **Hermes** queues tasks from agents
- **You & your dad** supervise agents in real-time
- **Claude** (me) can jump in as an agent anytime

---

## 📋 Prerequisites

Before starting, you should have:

1. ✅ **Buzz workspace created** → `wss://conscious-command.communities.buzz.xyz`
2. ✅ **Hermes desktop app** installed & running on `http://localhost:3001`
3. ✅ **Node.js 18+** installed (`node --version`)
4. ✅ **Railway account** (free at https://railway.app) for cloud deployment
5. ✅ **GitHub access** to push code

---

## 🚀 Quick Start (Local Testing)

### Step 1: Set Up Environment

```bash
# Copy environment template
cp .env.example.seo-agent .env

# Edit .env with your actual values
# Make sure HERMES_URL points to your local Hermes instance
nano .env
```

### Step 2: Install Dependencies

```bash
# Copy package.json for SEO agent
cp seo-agent-package.json seo-agent/package.json

# Install
cd seo-agent
npm install
```

### Step 3: Run Agent Locally

```bash
# Start the SEO agent in development mode
npm run dev
```

**Expected output:**
```
🚀 SEO Agent started
✅ Connected to Buzz
🔍 Starting SEO audit...
  → Checking https://consciousclaims.com
  → Checking https://conscious-optimization.com
  → Checking https://skool-training.com
✅ Posted to Buzz
✅ Created Hermes tasks
```

---

## ☁️ Deploy to Railway (Production)

### Step 1: Push Code to GitHub

```bash
# If not already a repo
git init
git add seo-agent.ts seo-agent-package.json Dockerfile.seo-agent .env.example.seo-agent
git commit -m "Add SEO Agent for Buzz integration"
git push origin main
```

### Step 2: Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select `consciouscody/conscious-claims`
4. Click **"Deploy Now"**

### Step 3: Configure Railway

In Railway dashboard:

1. **Add Environment Variables:**
   - `BUZZ_URL`: `wss://conscious-command.communities.buzz.xyz`
   - `HERMES_URL`: `http://hermes:3001` (internal Railway URL)
   - `NODE_ENV`: `production`

2. **Set Dockerfile:**
   - Go to Settings → Builder
   - Set Dockerfile Path to: `Dockerfile.seo-agent`

3. **Deploy:**
   - Click **"Deploy"**
   - Wait for green ✅ status

### Step 4: Verify in Buzz

Once deployed:
1. Open Buzz
2. Check `#seo-reports` channel
3. You should see: `🤖 SEO Agent Report` messages hourly

---

## 🔗 How It Works

### Data Flow:

```
SEO Agent (Railway)
       ↓
   [Audit websites]
       ↓
   [Post to Buzz WebSocket]
       ↓
   [Create Hermes tasks]
       ↓
   [You see everything in Buzz + Hermes]
```

### Communication Flow:

```
Buzz Message (1hr): "🤖 SEO Agent Report - 3 sites checked"
         ↓
Hermes Task: "SEO Audit: consciousclaims.com - 5 issues found"
         ↓
You: Review findings, accept/reject recommendations
         ↓
Agent waits for next scheduled audit (1hr later)
```

---

## 📝 Configuration Reference

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BUZZ_URL` | `wss://conscious-command.communities.buzz.xyz` | Buzz workspace WebSocket |
| `HERMES_URL` | `http://localhost:3001` | Hermes task manager API |
| `NODE_ENV` | `development` | Run mode (development/production) |
| `AUDIT_INTERVAL` | `3600000` | How often to audit (milliseconds) |
| `WEBSITES_TO_AUDIT` | 3 sites | Comma-separated URLs to check |

### Changing Audit Frequency

To audit **every 30 minutes** instead of hourly:

```bash
# In .env
AUDIT_INTERVAL=1800000
```

---

## 🐛 Troubleshooting

### Agent not connecting to Buzz

**Problem:** "❌ Disconnected from Buzz"

**Solution:**
1. Check Buzz is running and workspace URL is correct
2. Verify network connectivity
3. Check Railway logs: `railway logs`

### Hermes tasks not creating

**Problem:** "Failed to post to Hermes"

**Solution:**
1. Ensure Hermes is running: `http://localhost:3001`
2. Check Hermes API is accepting POST requests
3. Verify `HERMES_URL` in environment

### Agent crashes on startup

**Problem:** Immediate exit

**Solution:**
```bash
# Check logs
npm run dev  # Should show error in console
```

---

## 🎮 Controlling the Agent

### Trigger Manual Audit

Send a message in Buzz to `#seo-reports`:
```
@seo-agent audit now
```

The agent listens for this and runs immediately.

### View Agent Logs

**Local:** 
```bash
npm run dev  # Shows real-time logs
```

**Railway:**
```bash
railway logs seo-agent
```

---

## 🔄 Next: Add More Agents

Once SEO Agent is working, we'll add:

1. **Content Agent** (generates page copy)
2. **Marketing Agent** (Clay + Apollo integration)
3. **Analytics Agent** (tracks metrics)
4. **Your Dad's Agent** (school-focused tasks)

Each follows the same pattern:
- Build service
- Wire to Buzz
- Deploy to Railway
- Agents communicate in shared channels

---

## 📞 Support

If something breaks:
1. Check Railway logs: `railway logs`
2. Verify Buzz connection: Check `#seo-reports` for recent messages
3. Check Hermes API: `curl http://localhost:3001/api/health`
4. Restart agent: In Railway dashboard, click **"Restart"**

---

## ✅ Deployment Checklist

- [ ] Buzz workspace created
- [ ] Hermes running locally
- [ ] Node.js installed
- [ ] .env file configured
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables set in Railway
- [ ] Dockerfile path configured
- [ ] Deployment successful (green ✅)
- [ ] Messages appearing in Buzz hourly
- [ ] Tasks appearing in Hermes

Once all checked, you're live! 🚀

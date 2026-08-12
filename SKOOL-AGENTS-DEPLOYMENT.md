# 🎓 SKOOL Agent System - Deployment Guide

Complete setup for Blueprint, Warden, Command, and Relay agents serving Cody and John McCain's Data Center Energy Control training program.

---

## 📋 What You're Deploying

**4 Coordinated Agents:**

| Agent | Role | Lives | Serves |
|-------|------|-------|--------|
| **BLUEPRINT** | Course builder (GNPEC + WIOA spec) | Skool admin | Cody & John |
| **WARDEN** | Field operations (LOTO tracking, energization) | ElevenLabs voice + chat | John McCain |
| **COMMAND** | Business operations (unified dashboard) | Skool or direct chat | Cody McCain |
| **RELAY** | Inter-agent coordinator | Zapier (middleware) | All agents |

**5 Zapier Workflows:**
1. LOTO Close-out → Google Sheets
2. Energization Event → Smartsheet
3. Module Complete → Skool
4. Urgent Flag → SMS to Cody
5. Daily Summary → Command

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Test Each Agent Locally

```bash
# Test Blueprint (course builder)
npm run test:blueprint

# Test Warden (field ops)
npm run test:warden

# Test Command (business ops)
npm run test:command

# Test Relay (coordinator)
npm run test:relay
```

**Expected output:** Each agent logs sample operations and confirms functionality.

### Step 3: Build for Production

```bash
npm run build
```

---

## ⚙️ Zapier Configuration

### Zap 1: LOTO Close-out to Google Sheets

**Trigger:** Webhook (Warden submits LOTO close-out)

**Action:** Add row to Google Sheets

**Mapping:**
```
Sheet: LOTO Master Log
Columns:
- Equipment ID → lotoData.equipmentId
- Location → lotoData.location
- Building → lotoData.building
- Closed By → lotoData.closedBy
- Timestamp → lotoData.timestamp
- Status → lotoData.status
- Verified → lotoData.verified
```

### Zap 2: Energization Event to Smartsheet

**Trigger:** Webhook (Warden submits energization)

**Action:** Add row to Smartsheet

**Mapping:**
```
Sheet: Energization Tracker
Columns:
- Equipment Name → energizationData.equipmentName
- Location → energizationData.location
- Voltage → energizationData.voltage
- Time → energizationData.time
- Authorized By → energizationData.authorizedBy
- Anomalies → energizationData.anomalies
```

### Zap 3: Blueprint Module Complete to Skool

**Trigger:** Webhook (Blueprint marks module complete)

**Action:** Create Skool module post

**Mapping:**
```
Module ID → moduleData.moduleId
Module Name → moduleData.moduleName
Content → moduleData.content
Clock Hours → moduleData.clockHours
```

### Zap 4: Urgent Alert to SMS

**Trigger:** Webhook (Any agent flags urgent)

**Action:** Send SMS via Twilio

**Message Template:**
```
🚨 {agent}: {issue}
```

**Phone:** 470-740-5774 (Cody's number)

### Zap 5: Daily Warden Summary to Command

**Trigger:** Time-based (6pm ET, weekdays)

**Action:** Send message to Command agent

**Content:** Pull Warden's daily log and format as summary

---

## 🔧 Configuration Files

### .env

```bash
# Anthropic API (for Blueprint, Command)
ANTHROPIC_API_KEY=your_key_here

# Twilio (for Warden voice + SMS)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=470-740-5774

# Google Sheets (for LOTO logging)
GOOGLE_SHEETS_API_KEY=your_key
LOTO_SHEET_ID=your_sheet_id

# Smartsheet (for energization tracking)
SMARTSHEET_API_TOKEN=your_token
ENERGIZATION_SHEET_ID=your_sheet_id

# Skool API (for module posting)
SKOOL_API_KEY=your_key
SKOOL_COMMUNITY_ID=your_community_id

# Zapier Webhooks
ZAPIER_LOTO_WEBHOOK=https://hooks.zapier.com/...
ZAPIER_ENERGIZATION_WEBHOOK=https://hooks.zapier.com/...
ZAPIER_MODULE_WEBHOOK=https://hooks.zapier.com/...
ZAPIER_ALERT_WEBHOOK=https://hooks.zapier.com/...
```

---

## 📊 Integration Points

### Blueprint → Skool

Blueprint completes a module → Relay posts to Skool automatically via Zap 3.

### Warden → Google Sheets + Smartsheet

- LOTO close-outs → Google Sheets (Zap 1)
- Energization events → Smartsheet (Zap 2)

### Warden → Cody (Urgent)

Warden flags unverified LOTOs → Relay sends SMS via Zap 4.

### Warden → Command (Daily)

End of shift (6pm) → Relay sends daily summary to Command via Zap 5.

---

## 🎯 Deployment to Buzz

Once tested locally, deploy to Buzz:

### BLUEPRINT Agent in Buzz

1. Create channel: `#skool`
2. Deploy Blueprint with system prompt
3. Channel receives: Module completion status, GNPEC validation checks

### WARDEN Agent in Buzz

1. Create channel: `#field-ops`
2. Deploy Warden with ElevenLabs voice integration
3. Channel receives: LOTO logs, energization events, daily summaries

### COMMAND Agent in Buzz

1. Create channel: `#command-center`
2. Deploy Command with business line context
3. Channel receives: Next steps, deal status, urgent alerts

### RELAY in Background

1. Not visible in Buzz (runs in Zapier)
2. Coordinates handoffs between agents
3. Logs all transfers for audit trail

---

## ✅ Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] All 4 agents tested locally
- [ ] .env configured with all API keys
- [ ] Google Sheets LOTO master log created
- [ ] Smartsheet energization tracker shared with John
- [ ] Skool community configured with 10 module placeholders
- [ ] All 5 Zapier Zaps created and tested
- [ ] Twilio SMS confirmed working
- [ ] Buzz channels created (#skool, #field-ops, #command-center)
- [ ] Agents deployed to Buzz
- [ ] Test run: Log sample LOTO, verify it appears in Sheets + Buzz

---

## 🔍 Verification

### Test Warden LOTO Logging

```bash
npm run test:warden
# Should output: ✓ LOTO logged, ✓ Energization logged, daily summary
# Check: Google Sheets has new rows, Zapier log shows success
```

### Test Blueprint Module

```bash
npm run test:blueprint
# Should output: Module status, GNPEC validation checks
# Check: Skool shows new module draft
```

### Test Command Status

```bash
npm run test:command
# Should output: Business line priorities, next action, urgent deals
# Check: All deal statuses current
```

### Test Relay Handoffs

```bash
npm run test:relay
# Should output: All 5 Zaps executing, handoff log
# Check: No failed handoffs logged
```

---

## 🚨 Troubleshooting

### Sheets not updating

1. Check Zapier webhook connected to Relay.relayLOTOToSheets
2. Verify Google Sheets API key in .env
3. Check Zap 1 logs in Zapier dashboard

### Smartsheet not updating

1. Verify Smartsheet shared access with John
2. Check API token in .env
3. Verify Zap 2 webhook configuration

### SMS not sending

1. Check Twilio credentials in .env
2. Verify phone number 470-740-5774 is correct
3. Check Zap 4 in Zapier dashboard

### Agents not responding in Buzz

1. Verify agents deployed to correct channels
2. Check system prompts loaded correctly
3. Verify Anthropic API key active

---

## 📈 Next Steps

1. **Deploy to Railway** (for always-on operation)
2. **Add to Hermes** (for autonomous background tasks)
3. **Integrate with Obsidian vault** (all decisions logged)
4. **Create shared dashboard** (see all agent activity live)

---

## 📞 Support

- **Warden field issues:** Contact John McCain
- **Course building:** Contact Cody McCain
- **Business operations:** Contact Cody McCain
- **Technical issues:** Check .env config and Zapier logs

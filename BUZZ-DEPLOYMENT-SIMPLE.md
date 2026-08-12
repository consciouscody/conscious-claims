# 🔌 Get Agents into Buzz - 3 Simple Steps

Don't overthink this. Just follow 3 steps.

---

## Step 1: Copy the .env file

```bash
cp .env.skool-agents .env
```

That's it. The keys are already in there. The agents will use them.

---

## Step 2: Build the agents

```bash
npm install
npm run build
```

Done. All agents compiled and ready.

---

## Step 3: Start them

**Option A: Run locally (on your Mac)**
```bash
npm start
```

Agents will connect to Buzz and start posting.

**Option B: Deploy to Railway (always-on cloud)**

1. Go to Railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select `consciouscody/conscious-claims`
4. Set environment variables from `.env`
5. Click Deploy

Agents will be live 24/7 in Buzz.

---

## ✅ That's it

Once agents start, they appear in Buzz:
- `#skool` → Blueprint posts course updates
- `#field-ops` → Warden posts LOTO logs
- `#command-center` → Command posts your next steps

You'll see them posting in real-time.

---

## 🔍 Verify It Works

Open Buzz. You should see:

```
[BLUEPRINT] Module 1 ready for GNPEC validation
[WARDEN] LOTO logged: BR-001 at Building A
[COMMAND] Next action: Follow up on Roof U.S. deal
```

If you see messages, the agents are live. Done.

---

## Troubleshooting (If Nothing Happens)

1. Check internet connection
2. Run `npm run dev` locally to see errors
3. Verify `.env` file exists with keys
4. Check Buzz workspace is online

That's all.

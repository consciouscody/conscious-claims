# Conscious Claims

This is the saved code for Cody McCain's claims app. The live Manus project is gone. You can run this copy on your own computer.

The main tool looks at a photo of an asphalt shingle and tries to name the product. It also says if that product is discontinued. The library covers 192 products from 9 makers. It was built from old eBay listings.

Discontinued plus storm damage is a strong full-roof fight. Carriers still want proof. A named match is not an approval.

## What you need

- Node.js 22
- pnpm (`npm install -g pnpm` if you do not have it)
- An OpenAI API key (or another key that works with the OpenAI chat API)

Jobs, billing, and the dashboard need a MySQL database. You can skip that if you only want the shingle photo tool.

## Run it

```bash
cp .env.example .env
```

Open `.env` and paste your key on the `OPENAI_API_KEY=` line.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You are signed in as a local user. No Manus login.

1. Click **Shingle Identifier** in the left menu.
2. Choose a photo, or take one on your phone.
3. Wait for a name, a current/discontinued flag, and a short note.

If you skip the API key, the site still starts. Photo identify will tell you to add the key.

## Other commands

```bash
pnpm test
pnpm build
pnpm start
```

`pnpm start` needs a build first. It also needs `LOCAL_DEV_AUTH=1` in `.env` if you want the local session in production mode.

To use the jobs dashboard, set `DATABASE_URL` to a MySQL URL and run `pnpm db:push`.

## What this restore changed

The old app only talked to Manus for login, file storage, and the vision model. This copy:

- Signs you in locally when Manus OAuth is not set
- Saves photos in an `uploads/` folder on disk
- Calls an OpenAI-compatible vision model instead of Manus Forge
- Drops the Manus Vite plugin so `pnpm dev` starts on a normal machine

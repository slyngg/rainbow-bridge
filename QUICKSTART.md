# Rainbow Bridge Quickstart Guide

Complete setup guide for connecting Slack and Microsoft Teams with AI-powered intelligence.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Validate the Intelligence Layer](#phase-1-validate-the-intelligence-layer)
3. [Phase 2: Authentication Setup (Google OAuth)](#phase-2-authentication-setup-google-oauth)
4. [Phase 3: Slack Configuration](#phase-3-slack-configuration)
5. [Phase 4: Microsoft Teams / Azure AD Configuration](#phase-4-microsoft-teams--azure-ad-configuration)
6. [Phase 5: Environment Variables](#phase-5-environment-variables)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Docker installed and running
- [ ] PostgreSQL with pgvector extension (use provided `docker-compose.yml`)
- [ ] OpenAI API key for embeddings
- [ ] Node.js 18+ installed
- [ ] Admin access to your Slack workspace
- [ ] Admin access to your Microsoft 365 tenant (for Teams)

---

## Phase 1: Validate the Intelligence Layer

Before configuring real Slack/Teams credentials, verify your RAG pipeline works.

### 1.1 Start the Development Environment

```bash
# Start PostgreSQL with pgvector
docker-compose up -d

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start dev server
npm run dev
```

### 1.2 Create a Test Bridge

Go to `http://localhost:3000/dashboard` and create a bridge with dummy credentials. Note the **Bridge ID** (UUID) from the URL or database.

### 1.3 Mock an Ingestion Event

Test the webhook by simulating a Matterbridge message:

```bash
# Replace BRIDGE_ID with your actual bridge UUID
# Replace API_TOKEN with the bridge's apiToken from the database

curl -X POST http://localhost:3000/api/webhooks/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BRIDGE_API_TOKEN" \
  -d '{
    "text": "The production deployment is scheduled for Friday at 5pm. Please freeze code by noon.",
    "username": "Cayden (CTO)",
    "userid": "U12345",
    "gateway": "bridge-YOUR_BRIDGE_ID-slack",
    "channel": "project-alpha",
    "account": "slack.agency",
    "event": "msg",
    "protocol": "slack"
  }'
```

**Expected Response:**
```json
{"success": true, "message": "Message ingested and embedded"}
```

### 1.4 Test RAG Retrieval

Go to your bridge's chat interface at `http://localhost:3000/dashboard/bridge/[BRIDGE_ID]` and ask:

> "When is the production deployment?"

**Expected Result:** The AI should return "Friday at 5pm" and cite the mock message as context.

✅ **If this works, your vector database and OpenAI integration are solid.**

---

## Phase 2: Authentication Setup (Google OAuth)

Rainbow Bridge uses NextAuth.js for authentication. Users can sign up/sign in with email/password or Google OAuth.

### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**

### 2.2 Configure OAuth Consent Screen

If prompted, configure the consent screen first:

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (or Internal for Google Workspace)
3. Fill in required fields:
   - **App name:** `Rainbow Bridge`
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Click **Save and Continue**
5. Skip Scopes (defaults are sufficient)
6. Add test users if in testing mode
7. Click **Save and Continue**

### 2.3 Create OAuth Client ID

1. Go back to **Credentials** → **Create Credentials** → **OAuth client ID**
2. Select **Web application**
3. Configure:
   - **Name:** `Rainbow Bridge Web`
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-domain.com/api/auth/callback/google` (production)
4. Click **Create**
5. Copy the **Client ID** and **Client Secret**

### 2.4 Generate Auth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output for your `AUTH_SECRET` environment variable.

### 2.5 Configure Environment Variables

Add to your `.env.local`:

```env
# NextAuth
AUTH_SECRET="your-generated-secret-from-step-2.4"
AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

✅ **Google OAuth is now configured. Users can sign up and sign in with their Google accounts.**

---

## Phase 3: Slack Configuration

### 3.1 Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name it `Rainbow Bridge` and select your workspace
4. Click **Create App**

### 3.2 Configure Bot Token Scopes

Navigate to **OAuth & Permissions** → **Scopes** → **Bot Token Scopes** and add:

| Scope | Purpose |
|-------|---------|
| `channels:history` | Read messages in public channels |
| `channels:read` | View basic channel info |
| `chat:write` | Send messages as the bot |
| `users:read` | Get user info for attribution |
| `groups:history` | Read messages in private channels (if needed) |
| `groups:read` | View private channel info (if needed) |

### 3.3 Install to Workspace

1. Go to **OAuth & Permissions**
2. Click **Install to Workspace**
3. Authorize the permissions
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### 3.4 Get Channel ID

1. Open Slack in your browser
2. Navigate to the channel you want to bridge
3. The URL will be: `https://app.slack.com/client/TXXXXXXXX/CXXXXXXXXX`
4. The **Channel ID** is the `CXXXXXXXXX` part

### 3.5 Configure in Rainbow Bridge

In your bridge configuration:
- **Slack Token:** `xoxb-your-token-here`
- **Slack Channel:** `CXXXXXXXXX` (the channel ID)
- **Slack Team Name:** Your workspace name (used for display)

---

## Phase 4: Microsoft Teams / Azure AD Configuration

This is the most complex part. Follow each step carefully.

### 4.1 Register an Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name:** `Rainbow Bridge`
   - **Supported account types:** Accounts in this organizational directory only
   - **Redirect URI:** Leave blank for now
5. Click **Register**

### 4.2 Note Your IDs

After registration, note these values from the **Overview** page:

| Field | Where to Find |
|-------|---------------|
| **Application (client) ID** | Overview page, top section |
| **Directory (tenant) ID** | Overview page, top section |

### 4.3 Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: `Rainbow Bridge Production`
4. Set expiration (recommend: 24 months)
5. Click **Add**
6. **IMMEDIATELY** copy the **Value** (you won't see it again!)

### 4.4 Configure API Permissions (The "Golden" Permissions)

Navigate to **API permissions** → **Add a permission** → **Microsoft Graph** → **Application permissions**

Add these permissions:

| Permission | Type | Purpose |
|------------|------|---------|
| `ChannelMessage.Read.All` | Application | Read messages in channels |
| `ChannelMessage.Send` | Application | Send messages to channels |
| `User.Read.All` | Application | Read user profiles for attribution |
| `Team.ReadBasic.All` | Application | Read team info |
| `Channel.ReadBasic.All` | Application | Read channel info |

### 4.5 Grant Admin Consent

1. Still on **API permissions** page
2. Click **Grant admin consent for [Your Organization]**
3. Confirm by clicking **Yes**

⚠️ **You must be a Global Admin or have permission to grant admin consent.**

### 4.6 Get Team and Channel IDs

**Option A: Using Graph Explorer**

1. Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in with your Microsoft account
3. Run: `GET https://graph.microsoft.com/v1.0/me/joinedTeams`
4. Find your team and note the `id`
5. Run: `GET https://graph.microsoft.com/v1.0/teams/{team-id}/channels`
6. Find your channel and note the `id`

**Option B: Using Teams Desktop**

1. Right-click on the channel in Teams
2. Click **Get link to channel**
3. The URL contains encoded IDs - decode them

### 4.7 Configure in Rainbow Bridge

In your bridge configuration:
- **Teams App ID:** Application (client) ID from Azure
- **Teams App Password:** Client Secret value
- **Teams Tenant ID:** Directory (tenant) ID from Azure
- **Teams Team ID:** The team ID from Graph Explorer
- **Teams Channel:** The channel ID from Graph Explorer

---

## Phase 5: Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rainbow?schema=public"

# NextAuth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# OpenAI
OPENAI_API_KEY="sk-your-openai-key"

# Stripe (for subscriptions)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
STRIPE_FREELANCER_PRICE_ID="price_xxxxx"
STRIPE_AGENCY_PRICE_ID="price_xxxxx"

# App URL (for webhooks and redirects)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Setting Up Stripe Webhook (Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Webhooks
2. Click **Add endpoint**
3. **Endpoint URL:** `https://your-domain.com/api/webhooks/stripe`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** to `STRIPE_WEBHOOK_SECRET`

---

## Troubleshooting

### "Invalid token or bridge not found"

- Verify the `Authorization: Bearer` header contains the correct `apiToken` from your bridge
- Check that `intelligenceEnabled` is `true` on the bridge

### "Invalid gateway format"

- The gateway must match pattern `bridge-{uuid}`
- Ensure you're using the correct bridge ID in the gateway name

### Teams messages not flowing

1. Verify API permissions have admin consent granted
2. Check that the App ID matches between Azure and your config
3. Ensure the channel ID is correct (use Graph Explorer to verify)

### Slack messages not flowing

1. Verify the bot is invited to the channel (`/invite @Rainbow Bridge`)
2. Check that all required scopes are added
3. Reinstall the app after adding new scopes

### Embeddings not generating

1. Verify `OPENAI_API_KEY` is set correctly
2. Check OpenAI API usage limits
3. Look for errors in the console output

---

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Set up Stripe webhook endpoint
- [ ] Configure CORS for your domain
- [ ] Set up SSL/TLS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Run `npx prisma migrate deploy`

---

## Support

For issues or questions:
- Open an issue on the repository
- Contact: sales@mogul.io

---

*Rainbow Bridge by Mogul - AI-Powered Sovereign Communication Bridge*

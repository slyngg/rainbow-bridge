# Rainbow Bridge - AI-Powered Sovereign Bridge

An Intelligence Platform that connects Slack and Microsoft Teams channels via isolated Docker containers, while building institutional memory with RAG-powered search and analysis.

## Features

- **Seamless Bridge**: Connect Slack ↔ Teams channels with matterbridge
- **Institutional Memory**: Every message is vectorized and stored in PostgreSQL with pgvector
- **RAG-Powered Chat**: Ask questions about your project history across both platforms
- **Sovereign Control**: Your data stays on your infrastructure in isolated containers

## Architecture

```
Slack ─────┐                    ┌───── Teams
           │                    │
           ▼                    ▼
      ┌─────────────────────────────┐
      │     Matterbridge (Docker)   │
      │   ┌───────────────────┐     │
      │   │ API Intelligence  │─────┼──► POST /api/webhooks/ingest
      │   │     Layer         │     │
      │   └───────────────────┘     │
      └─────────────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  Next.js App    │
                          │  ┌───────────┐  │
                          │  │ Embedding │  │
                          │  │  OpenAI   │  │
                          │  └───────────┘  │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   PostgreSQL    │
                          │   + pgvector    │
                          └─────────────────┘
```

## Quick Start

### 1. Start PostgreSQL with pgvector

```bash
docker-compose up -d
```

### 2. Configure Environment

Copy `.env` and add your credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rainbow?schema=public"
OPENAI_API_KEY="sk-your-openai-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Creating a Bridge

1. Go to Dashboard → Create Bridge
2. Enter Slack credentials (Bot Token, Channel)
3. Enter Teams credentials (App ID, Secret, Tenant ID, Team ID, Channel)
4. Click Deploy to start the matterbridge container

## Docker Networking Note

The matterbridge container needs to POST messages back to the Next.js app. The configuration uses:

```
extra_hosts: ['host.docker.internal:host-gateway']
```

This allows the container to reach `http://host.docker.internal:3000/api/webhooks/ingest`

## Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Vercel AI SDK
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL with pgvector extension (via Prisma)
- **LLM/AI**: OpenAI GPT-4o, text-embedding-3-small
- **Orchestration**: Docker (dockerode)
- **Bridge Engine**: 42wim/matterbridge

## API Endpoints

- `POST /api/webhooks/ingest` - Receives messages from matterbridge containers
- `POST /api/chat` - Streaming RAG chat endpoint for the intelligence UI

## License

MIT

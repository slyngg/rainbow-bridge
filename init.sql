-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index function for vector similarity search
-- This will be used after Prisma creates the tables

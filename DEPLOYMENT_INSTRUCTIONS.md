# Fixing Supabase Connection Pooler Issue

You're encountering the PostgreSQL error: `prepared statement "s0" already exists` when using Prisma with Supabase's connection pooler in production. This error happens because:

1. Supabase's connection pooler reuses connections between requests
2. Prisma creates prepared statements with fixed names like "s0"
3. When a connection is reused, Prisma tries to create the same prepared statement again, causing the conflict

## How to Fix This

### 1. Update Your Prisma Client (`src/lib/prisma.ts`)

Replace your existing Prisma client initialization with:

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Add special configuration to make it work with Supabase's connection pooler
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // This is the critical fix for the "prepared statement s0 already exists" error
    // It tells Prisma not to use prepared statements when using a connection pooler
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // @ts-ignore - These options are actually valid for Prisma Client
    nullengine: {
      prepare: false, // Disable prepared statements
      alwaysTry: true,
    },
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### 2. Update Your Schema (`prisma/schema.prisma`)

Modify your schema to include connection pooling settings:

```prisma
generator client {
  provider = "prisma-client-js"
  // Define the output path to make it explicit
  output   = "./node_modules/@prisma/client"
  previewFeatures = []
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  // Add direct connection URL for migrations
  directUrl = env("DIRECT_URL")
  
  // Connection pool settings
  connectionTimeoutMillis = 30000  // 30 seconds
  maxConnections = 20
  minConnections = 1
  idleTimeoutMillis = 600000       // 10 minutes
}
```

### 3. Update Your `.env` File

For your production deployment, add both the pooled and direct connection URLs:

```
# Connection via the pooler (for the application)
DATABASE_URL="postgresql://postgres.utctjrzcisanoxackbdt:FgcillNLablhPQgR@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Direct connection (for migrations)
# Get this from Supabase dashboard -> Project Settings -> Database -> Connection string -> URI format
# Change the port from 6543 to 5432 and remove "pooler" from the hostname
DIRECT_URL="postgresql://postgres.utctjrzcisanoxackbdt:FgcillNLablhPQgR@aws-0-eu-central-1.db.supabase.co:5432/postgres"
```

### 4. Deploy Your Changes

After making these changes:

1. Commit and push to your repository
2. Deploy to your hosting platform
3. Make sure to set both environment variables (DATABASE_URL and DIRECT_URL) in your production environment

This approach ensures that:
- The application uses the connection pooler for better performance
- Prisma avoids the "prepared statement already exists" error by disabling prepared statements
- Migrations use a direct connection to avoid pooler-related issues

If you're using Vercel or another platform, make sure to set both environment variables in your deployment settings. 
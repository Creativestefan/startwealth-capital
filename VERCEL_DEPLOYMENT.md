# Vercel Deployment Guide for StratWealth Capital

This guide will help you deploy your Next.js application to Vercel with a Supabase PostgreSQL database.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your GitHub/GitLab/Bitbucket repository connected to Vercel
- Your Supabase database already set up

## Step 1: Environment Variables

Add the following environment variables in the Vercel dashboard:

```
# Database
DATABASE_URL=postgresql://postgres:gybtag-5qemwe-kujViq@db.utctjrzcisanoxackbdt.supabase.co:5432/postgres

# NextAuth (update with your production URL)
NEXTAUTH_URL=https://localhost:3000
NEXTAUTH_SECRET=AyNMFch6Afx+tMnnv0Zn6wXfR+ksJAV4lIGB+eU6IsM=

# SMTP Configuration
SMTP_HOST=webhosting3004.is.cc
SMTP_PORT=465
SMTP_USER=stefan@buildpack.app
SMTP_PASSWORD=O*Ep3[ut*({}
SMTP_FROM=stefan@buildpack.app

# Notification Email
NOTIFICATION_EMAIL_FROM=noreply@stratwealth-capital.com
NOTIFICATION_SMTP_HOST=
NOTIFICATION_SMTP_PORT=465
NOTIFICATION_SMTP_USER=noreply@stratwealth-capital.com
NOTIFICATION_SMTP_PASSWORD=

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=5183d8de58e27bfbcafd7969497188ab
CLOUDFLARE_R2_SECRET_ACCESS_KEY=9ea81a9df4937a897a3bb0dac2c8d1ba35f161a69e2f551a42050df7b2ca2a0a
CLOUDFLARE_R2_ENDPOINT=https://3c3049b93386c9d1425392ee596bc359.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=startwealth

# VAPID keys for push notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BHZuEBG5B0fPG9l9WAFOoulYiGvfSrkVWvfqVMAKlFNlKhfwBSnIWGxid9kZc5kg-XciEP68PrTccdLg35Xxkwc
```

## Step 2: Deployment Configuration

Your project is now configured with:

1. **Updated package.json scripts**:
   - `build`: Includes Prisma generate and migrate deploy commands
   - `postinstall`: Ensures Prisma client is generated

2. **vercel.json configuration**:
   - Sets the correct build and install commands
   - Configures the framework as Next.js
   - Sets the output directory to .next
   - Specifies the CDG1 region (Paris) for deployment

## Step 3: Deploy Your Application

### Option 1: Deploy via Git

1. Commit and push your changes to your repository:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. In the Vercel dashboard, import your repository and follow the setup wizard.

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your application:
   ```bash
   vercel --prod
   ```

## Step 4: Post-Deployment

1. **Verify Database Connection**:
   - Check that your application can connect to the Supabase database
   - Verify that all migrations have been applied

2. **Test Authentication**:
   - Try logging in and registering
   - Test password reset functionality

3. **Test File Uploads**:
   - Verify that Cloudflare R2 integration works for KYC document uploads

4. **Set Up a Custom Domain** (optional):
   - Configure your custom domain in the Vercel dashboard

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify your DATABASE_URL is correct in Vercel environment variables
2. Check if your IP is allowed in Supabase's connection policies
3. Try enabling connection pooling in Supabase

### Prisma Migration Issues

If migrations fail during deployment:

1. Run migrations manually:
   ```bash
   npx prisma migrate deploy
   ```

2. Check migration logs in Vercel build output

### NextAuth Issues

If authentication doesn't work:

1. Ensure NEXTAUTH_URL is set to your actual production URL
2. Verify NEXTAUTH_SECRET is properly set

## Monitoring and Maintenance

1. **Set Up Vercel Analytics** to monitor performance
2. **Configure Alerts** for deployment failures
3. **Set Up Regular Database Backups** in Supabase

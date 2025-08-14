# Deployment Guide

## GitHub Secrets Configuration

To enable CI/CD deployment, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **DATABASE_URL** - PostgreSQL database connection string

   ```
   postgresql://username:password@host:port/database
   ```

2. **REPLIT_TOKEN** - Your Replit API token
   - Get it from: https://replit.com/account
   - Account → API Token

3. **REPLIT_STAGING_URL** - URL of your Replit staging app

   ```
   https://wz-tournament-staging.replit.app
   ```

4. **REPLIT_PRODUCTION_URL** - URL of your Replit production app

   ```
   https://wz-tournament.replit.app
   ```

5. **TELEGRAM_BOT_TOKEN** - Bot token for deployment notifications
   - Create bot via @BotFather on Telegram

6. **TELEGRAM_CHAT_ID** - Chat ID for deployment notifications
   - Get your chat ID from @userinfobot

### How to Add Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value

### Replit Setup

1. Create two Replit projects:
   - `wz-tournament-staging` (for develop branch)
   - `wz-tournament` (for main branch)

2. Connect your GitHub repository to both Replit projects:
   - Go to your Replit project
   - Click "Connect to GitHub"
   - Select your repository

3. Set environment variables in Replit:
   - Go to your Replit project
   - Click on "Secrets" tab
   - Add the following secrets:
     ```
     NODE_ENV=production
     DATABASE_URL=your-database-url
     SESSION_SECRET=your-secret-key
     TELEGRAM_BOT_TOKEN=your-bot-token
     ADMIN_TELEGRAM_ID=your-telegram-id
     TELEGRAM_WEBHOOK_URL=your-webhook-url
     ```

4. Configure auto-deployment:
   - In Replit project settings
   - Enable "Auto-deploy from GitHub"
   - Set branch to `develop` for staging, `main` for production

### Deployment Flow

- **Staging**: Automatic deployment when pushing to `develop` branch
- **Production**: Automatic deployment when pushing to `main` branch
- **Database migrations**: Automatic on production deployments

### Manual Deployment

```bash
# Deploy to staging
git push origin develop

# Deploy to production
git checkout main
git merge develop
git push origin main
```

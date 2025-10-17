# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository (GitHub, GitLab, or Bitbucket)

## Project Structure
This project uses a serverless architecture optimized for Vercel:
- `/api` - Contains serverless functions for backend API routes
- `/client` - Vite React frontend application
- `/server` - Original Express server (used for local development)
- `/shared` - Shared types and schemas

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `client/dist` (auto-detected)

4. **Environment Variables** (if needed)
   - Add `DATABASE_URL` if using PostgreSQL
   - Add any other API keys or secrets
   - Go to Project Settings → Environment Variables

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Deploy to preview
   vercel

   # Deploy to production
   vercel --prod
   ```

## How It Works

### Frontend
- Vite builds the React app to `client/dist`
- Vercel serves these static files
- All routes are handled by the React Router (Wouter)

### Backend API
- All API routes are in `/api/index.js`
- This file is treated as a serverless function
- Routes starting with `/api/*` are proxied to this function
- Data is stored in memory using the `MemStorage` class

### Routing
The `vercel.json` file configures routing:
- `/api/*` → Serverless function
- All other routes → React app (SPA)

## Important Notes

1. **In-Memory Storage**
   - Current setup uses in-memory storage
   - Data will be lost on each deployment/restart
   - For production, connect to a database (PostgreSQL recommended)

2. **Environment Variables**
   - Set in Vercel Dashboard under Project Settings
   - Prefix frontend variables with `VITE_`
   - Example: `VITE_API_URL` for frontend, `DATABASE_URL` for backend

3. **API Routes**
   - All API endpoints must start with `/api/`
   - Defined in `/api/index.js`

4. **Build Dependencies**
   - Vite, TypeScript, and Tailwind are in `dependencies` (not devDependencies)
   - This is required for Vercel to build correctly

## Local Development

For local development, continue using:
```bash
npm run dev
```

This runs the full Express server with Vite middleware.

## Troubleshooting

### Build Fails
- Ensure all build tools are in `dependencies`, not `devDependencies`
- Check build logs in Vercel dashboard

### API Routes Don't Work
- Verify routes start with `/api/`
- Check `vercel.json` configuration
- Review function logs in Vercel dashboard

### 404 on Page Refresh
- Ensure `vercel.json` has proper rewrites configured
- The current config handles SPA routing automatically

### Environment Variables Not Working
- Frontend: Must use `VITE_` prefix
- Backend: Set directly in Vercel dashboard
- Redeploy after changing environment variables

## Production Recommendations

1. **Database**: Connect to PostgreSQL (Vercel Postgres, Neon, or Supabase)
2. **Authentication**: Implement proper auth (JWT, OAuth)
3. **Rate Limiting**: Add rate limiting to API routes
4. **Error Tracking**: Integrate Sentry or similar
5. **Analytics**: Add Vercel Analytics or Google Analytics

## Support

For Vercel-specific issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)

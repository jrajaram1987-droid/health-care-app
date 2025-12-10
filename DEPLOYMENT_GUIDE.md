# 🚀 Complete Deployment Guide

This guide will help you deploy your Healthcare App to the internet.

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deploy to Vercel (Recommended)](#deploy-to-vercel-recommended)
3. [Deploy to Other Platforms](#deploy-to-other-platforms)
4. [Setting Up Supabase (Production Database)](#setting-up-supabase-production-database)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Your app runs locally (`npm run dev`)
- [ ] All features work (login, signup, dashboards)
- [ ] No console errors
- [ ] Code is committed to Git
- [ ] You have a GitHub account

---

## 🌐 Deploy to Vercel (Recommended)

Vercel is the easiest and fastest way to deploy Next.js apps.

### Step 1: Prepare Your Code

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com
   - Click "New repository"
   - Name it: `healthcare-app`
   - Don't initialize with README
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/healthcare-app.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Sign Up/Login**:
   - Go to https://vercel.com
   - Sign up with GitHub (recommended)

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select `healthcare-app`

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Environment Variables** (if using Supabase):
   - Click "Environment Variables"
   - Add:
     - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
     - `BACKEND_MODE` = `mock` (or `supabase` if using Supabase)
     - `JWT_SECRET` = (generate a random string)
     - If using Supabase, add Supabase keys

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live!

### Step 3: Access Your App

- Vercel will give you a URL like: `https://healthcare-app.vercel.app`
- Your app is now live on the internet! 🎉

---

## 🏗️ Deploy to Other Platforms

### Netlify

1. Push code to GitHub
2. Go to https://netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Deploy!

### Railway

1. Push code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Railway auto-detects Next.js
6. Add environment variables
7. Deploy!

### Render

1. Push code to GitHub
2. Go to https://render.com
3. Click "New" → "Web Service"
4. Connect GitHub repository
5. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Deploy!

---

## 🗄️ Setting Up Supabase (Production Database)

For production, you'll want a real database instead of the mock database.

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up/Login
3. Click "New Project"
4. Fill in:
   - **Name**: healthcare-app
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### Step 2: Set Up Database

1. In Supabase dashboard, go to "SQL Editor"
2. Copy contents of `scripts/create-tables.sql`
3. Paste and click "Run"
4. Copy contents of `scripts/enable-rls.sql`
5. Paste and click "Run"

### Step 3: Get API Keys

1. Go to "Settings" → "API"
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 4: Update Code

1. Update `lib/supabase/client.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   
   export function createClient() {
     return createClient(supabaseUrl, supabaseAnonKey)
   }
   ```

2. Update `lib/supabase/server.ts` similarly

3. Update API routes to use Supabase instead of mockDb

### Step 5: Add Environment Variables

Add to Vercel/your platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BACKEND_MODE=supabase`

---

## 🔐 Environment Variables

### For Development (.env.local)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_MODE=mock
JWT_SECRET=dev-secret-key
```

### For Production (Vercel/Platform)

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
BACKEND_MODE=supabase
JWT_SECRET=your-production-secret-key-here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: Never commit `.env.local` to Git!

---

## ✅ Post-Deployment

### Test Your Live App

1. Visit your deployed URL
2. Test login with demo accounts
3. Test signup
4. Test all features
5. Check browser console for errors

### Custom Domain (Optional)

1. In Vercel, go to "Settings" → "Domains"
2. Add your domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 24 hours)

### Monitoring

- Vercel provides analytics
- Check "Analytics" tab for traffic
- Monitor "Functions" for API usage
- Check "Logs" for errors

---

## 🆘 Troubleshooting

### Build Fails

- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors
- Verify environment variables are set

### App Doesn't Load

- Check browser console for errors
- Verify environment variables
- Check Vercel function logs
- Ensure database is accessible (if using Supabase)

### API Errors

- Check API route logs
- Verify authentication tokens
- Check database connection
- Review CORS settings

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🎉 You're Live!

Your Healthcare App is now on the internet! Share the URL with others to test.

**Next Steps:**
- Add custom domain
- Set up monitoring
- Add analytics
- Optimize performance
- Add more features!




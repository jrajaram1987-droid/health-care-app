# Quick Setup Guide

## Step 1: Install Dependencies

Make sure you have Node.js installed (version 18 or higher). Then run:

```bash
npm install
```

If you prefer pnpm (since the project has pnpm-lock.yaml):
```bash
pnpm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

Or with pnpm:
```bash
pnpm dev
```

## Step 3: Open in Browser

The app will be available at: **http://localhost:3000**

## Step 4: Test the Application

1. **Home Page**: Visit http://localhost:3000
2. **Login**: Click "Login" and use demo credentials:
   - Doctor: `doctor@demo.com` / `demo123`
   - Patient: `patient@demo.com` / `demo123`
   - Pharmacy: `pharmacy@demo.com` / `demo123`
3. **Sign Up**: Create a new account with any role
4. **Demo Dashboards**: Click the demo buttons on the home page

## Troubleshooting

### If npm/pnpm is not found:
1. Install Node.js from https://nodejs.org/
2. Restart your terminal/command prompt
3. Verify installation: `node --version` and `npm --version`

### If port 3000 is already in use:
- The server will automatically use the next available port (3001, 3002, etc.)
- Check the terminal output for the actual URL

### If you see build errors:
- Delete `node_modules` folder and `.next` folder
- Run `npm install` again
- Run `npm run dev` again

## Next Steps

- The app uses a mock database (in-memory) for development
- All data resets when you restart the server
- For production, set up Supabase and configure environment variables
- See README.md for deployment instructions




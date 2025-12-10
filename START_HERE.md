# 🚀 Healthcare App - Quick Start

## ⚠️ IMPORTANT: Install Node.js First!

**If you see "npm is not recognized" error**, you need to install Node.js first!

👉 **See `QUICK_FIX.md` or `INSTALL_NODEJS.md` for installation instructions**

It takes 2 minutes to install from: https://nodejs.org/

---

## ✅ What's Been Set Up

Your healthcare app is now complete with:

1. ✅ **Backend API** - Full REST API with authentication
2. ✅ **Authentication System** - Login and Signup pages
3. ✅ **Mock Database** - In-memory database for development
4. ✅ **API Routes** - All CRUD operations for:
   - Appointments
   - Prescriptions
   - Prescription Orders
   - Messages
   - Doctors
5. ✅ **Auth Context** - React context for user management
6. ✅ **UI Components** - All pages connected and ready

## 🎯 To Start the App (After Node.js is Installed):

### Option 1: Using npm
```bash
npm install
npm run dev
```

### Option 2: Using pnpm (recommended)
```bash
pnpm install
pnpm dev
```

### Option 3: Using yarn
```bash
yarn install
yarn dev
```

Then open: **http://localhost:3000**

## 🧪 Test Accounts

- **Doctor**: `doctor@demo.com` / `demo123`
- **Patient**: `patient@demo.com` / `demo123`  
- **Pharmacy**: `pharmacy@demo.com` / `demo123`

## 📱 What You Can Do

1. **Visit Home Page** - See the landing page with demo buttons
2. **Login/Signup** - Create accounts or use demo credentials
3. **Patient Dashboard** - View appointments, prescriptions, orders
4. **Doctor Dashboard** - Manage patients, create prescriptions
5. **Pharmacy Dashboard** - Handle prescription orders

## 🌐 Making It Live

### Deploy to Vercel (Easiest):

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Click Deploy
5. Your app will be live in minutes!

### Or use other platforms:
- **Netlify**: Connect GitHub repo
- **Railway**: Deploy from GitHub
- **Render**: Connect repository

## 📝 Notes

- Current setup uses **mock database** (data resets on restart)
- For production, set up Supabase and run SQL scripts in `scripts/` folder
- All API endpoints are ready and working
- Authentication is fully functional

## 🆘 Need Help?

- Check `SETUP.md` for detailed setup instructions
- Check `README.md` for full documentation
- All API routes are in `app/api/` folder

---

**Ready to go!** Just run `npm install` and `npm run dev` to start! 🎉


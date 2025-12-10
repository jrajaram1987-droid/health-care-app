# 🏥 Healthcare Management App

A comprehensive healthcare platform connecting doctors, patients, and pharmacies in one unified system. Built with Next.js, TypeScript, and Tailwind CSS.

![Healthcare App](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 👨‍⚕️ For Doctors
- Manage assigned patients
- Create and update prescriptions
- View appointment schedules
- Access patient medical history
- Direct messaging with patients

### 👤 For Patients
- View medical history
- Book appointments
- Receive prescriptions
- Medicine reminders
- Pharmacy order tracking

### 💊 For Pharmacies
- Receive prescription orders
- Confirm or cancel orders
- Update order status
- Secure prescription viewing
- Patient communication

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/healthcare-app.git
   cd healthcare-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Demo Accounts

Test the app with these pre-configured accounts:

- **Doctor**: `doctor@demo.com` / `demo123`
- **Patient**: `patient@demo.com` / `demo123`
- **Pharmacy**: `pharmacy@demo.com` / `demo123`

## 📁 Project Structure

```
healthcare-app/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── appointments/ # Appointment management
│   │   ├── prescriptions/# Prescription management
│   │   └── ...
│   ├── auth/             # Authentication pages
│   ├── demo/             # Demo dashboards
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utilities and helpers
│   ├── db/              # Database (mock or Supabase)
│   ├── auth.ts          # Authentication utilities
│   └── ...
├── scripts/              # SQL scripts for production
└── public/               # Static assets
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription

### Prescription Orders
- `GET /api/prescription-orders` - Get orders
- `POST /api/prescription-orders` - Create order
- `PATCH /api/prescription-orders` - Update order status

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message

### Doctors
- `GET /api/doctors` - Get all doctors

## 🛠️ Development

### Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Mock (dev) / Supabase (production)
- **Authentication**: Token-based

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Other Platforms

- **Netlify**: Connect GitHub repo
- **Railway**: Deploy from GitHub
- **Render**: Connect repository

## 🗄️ Database Setup

### Development (Mock Database)

The app uses an in-memory mock database by default. Data resets on server restart.

### Production (Supabase)

1. Create a [Supabase](https://supabase.com) project
2. Run SQL scripts from `scripts/` folder
3. Add environment variables
4. Update Supabase client configuration

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed Supabase setup.

## 🔐 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_MODE=mock
JWT_SECRET=your-secret-key
```

For production with Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with ❤️ for better healthcare management**

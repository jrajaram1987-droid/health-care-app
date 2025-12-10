# 🔧 Installing Node.js - Required to Run the App

## Why You Need Node.js

Node.js is required to run this Next.js application. It includes `npm` (Node Package Manager) which is used to install dependencies and run the development server.

## 📥 Installation Steps

### Option 1: Official Installer (Recommended)

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Click the **"LTS"** (Long Term Support) version button
   - This will download the Windows installer (.msi file)

2. **Run the Installer:**
   - Double-click the downloaded file
   - Click "Next" through the installation wizard
   - **IMPORTANT:** Make sure "Add to PATH" is checked (it should be by default)
   - Click "Install"
   - Wait for installation to complete

3. **Verify Installation:**
   - Close and reopen your terminal/PowerShell
   - Run these commands to verify:
     ```powershell
     node --version
     npm --version
     ```
   - You should see version numbers (e.g., v20.10.0 and 10.2.3)

4. **Start the App:**
   ```powershell
   cd C:\Users\ABPS\Downloads\healthcare-app
   npm install
   npm run dev
   ```

### Option 2: Using Chocolatey (If you have it)

If you have Chocolatey package manager installed:
```powershell
choco install nodejs
```

### Option 3: Using Winget (Windows 11/10)

```powershell
winget install OpenJS.NodeJS.LTS
```

## ✅ After Installation

Once Node.js is installed:

1. **Close and reopen your terminal/PowerShell** (important!)
2. Navigate to the project:
   ```powershell
   cd C:\Users\ABPS\Downloads\healthcare-app
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start the development server:
   ```powershell
   npm run dev
   ```
5. Open your browser to: **http://localhost:3000**

## 🆘 Troubleshooting

### "node is not recognized" after installation:
- **Close and reopen your terminal/PowerShell** - This is the most common fix!
- Restart your computer if that doesn't work
- Check if Node.js is installed: Go to Control Panel > Programs and Features, look for "Node.js"

### Installation fails:
- Make sure you're downloading from the official site: https://nodejs.org/
- Try running the installer as Administrator (right-click > Run as administrator)
- Check Windows Defender isn't blocking the installation

### Port 3000 already in use:
- The server will automatically use port 3001, 3002, etc.
- Check the terminal output for the actual URL

## 📝 Quick Reference

After Node.js is installed, you'll use these commands:

```powershell
# Install project dependencies (first time only)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎯 Next Steps

1. Install Node.js using Option 1 above
2. Close and reopen PowerShell
3. Run `npm install` in the project folder
4. Run `npm run dev`
5. Open http://localhost:3000 in your browser

---

**Need help?** The installation usually takes 2-3 minutes and is very straightforward!




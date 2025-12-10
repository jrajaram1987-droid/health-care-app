# 🔧 Quick Fix for npm Not Recognized

## The Problem
You opened a NEW PowerShell window, and npm is not recognized again. This is because the PATH wasn't refreshed in the new window.

## ✅ Solution: Run This Script

**In your current PowerShell window**, run this command:

```powershell
.\FIX_NPM.ps1
```

Or copy and paste this into PowerShell:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
node --version
npm --version
```

## ✅ Alternative: Close and Reopen PowerShell

1. **Close your current PowerShell window completely**
2. **Open a NEW PowerShell window**
3. Navigate to the project:
   ```powershell
   cd C:\Users\ABPS\Downloads\healthcare-app
   ```
4. Try:
   ```powershell
   node --version
   npm --version
   ```

If you see version numbers, you're good! Then run:
```powershell
npm install
npm run dev
```

## ✅ Last Resort: Restart Computer

If nothing works:
1. **Restart your computer**
2. Open PowerShell
3. Navigate to the project
4. Run `npm install` and `npm run dev`

---

## 🎯 What's Happening?

When you install Node.js, it adds itself to the system PATH. But:
- Old PowerShell windows don't see the new PATH
- You need to either refresh PATH or open a new window
- Restarting your computer ensures everything is loaded

---

**Try the script first, or just close and reopen PowerShell!** 🚀




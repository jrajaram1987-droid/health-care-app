# Git Setup and Push Instructions

## Step 1: Install Git (if not already installed)

### For Windows:
1. Download Git from: https://git-scm.com/download/win
2. Run the installer
3. Restart your terminal/PowerShell after installation

### Verify Installation:
```powershell
git --version
```

## Step 2: Configure Git (First Time Only)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize and Push to GitHub

Run these commands in PowerShell (in the project directory):

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Healthcare app with full functionality"

# Rename branch to main
git branch -M main

# Add remote repository
git remote add origin https://github.com/jrajaram1987-droid/health-care-app.git

# Push to GitHub
git push -u origin main
```

## Important Notes:

- The `.gitignore` file is already configured to exclude:
  - `node_modules/` (dependencies)
  - `.next/` (build files)
  - `data/` (runtime data files)
  - Environment files

- If you get authentication errors, you may need to:
  1. Use a Personal Access Token instead of password
  2. Or set up SSH keys for GitHub

## Troubleshooting:

### If "remote origin already exists":
```powershell
git remote remove origin
git remote add origin https://github.com/jrajaram1987-droid/health-care-app.git
```

### If you need to force push (be careful!):
```powershell
git push -u origin main --force
```

### If authentication fails:
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `repo` permissions
3. Use the token as your password when pushing


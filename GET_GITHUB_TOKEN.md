# How to Get GitHub Personal Access Token

## Step 1: Go to GitHub Settings

1. Open your browser
2. Go to: https://github.com/settings/tokens
3. Or: GitHub → Your Profile (top right) → Settings → Developer settings → Personal access tokens → Tokens (classic)

## Step 2: Generate New Token

1. Click **"Generate new token"** → **"Generate new token (classic)"**
2. Give it a name: `healthcare-app-upload`
3. Select expiration: Choose your preference (90 days, 1 year, or no expiration)
4. **Check these permissions:**
   - ✅ `repo` (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`

## Step 3: Generate and Copy Token

1. Click **"Generate token"** at the bottom
2. **IMPORTANT:** Copy the token immediately - you won't see it again!
3. It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 4: Use the Token

Run this command in PowerShell:

```powershell
.\UPLOAD_TO_GITHUB.ps1 -GitHubToken "YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token you copied.

## Security Note

- Never share your token publicly
- Don't commit it to Git
- If you accidentally share it, revoke it immediately and create a new one


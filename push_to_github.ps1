# Git Initialization and Push Script
Write-Host "Starting Git push to https://github.com/srinimuppalla86-hash/msr-AI-Proj.git" -ForegroundColor Cyan

# 1. Initialize repository if not already done
if (!(Test-Path .git)) {
    git init
    Write-Host "Initialized empty Git repository." -ForegroundColor Green
} else {
    Write-Host ".git directory already exists. Skipping 'git init'." -ForegroundColor Yellow
}

# 2. Add remote if it doesn't exist
$remotes = git remote
if ($remotes.Trim() -notcontains "origin") {
    if ($remotes.Trim() -eq "") {
        git remote add origin https://github.com/srinimuppalla86-hash/msr-AI-Proj.git
        Write-Host "Added remote 'origin'." -ForegroundColor Green
    } else {
        Write-Host "Remote already exists: $remotes" -ForegroundColor Yellow
    }
}

# 3. Add all files and commit
Write-Host "Adding files and committing..." -ForegroundColor Yellow
git add .
git commit -m "Initial commit: Set up Test Planning Agent and Git MCP Server"

# 4. Push to main branch
git branch -M main
Write-Host "Pushing to GitHub (you may be asked for credentials or PAT)..." -ForegroundColor Yellow
git push -u origin main

Write-Host "`nDone! Your code should now be on GitHub." -ForegroundColor Green
Write-Host "If you saw an authentication error, please ensure you use a GitHub Personal Access Token (PAT) for the password." -ForegroundColor Yellow

# Vercel Deployment Script for Windows PowerShell
# Run this script to deploy the app to Vercel

Write-Host "Starting deployment preparation..." -ForegroundColor Green

# Remove test files and libraries
Write-Host "Removing test files and configurations..." -ForegroundColor Yellow
Remove-Item -Path "__tests__", "*/__tests__", "jest.config.js", "jest.setup.js" -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "." -Include "*.test.js", "*.test.ts", "*.test.tsx" -Recurse | Remove-Item -Force

# Installing dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --production

# Running build
Write-Host "Building the application..." -ForegroundColor Yellow
npm run build

# Deploying to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
npx vercel --prod

Write-Host "Deployment process completed!" -ForegroundColor Green

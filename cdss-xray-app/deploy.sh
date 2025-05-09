# This script helps with deploying to Vercel
# Run this script to build and deploy your app

# Remove test files and libraries
echo "Removing test files and configurations..."
rm -rf __tests__ **/__tests__ jest.config.js jest.setup.js *.test.js *.test.ts *.test.tsx **/*.test.js **/*.test.ts **/*.test.tsx

# Installing dependencies
echo "Installing dependencies..."
npm install --production

# Running build
echo "Building the application..."
npm run build

# Deploying to Vercel (needs Vercel CLI)
echo "Deploying to Vercel..."
npx vercel --prod

echo "Build completed. To deploy to Vercel:"
echo "1. Install the Vercel CLI with: npm install -g vercel"
echo "2. Run 'vercel login' to authenticate"
echo "3. Run 'vercel --prod' to deploy"
echo ""
echo "Alternatively, connect your GitHub repository to Vercel for automatic deployments."

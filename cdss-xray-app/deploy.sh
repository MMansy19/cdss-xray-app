# This script helps with deploying to Vercel
# Run this script to build and deploy your app

# Installing dependencies
echo "Installing dependencies..."
npm install --production

# Running build
echo "Building the application..."
npm run build

# Deploying to Vercel (needs Vercel CLI)
# Uncomment the following line when ready to deploy
# echo "Deploying to Vercel..."
# vercel --prod

echo "Build completed. To deploy to Vercel:"
echo "1. Install the Vercel CLI with: npm install -g vercel"
echo "2. Run 'vercel login' to authenticate"
echo "3. Run 'vercel --prod' to deploy"
echo ""
echo "Alternatively, connect your GitHub repository to Vercel for automatic deployments."

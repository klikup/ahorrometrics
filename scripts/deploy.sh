#!/bin/bash
set -e
cd "$(dirname "$0")/.."
echo "📥 Pulling latest code..."
git pull origin main
echo "📦 Installing dependencies..."
npm install
echo "🗑️  Clearing Prisma cache..."
rm -rf node_modules/.prisma
echo "🗄️  Syncing database schema..."
npx prisma db push --accept-data-loss
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "🏗️  Building..."
npm run build
echo "🔄 Restarting..."
if command -v pm2 &> /dev/null; then
  pm2 restart all
  echo "✅ Done!"
else
  echo "⚠️  PM2 not found. Run: npm start"
fi

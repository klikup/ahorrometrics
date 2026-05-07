#!/bin/bash
# ═══════════════════════════════════════════════════
# AhorroMetrics - Deploy rápido (git pull + build)
# Ejecutar: bash scripts/deploy.sh
# ═══════════════════════════════════════════════════
set -e
cd "$(dirname "$0")/.."
echo "📥 Pulling latest code..."
git pull origin main
echo "📦 Installing dependencies..."
npm install
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "🗄️  Syncing database schema..."
npx prisma db push --accept-data-loss
echo "🏗️  Building..."
npm run build
echo "🔄 Restarting..."
if command -v pm2 &> /dev/null; then
  pm2 restart all
  echo "✅ Done! App restarted with PM2"
else
  echo "⚠️  PM2 not found. Run: npm start"
fi

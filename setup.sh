#!/bin/bash

echo "🚀 GSM Marketplace Backend Setup Script"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  IMPORTANT: Please edit .env and update DATABASE_URL and JWT secrets!"
    echo ""
    read -p "Press enter to continue after editing .env file..."
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

echo "🔧 Generating Prisma Client..."
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

echo "🗄️  Running database migrations..."
npm run prisma:migrate

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    echo "⚠️  Make sure your DATABASE_URL is correct and PostgreSQL is running"
    exit 1
fi

echo "✅ Database migrations completed"
echo ""

echo "🌱 Seeding database..."
npm run prisma:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded successfully"
echo ""

echo "================================================"
echo "✅ Setup Complete! Your backend is ready to run"
echo "================================================"
echo ""
echo "📋 Admin Credentials:"
echo "   Email: admin@gsm.com"
echo "   Password: admin123"
echo ""
echo "🚀 Start the server:"
echo "   npm run dev     # Development mode"
echo "   npm start       # Production mode"
echo ""
echo "📡 API will be available at: http://localhost:5000"
echo ""

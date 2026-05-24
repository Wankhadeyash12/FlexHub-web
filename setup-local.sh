#!/bin/bash

# FlexHub - Local Development Setup Script

echo "🚀 FlexHub Local Setup"
echo "===================="

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env created"
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Edit .env file with your local MongoDB and Razorpay credentials"
echo "2. Make sure MongoDB is running locally (default: mongodb://localhost:27017)"
echo "3. Run 'npm run dev' to start development server"
echo ""
echo "For Vercel deployment, see DEPLOYMENT_GUIDE.md"

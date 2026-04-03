#!/bin/bash

# Development Setup Script
# Sets up pre-commit hooks and development environment

set -e

echo "🚀 Setting up development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Backend setup
if [ -d "backend" ]; then
    echo "📦 Setting up backend..."
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python -m venv venv
    fi
    
    # Activate virtual environment
    echo "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Install pre-commit hooks
    echo "Installing pre-commit hooks..."
    pre-commit install
    
    # Install gitleaks (Go binary)
    echo "Installing gitleaks..."
    if ! command -v gitleaks &> /dev/null; then
        echo "Installing gitleaks binary..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install gitleaks
            else
                echo "Please install gitleaks manually: https://github.com/gitleaks/gitleaks#install"
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks-linux-amd64
            chmod +x gitleaks-linux-amd64
            sudo mv gitleaks-linux-amd64 /usr/local/bin/gitleaks
        else
            echo "Please install gitleaks manually: https://github.com/gitleaks/gitleaks#install"
        fi
    fi
    
    # Initialize secrets baseline
    echo "Initializing secrets detection baseline..."
    detect-secrets scan --baseline .secrets.baseline || true
    
    cd ..
    echo "✅ Backend setup complete!"
fi

# Frontend setup
if [ -d "frontend" ]; then
    echo "📦 Setting up frontend..."
    cd frontend
    
    # Install dependencies
    echo "Installing Node.js dependencies..."
    npm install
    
    cd ..
    echo "✅ Frontend setup complete!"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.example files to .env and add your credentials"
echo "2. The pre-commit hooks will now run automatically before each push"
echo "3. Run 'pre-commit run --all-files' to test all hooks manually"
echo ""
echo "🔧 Useful commands:"
echo "- Run all checks: pre-commit run --all-files"
echo "- Run specific hook: pre-commit run black"
echo "- Update hooks: pre-commit autoupdate"
echo "- Skip hooks (not recommended): git push --no-verify"
echo ""
echo "⚠️  Remember to:"
echo "- Never commit real credentials to .env files"
echo "- Use .env.example as templates only"
echo "- Keep your secrets baseline updated"

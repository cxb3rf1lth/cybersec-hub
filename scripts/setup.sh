#!/bin/bash

# CyberConnect Setup Script
# This script automates the initial setup process for the CyberConnect platform

set -e

echo "🌐 CyberConnect Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is >= 18
        MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js version is compatible (>= v18.0.0)"
        else
            print_error "Node.js version $NODE_VERSION is too old. Please install Node.js v18.0.0 or higher."
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js v18.0.0 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: v$NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_success "Created .env.local from .env.example"
            print_warning "Please edit .env.local with your actual API keys and configuration"
        else
            print_warning ".env.example not found. Skipping environment setup."
        fi
    else
        print_warning ".env.local already exists. Skipping environment setup."
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p tmp
    mkdir -p uploads
    mkdir -p backups
    
    print_success "Created project directories"
}

# Setup git hooks (if git repository)
setup_git_hooks() {
    if [ -d ".git" ]; then
        print_status "Setting up git hooks..."
        
        # Create pre-commit hook for linting
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Pre-commit hook for CyberConnect

echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues before committing."
    exit 1
fi

echo "Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks configured"
    else
        print_warning "Not a git repository. Skipping git hooks setup."
    fi
}

# Test build
test_build() {
    print_status "Testing build process..."
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Build test successful"
    else
        print_error "Build test failed"
        exit 1
    fi
}

# Main setup function
main() {
    echo "Starting CyberConnect setup..."
    echo ""
    
    check_nodejs
    check_npm
    install_dependencies
    setup_environment
    create_directories
    setup_git_hooks
    test_build
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.local with your API keys and configuration"
    echo "2. Run 'npm run dev' to start the development server"
    echo "3. Run 'npm run verify' to verify your installation"
    echo ""
    echo "For more information, see the README.md file."
}

# Run main function
main
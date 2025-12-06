#!/bin/bash

# CyberConnect - Automated Setup Script
# This script handles complete installation and configuration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
cat << "EOF"
   ____      _               ____                            _
  / ___|   _| |__   ___ _ __|  _ \ ___  _ __  _ __   ___  ___| |_
 | |  | | | | '_ \ / _ \ '__| |_) / _ \| '_ \| '_ \ / _ \/ __| __|
 | |__| |_| | |_) |  __/ |  |  __/ (_) | | | | | | |  __/ (__| |_
  \____\__, |_.__/ \___|_|  |_|   \___/|_| |_|_| |_|\___|\___|\__|
       |___/
EOF
echo -e "${NC}"
echo -e "${BLUE}==============================================================${NC}"
echo -e "${GREEN}    CyberConnect - Production Setup & Installation${NC}"
echo -e "${BLUE}==============================================================${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${YELLOW}[1/7]${NC} Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from: https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version must be 18 or higher (current: $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo ""

# Step 2: Check npm
echo -e "${YELLOW}[2/7]${NC} Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}[3/7]${NC} Installing dependencies..."
echo -e "${CYAN}This may take a few minutes...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
echo ""

# Step 4: Fix security vulnerabilities
echo -e "${YELLOW}[4/7]${NC} Fixing security vulnerabilities..."
npm audit fix 2>/dev/null || true
echo -e "${GREEN}✓ Security audit completed${NC}"
echo ""

# Step 5: Build application
echo -e "${YELLOW}[5/7]${NC} Building application..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Application built successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Step 6: Initialize database
echo -e "${YELLOW}[6/7]${NC} Initializing database..."
echo -e "${CYAN}IndexedDB will be initialized on first run${NC}"
echo -e "${GREEN}✓ Database configuration ready${NC}"
echo ""

# Step 7: Display configuration info
echo -e "${YELLOW}[7/7]${NC} Setup complete!"
echo ""
echo -e "${BLUE}==============================================================${NC}"
echo -e "${GREEN}         SETUP COMPLETED SUCCESSFULLY!${NC}"
echo -e "${BLUE}==============================================================${NC}"
echo ""

# Display next steps
echo -e "${CYAN}NEXT STEPS:${NC}"
echo ""
echo -e "${YELLOW}1. Start Development Server:${NC}"
echo -e "   ${GREEN}npm run dev${NC}"
echo -e "   Application will run at: ${CYAN}http://localhost:5000${NC}"
echo ""

echo -e "${YELLOW}2. Create Your Account:${NC}"
echo -e "   - Navigate to the application in your browser"
echo -e "   - Click 'Sign Up' and create an account"
echo -e "   - Use a strong password (minimum 8 characters)"
echo ""

echo -e "${YELLOW}3. Configure API Keys (Optional but Recommended):${NC}"
echo -e "   To unlock all features, add API keys in Settings for:"
echo -e "   ${CYAN}Bug Bounty Platforms:${NC}"
echo -e "     • HackerOne    - https://hackerone.com/settings/api_token"
echo -e "     • Bugcrowd     - https://bugcrowd.com/user/api_tokens"
echo -e "     • Intigriti    - https://app.intigriti.com/researcher/profile"
echo -e "     • YesWeHack    - https://yeswehack.com/user/api-keys"
echo ""
echo -e "   ${CYAN}Threat Intelligence:${NC}"
echo -e "     • VirusTotal   - https://www.virustotal.com/gui/user/apikey"
echo -e "     • Shodan       - https://account.shodan.io/"
echo ""
echo -e "   ${GREEN}Note: MITRE CVE, CISA, and Exploit-DB work without API keys!${NC}"
echo ""

echo -e "${YELLOW}4. Features Available:${NC}"
echo -e "   ${GREEN}✓${NC} Real authentication with JWT tokens"
echo -e "   ${GREEN}✓${NC} Persistent database (IndexedDB)"
echo -e "   ${GREEN}✓${NC} Live CVE and vulnerability feeds"
echo -e "   ${GREEN}✓${NC} Real threat intelligence"
echo -e "   ${GREEN}✓${NC} Bug bounty program tracking"
echo -e "   ${GREEN}✓${NC} Team collaboration features"
echo -e "   ${GREEN}✓${NC} Terminal User Interface (TUI)"
echo -e "   ${GREEN}✓${NC} Code sharing and collaboration"
echo ""

echo -e "${YELLOW}5. Quick Commands:${NC}"
echo -e "   ${CYAN}npm run dev${NC}      - Start development server"
echo -e "   ${CYAN}npm run build${NC}    - Build for production"
echo -e "   ${CYAN}npm run preview${NC}  - Preview production build"
echo ""

echo -e "${BLUE}==============================================================${NC}"
echo -e "${CYAN}Documentation:${NC} See ${GREEN}CHANGELOG.md${NC} for complete feature list"
echo -e "${CYAN}Support:${NC} https://github.com/cxb3rf1lth/cybersec-hub"
echo -e "${BLUE}==============================================================${NC}"
echo ""

# Ask if user wants to start dev server
read -p "$(echo -e ${YELLOW}Start development server now? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}Starting development server...${NC}"
    echo -e "${CYAN}Access the application at: ${GREEN}http://localhost:5000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""
    npm run dev
else
    echo ""
    echo -e "${CYAN}Setup complete! Run ${GREEN}npm run dev${CYAN} when ready to start.${NC}"
    echo ""
fi

# 🌐 CyberConnect - Advanced Cybersecurity Social Network

CyberConnect is the ultimate professional platform for cybersecurity experts featuring HD glass morphism UI, providing advanced red team operations, enhanced virtual lab infrastructure, GitHub-like repository management, and real-time secure communication with immersive hacker-themed visual effects.

## ✨ Features

- **Bug Bounty Platform Integration** - Connect with HackerOne, Bugcrowd, Intigriti, and more
- **Team Collaboration** - Real-time messaging, project management, and team hunts
- **Code Repository Management** - GitHub-like interface for cybersecurity tools and scripts
- **Virtual Lab Infrastructure** - Spin up VMs for testing and research
- **Threat Intelligence Feed** - Live security alerts and vulnerability data
- **Earnings Tracking** - Monitor bug bounty payments and team performance
- **Red Team Operations** - Advanced persistent threat simulation tools

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/cxb3rf1lth/cybersec-hub.git
   cd cybersec-hub
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to \`http://localhost:5173\`

### Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## 🔧 Configuration

### Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`bash
# API Configuration
VITE_API_BASE_URL=https://api.cyberconnect.io
VITE_WS_BASE_URL=wss://api.cyberconnect.io

# Bug Bounty Platform Integration
VITE_HACKERONE_API_KEY=your_hackerone_api_key
VITE_BUGCROWD_API_KEY=your_bugcrowd_api_key
VITE_INTIGRITI_API_KEY=your_intigriti_api_key

# Cloud Provider Keys (for VM provisioning)
VITE_AWS_ACCESS_KEY_ID=your_aws_access_key
VITE_DIGITALOCEAN_TOKEN=your_do_token

# Threat Intelligence
VITE_SHODAN_API_KEY=your_shodan_api_key

# GitHub Integration
VITE_GITHUB_CLIENT_ID=your_github_client_id

# Push Notifications
VITE_VAPID_PUBLIC_KEY=your_push_notification_key
\`\`\`

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Build for production |
| \`npm run preview\` | Preview production build |
| \`npm run lint\` | Run ESLint |
| \`npm run setup\` | Run initial setup script |
| \`npm run verify\` | Verify installation |

## 🧪 Installation Verification

Run the verification script to ensure everything is set up correctly:

\`\`\`bash
npm run verify
\`\`\`

This will check:
- ✅ Node.js and npm versions
- ✅ Dependencies installation
- ✅ Environment configuration
- ✅ API connectivity (if keys provided)
- ✅ Build process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>🔒 Secure. Professional. Advanced. 🔒</strong>
  <br>
  <em>Empowering cybersecurity professionals worldwide</em>
</div>

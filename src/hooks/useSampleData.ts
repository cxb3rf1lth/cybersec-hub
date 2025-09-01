import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { User } from '@/types/user'
import { Template, ToolRepository } from '@/types/templates'

const SAMPLE_USERS: User[] = [
  {
    id: 'user_sample_1',
    username: 'alex_hunter',
    email: 'alex@cyberconnect.com',
    bio: 'Penetration tester with 5+ years experience in web application security',
    specializations: ['Penetration Testing', 'Bug Bounty', 'Ethical Hacking'],
    followers: ['user_sample_2', 'user_sample_3'],
    following: ['user_sample_2'],
    joinedAt: '2023-01-15T10:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user_sample_2',
    username: 'maya_defense',
    email: 'maya@cyberconnect.com',
    bio: 'Blue team specialist focused on incident response and threat hunting',
    specializations: ['Blue Team', 'Incident Response', 'Threat Hunting'],
    followers: ['user_sample_1', 'user_sample_3'],
    following: ['user_sample_1', 'user_sample_3'],
    joinedAt: '2023-02-20T14:30:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user_sample_3',
    username: 'code_ninja',
    email: 'ninja@cyberconnect.com',
    bio: 'Malware researcher and reverse engineering expert',
    specializations: ['Malware Analysis', 'Reverse Engineering', 'Security Research'],
    followers: ['user_sample_1'],
    following: ['user_sample_2'],
    joinedAt: '2023-03-10T09:15:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'user_sample_4',
    username: 'red_phantom',
    email: 'phantom@cyberconnect.com',
    bio: 'Red team operative specializing in social engineering and physical security',
    specializations: ['Red Team', 'Social Engineering', 'Physical Security'],
    followers: [],
    following: ['user_sample_1', 'user_sample_2'],
    joinedAt: '2023-04-05T16:45:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  }
]

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: 'template_1',
    name: 'Web Vulnerability Scanner',
    description: 'A comprehensive Python-based web application vulnerability scanner with support for OWASP Top 10',
    category: 'web-app',
    tags: ['python', 'security', 'scanner', 'owasp', 'vulnerability-assessment'],
    difficulty: 'intermediate',
    files: [
      {
        id: 'file_1',
        name: 'scanner.py',
        path: 'src/scanner.py',
        content: `#!/usr/bin/env python3
import requests
import urllib.parse
from bs4 import BeautifulSoup
import threading
import argparse

class WebVulnScanner:
    def __init__(self, target_url):
        self.target_url = target_url
        self.session = requests.Session()
        self.vulnerabilities = []
    
    def scan_sql_injection(self):
        """Test for SQL injection vulnerabilities"""
        payloads = ["'", '"', "1' OR '1'='1", "1\\" OR \\"1\\"=\\"1"]
        
        for payload in payloads:
            test_url = f"{self.target_url}?id={payload}"
            try:
                response = self.session.get(test_url)
                if "mysql" in response.text.lower() or "syntax error" in response.text.lower():
                    self.vulnerabilities.append({
                        'type': 'SQL Injection',
                        'url': test_url,
                        'payload': payload
                    })
            except Exception as e:
                print(f"Error testing SQL injection: {e}")
    
    def run_scan(self):
        """Run all vulnerability scans"""
        print(f"Starting scan of {self.target_url}")
        self.scan_sql_injection()
        return self.vulnerabilities

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Web Vulnerability Scanner')
    parser.add_argument('url', help='Target URL to scan')
    args = parser.parse_args()
    
    scanner = WebVulnScanner(args.url)
    vulnerabilities = scanner.run_scan()`,
        language: 'python',
        isEntryPoint: true
      },
      {
        id: 'file_2',
        name: 'requirements.txt',
        path: 'requirements.txt',
        content: `requests>=2.28.0
beautifulsoup4>=4.11.0
urllib3>=1.26.0`,
        language: 'text'
      }
    ],
    dependencies: ['requests>=2.28.0', 'beautifulsoup4>=4.11.0'],
    setupInstructions: `1. Clone the repository
2. Install dependencies: pip install -r requirements.txt
3. Run the scanner: python src/scanner.py https://example.com`,
    usageExample: 'python scanner.py https://testphp.vulnweb.com/',
    author: {
      id: 'user_sample_1',
      username: 'alex_hunter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    stars: 142,
    downloads: 89,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
    isPublic: true,
    license: 'MIT',
    framework: 'python'
  },
  {
    id: 'template_2',
    name: 'Network Port Scanner',
    description: 'Fast and efficient network port scanner with stealth scanning capabilities',
    category: 'networking',
    tags: ['python', 'networking', 'scanner', 'ports', 'reconnaissance'],
    difficulty: 'beginner',
    files: [
      {
        id: 'file_3',
        name: 'port_scanner.py',
        path: 'port_scanner.py',
        content: `#!/usr/bin/env python3
import socket
import threading
import argparse
from datetime import datetime

class PortScanner:
    def __init__(self, target, timeout=1):
        self.target = target
        self.timeout = timeout
        self.open_ports = []
    
    def scan_port(self, port):
        """Scan a single port"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            result = sock.connect_ex((self.target, port))
            sock.close()
            
            if result == 0:
                self.open_ports.append(port)
                print(f"Port {port}: Open")
        except Exception:
            pass
    
    def scan_range(self, start_port, end_port):
        """Scan a range of ports"""
        print(f"Scanning {self.target}")
        for port in range(start_port, end_port + 1):
            self.scan_port(port)
        return sorted(self.open_ports)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Network Port Scanner')
    parser.add_argument('target', help='Target IP address')
    args = parser.parse_args()
    
    scanner = PortScanner(args.target)
    open_ports = scanner.scan_range(1, 1000)`,
        language: 'python',
        isEntryPoint: true
      }
    ],
    dependencies: [],
    setupInstructions: `1. Download the script
2. Make it executable: chmod +x port_scanner.py
3. Run: python port_scanner.py <target_ip>`,
    usageExample: 'python port_scanner.py 192.168.1.1',
    author: {
      id: 'user_sample_2',
      username: 'maya_defense',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    stars: 78,
    downloads: 156,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    isPublic: true,
    license: 'GPL-3.0',
    framework: 'python'
  }
]

const SAMPLE_REPOSITORIES: ToolRepository[] = [
  {
    id: 'repo_1',
    name: 'Penetration Testing Toolkit',
    description: 'A comprehensive collection of tools for penetration testing and security assessments',
    category: 'exploitation',
    tools: [
      {
        id: 'tool_1',
        name: 'Nmap',
        description: 'Network exploration tool and security/port scanner',
        version: '7.94',
        installCommand: 'sudo apt install nmap',
        usageExample: 'nmap -sV -O target.com',
        documentation: 'https://nmap.org/docs.html',
        platform: ['linux', 'windows', 'macos'],
        dependencies: ['libpcap'],
        category: 'scanner',
        complexity: 'moderate'
      },
      {
        id: 'tool_2',
        name: 'Metasploit',
        description: 'Advanced open-source penetration testing framework',
        version: '6.3.0',
        installCommand: 'curl https://raw.githubusercontent.com/rapid7/metasploit-omnibus/master/config/templates/metasploit-framework-wrappers/msfupdate.erb > msfinstall',
        usageExample: 'msfconsole',
        documentation: 'https://docs.metasploit.com/',
        platform: ['linux', 'windows', 'macos'],
        dependencies: ['ruby', 'postgresql'],
        category: 'exploit',
        complexity: 'complex'
      }
    ],
    author: {
      id: 'user_sample_1',
      username: 'alex_hunter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    isPublic: true,
    stars: 245,
    forks: 67,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-05'),
    tags: ['penetration-testing', 'security', 'tools', 'vulnerability-assessment']
  },
  {
    id: 'repo_2',
    name: 'Digital Forensics Arsenal',
    description: 'Essential tools for digital forensics investigations and incident response',
    category: 'analysis',
    tools: [
      {
        id: 'tool_3',
        name: 'Volatility',
        description: 'Advanced memory forensics framework',
        version: '3.2.0',
        installCommand: 'pip install volatility3',
        usageExample: 'vol -f memory.dmp windows.info',
        documentation: 'https://volatility3.readthedocs.io/',
        platform: ['linux', 'windows', 'macos'],
        dependencies: ['python3'],
        category: 'analyzer',
        complexity: 'complex'
      }
    ],
    author: {
      id: 'user_sample_3',
      username: 'code_ninja',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    isPublic: true,
    stars: 123,
    forks: 34,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-10'),
    tags: ['forensics', 'incident-response', 'memory-analysis', 'investigation']
  }
]

export function useSampleData() {
  const [allUsers, setAllUsers] = useKV<User[]>('allUsers', [])
  const [templates, setTemplates] = useKV<Template[]>('templates', [])
  const [repositories, setRepositories] = useKV<ToolRepository[]>('toolRepositories', [])

  useEffect(() => {
    // Only initialize sample data if no users exist
    if (allUsers.length === 0) {
      setAllUsers(SAMPLE_USERS)
    }
    
    // Initialize templates if none exist
    if (templates.length === 0) {
      setTemplates(SAMPLE_TEMPLATES)
    }
    
    // Initialize repositories if none exist  
    if (repositories.length === 0) {
      setRepositories(SAMPLE_REPOSITORIES)
    }
  }, [allUsers.length, templates.length, repositories.length, setAllUsers, setTemplates, setRepositories])
}
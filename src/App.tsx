import { useState } from 'react';

interface Tool {
  name: string;
  description: string;
  url: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  command?: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  checked: boolean;
}

const freeTools: Tool[] = [
  {
    name: 'OWASP ZAP',
    description: 'The world\'s most popular free web app security scanner. Great for finding XSS, SQL injection, and other web vulnerabilities.',
    url: 'https://www.zaproxy.org/',
    category: 'Web Scanner',
    difficulty: 'beginner',
    features: ['Automated scanning', 'Manual testing tools', 'API testing', 'CI/CD integration'],
    command: 'Download → Install → Enter target URL → Click "Attack Mode"',
  },
  {
    name: 'Nmap',
    description: 'Network mapper for port scanning and service detection. Essential for understanding your attack surface.',
    url: 'https://nmap.org/',
    category: 'Network',
    difficulty: 'intermediate',
    features: ['Port scanning', 'Service detection', 'OS fingerprinting', 'Scriptable'],
    command: 'nmap -sV -sC -oN scan.txt yourdomain.com',
  },
  {
    name: 'Nikto',
    description: 'Web server scanner that tests for dangerous files, outdated server software, and other problems.',
    url: 'https://github.com/sullo/nikto',
    category: 'Web Scanner',
    difficulty: 'beginner',
    features: ['Server misconfig detection', 'Outdated software check', 'IDS evasion'],
    command: 'nikto -h https://yourdomain.com',
  },
  {
    name: 'SSL Labs Test',
    description: 'Free online tool by Qualys that deeply analyzes SSL/TLS configuration of any web server.',
    url: 'https://www.ssllabs.com/ssltest/',
    category: 'SSL/TLS',
    difficulty: 'beginner',
    features: ['Certificate analysis', 'Protocol support check', 'Key exchange review'],
    command: 'Just visit the URL and enter your domain',
  },
  {
    name: 'Mozilla Observatory',
    description: 'Free tool that checks your site\'s security headers and TLS configuration against best practices.',
    url: 'https://observatory.mozilla.org/',
    category: 'Headers',
    difficulty: 'beginner',
    features: ['Security headers check', 'Cookie analysis', 'TLS evaluation'],
    command: 'Just visit the URL and enter your domain',
  },
  {
    name: 'WPScan',
    description: 'If your site uses WordPress, this is essential. Finds vulnerable plugins, themes, and weak passwords.',
    url: 'https://wpscan.com/',
    category: 'WordPress',
    difficulty: 'intermediate',
    features: ['Plugin vuln detection', 'Theme analysis', 'User enumeration'],
    command: 'wpscan --url https://yourdomain.com --api-token YOUR_TOKEN',
  },
  {
    name: 'TestSSL.sh',
    description: 'Command-line tool for checking TLS/SSL configuration. More detailed than online tools.',
    url: 'https://testssl.sh/',
    category: 'SSL/TLS',
    difficulty: 'intermediate',
    features: ['Full TLS audit', 'Certificate chain check', 'Vulnerability testing'],
    command: './testssl.sh https://yourdomain.com',
  },
  {
    name: 'WhatWeb',
    description: 'Identifies what technologies your website uses — CMS, frameworks, server software, etc.',
    url: 'https://github.com/urbanadventurer/WhatWeb',
    category: 'Recon',
    difficulty: 'beginner',
    features: ['Technology detection', 'CMS identification', 'Plugin discovery'],
    command: 'whatweb yourdomain.com',
  },
  {
    name: 'Sublist3r',
    description: 'Enumerates subdomains using OSINT. Finds forgotten subdomains that might be vulnerable.',
    url: 'https://github.com/aboul3la/Sublist3r',
    category: 'Recon',
    difficulty: 'intermediate',
    features: ['Subdomain enumeration', 'Multiple source support', 'Fast scanning'],
    command: 'python sublist3r.py -d yourdomain.com',
  },
  {
    name: 'Security Headers',
    description: 'Quick online check of your HTTP security headers. Simple and effective.',
    url: 'https://securityheaders.com/',
    category: 'Headers',
    difficulty: 'beginner',
    features: ['Header analysis', 'Grade scoring', 'Fix recommendations'],
    command: 'Just visit the URL and enter your domain',
  },
];

const defaultChecklist: ChecklistItem[] = [
  // Authentication
  { id: 'auth-1', category: 'Authentication', text: 'Password policy enforces minimum 12 characters', priority: 'critical', checked: false },
  { id: 'auth-2', category: 'Authentication', text: 'Account lockout after 5 failed attempts', priority: 'critical', checked: false },
  { id: 'auth-3', category: 'Authentication', text: 'Multi-factor authentication available', priority: 'high', checked: false },
  { id: 'auth-4', category: 'Authentication', text: 'Session tokens are properly invalidated on logout', priority: 'high', checked: false },
  { id: 'auth-5', category: 'Authentication', text: 'Password reset tokens expire within 1 hour', priority: 'high', checked: false },
  { id: 'auth-6', category: 'Authentication', text: 'No default credentials in use', priority: 'critical', checked: false },

  // HTTPS/TLS
  { id: 'tls-1', category: 'HTTPS/TLS', text: 'Site uses HTTPS (valid certificate)', priority: 'critical', checked: false },
  { id: 'tls-2', category: 'HTTPS/TLS', text: 'HTTP redirects to HTTPS', priority: 'critical', checked: false },
  { id: 'tls-3', category: 'HTTPS/TLS', text: 'TLS 1.2+ only (no SSLv3, TLS 1.0/1.1)', priority: 'high', checked: false },
  { id: 'tls-4', category: 'HTTPS/TLS', text: 'HSTS header is set', priority: 'high', checked: false },
  { id: 'tls-5', category: 'HTTPS/TLS', text: 'Strong cipher suites configured', priority: 'medium', checked: false },

  // Headers
  { id: 'hdr-1', category: 'Security Headers', text: 'Content-Security-Policy header is set', priority: 'high', checked: false },
  { id: 'hdr-2', category: 'Security Headers', text: 'X-Frame-Options is set to DENY or SAMEORIGIN', priority: 'medium', checked: false },
  { id: 'hdr-3', category: 'Security Headers', text: 'X-Content-Type-Options: nosniff', priority: 'medium', checked: false },
  { id: 'hdr-4', category: 'Security Headers', text: 'Referrer-Policy header is configured', priority: 'low', checked: false },
  { id: 'hdr-5', category: 'Security Headers', text: 'Permissions-Policy header restricts features', priority: 'low', checked: false },

  // Input Validation
  { id: 'inp-1', category: 'Input Validation', text: 'All user input is sanitized server-side', priority: 'critical', checked: false },
  { id: 'inp-2', category: 'Input Validation', text: 'SQL queries use parameterized statements', priority: 'critical', checked: false },
  { id: 'inp-3', category: 'Input Validation', text: 'Output is properly encoded to prevent XSS', priority: 'critical', checked: false },
  { id: 'inp-4', category: 'Input Validation', text: 'File uploads are validated (type, size, content)', priority: 'high', checked: false },
  { id: 'inp-5', category: 'Input Validation', text: 'CSRF tokens protect state-changing operations', priority: 'high', checked: false },

  // Server Config
  { id: 'srv-1', category: 'Server Config', text: 'Server version info is hidden from headers', priority: 'medium', checked: false },
  { id: 'srv-2', category: 'Server Config', text: 'Directory listing is disabled', priority: 'medium', checked: false },
  { id: 'srv-3', category: 'Server Config', text: 'Error pages don\'t reveal stack traces', priority: 'medium', checked: false },
  { id: 'srv-4', category: 'Server Config', text: 'Unnecessary ports are closed', priority: 'high', checked: false },
  { id: 'srv-5', category: 'Server Config', text: 'Software is up to date (no known CVEs)', priority: 'critical', checked: false },

  // Data Protection
  { id: 'dat-1', category: 'Data Protection', text: 'Sensitive data is encrypted at rest', priority: 'high', checked: false },
  { id: 'dat-2', category: 'Data Protection', text: 'Passwords are hashed with bcrypt/argon2', priority: 'critical', checked: false },
  { id: 'dat-3', category: 'Data Protection', text: 'API keys and secrets are not in frontend code', priority: 'critical', checked: false },
  { id: 'dat-4', category: 'Data Protection', text: 'Cookies have Secure and HttpOnly flags', priority: 'high', checked: false },
  { id: 'dat-5', category: 'Data Protection', text: 'Backup encryption is in place', priority: 'medium', checked: false },
];

function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'tools' | 'checklist' | 'guide' | 'resources'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(freeTools.map(t => t.category)))];
  const filteredTools = selectedCategory === 'all' ? freeTools : freeTools.filter(t => t.category === selectedCategory);

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const completedCount = checklist.filter(i => i.checked).length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const priorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'advanced': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-green-400 font-mono">
      {/* Header */}
      <header className="border-b border-green-400/20 bg-[#0a0a0f]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-400/10 border border-green-400/30 flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <h1 className="text-lg font-bold glow-green">DIY Security Audit</h1>
              <p className="text-xs text-green-400/40">Free tools & guides for self-assessment</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-green-400/50">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            100% Free & Open Source
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-green-400/10 bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            { id: 'home', label: '🏠 Home' },
            { id: 'tools', label: '🔧 Free Tools' },
            { id: 'checklist', label: '✅ Checklist' },
            { id: 'guide', label: '📖 Step-by-Step Guide' },
            { id: 'resources', label: '📚 Resources' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-3 text-sm whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'text-green-400 border-b-2 border-green-400 bg-green-400/5'
                  : 'text-green-400/50 hover:text-green-400/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* HOME */}
        {activeSection === 'home' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="text-center py-8">
              <h2 className="text-3xl md:text-4xl font-bold glow-green mb-4">
                Can't Afford a Pentest?
              </h2>
              <h3 className="text-xl text-green-400/70 mb-6">
                No Problem. Here's How to Audit Your Site for Free.
              </h3>
              <p className="max-w-2xl mx-auto text-green-400/50 text-sm leading-relaxed">
                This toolkit gives you everything you need to perform a basic security assessment 
                of your own website using free, open-source tools. Follow the step-by-step guide, 
                use the checklist, and leverage professional-grade tools — all at zero cost.
              </p>
            </div>

            {/* Quick Start Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveSection('tools')}
                className="text-left p-6 border border-green-400/20 rounded-lg bg-[#0d0d14] hover:border-green-400/40 transition-all group"
              >
                <span className="text-3xl mb-3 block">🔧</span>
                <h4 className="text-green-400 font-bold mb-2 group-hover:glow-green transition-all">Free Tools</h4>
                <p className="text-xs text-green-400/50">10 professional-grade security tools you can use right now, for free.</p>
              </button>
              <button
                onClick={() => setActiveSection('checklist')}
                className="text-left p-6 border border-green-400/20 rounded-lg bg-[#0d0d14] hover:border-green-400/40 transition-all group"
              >
                <span className="text-3xl mb-3 block">✅</span>
                <h4 className="text-green-400 font-bold mb-2 group-hover:glow-green transition-all">Security Checklist</h4>
                <p className="text-xs text-green-400/50">30+ items covering auth, TLS, headers, input validation, and more.</p>
              </button>
              <button
                onClick={() => setActiveSection('guide')}
                className="text-left p-6 border border-green-400/20 rounded-lg bg-[#0d0d14] hover:border-green-400/40 transition-all group"
              >
                <span className="text-3xl mb-3 block">📖</span>
                <h4 className="text-green-400 font-bold mb-2 group-hover:glow-green transition-all">Step-by-Step Guide</h4>
                <p className="text-xs text-green-400/50">Follow this ordered process to systematically test your site.</p>
              </button>
            </div>

            {/* Important Notice */}
            <div className="border border-yellow-400/30 rounded-lg p-5 bg-yellow-400/5">
              <h4 className="text-yellow-400 font-bold mb-2">⚠️ Important Legal Notice</h4>
              <ul className="text-xs text-yellow-400/70 space-y-1 list-disc list-inside">
                <li>Only test websites <strong>you own</strong> or have <strong>explicit written permission</strong> to test</li>
                <li>Unauthorized testing is illegal under computer fraud laws in most countries</li>
                <li>These tools are for defensive purposes — finding and fixing YOUR OWN vulnerabilities</li>
                <li>Never test third-party sites without authorization, even "just to check"</li>
              </ul>
            </div>

            {/* What to expect */}
            <div className="border border-green-400/20 rounded-lg p-6 bg-[#0d0d14]">
              <h4 className="text-green-400 font-bold mb-4">What You'll Be Able to Find</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {[
                  'Open ports and exposed services',
                  'Outdated software with known CVEs',
                  'Missing security headers',
                  'SSL/TLS configuration issues',
                  'Common web vulnerabilities (XSS, SQLi)',
                  'Subdomains that might be forgotten',
                  'Server misconfigurations',
                  'Information disclosure issues',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-green-400/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TOOLS */}
        {activeSection === 'tools' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-bold glow-green mb-2">Free Security Tools</h2>
              <p className="text-sm text-green-400/50">Professional-grade tools, completely free. Click any tool for usage instructions.</p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs rounded border transition-all ${
                    selectedCategory === cat
                      ? 'bg-green-400/20 text-green-400 border-green-400/50'
                      : 'text-green-400/50 border-green-400/10 hover:border-green-400/30'
                  }`}
                >
                  {cat === 'all' ? 'ALL' : cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tool Cards */}
            <div className="space-y-3">
              {filteredTools.map(tool => (
                <div
                  key={tool.name}
                  className="border border-green-400/10 rounded-lg bg-[#0d0d14] overflow-hidden hover:border-green-400/30 transition-all"
                >
                  <button
                    onClick={() => setExpandedTool(expandedTool === tool.name ? null : tool.name)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-green-400 font-bold">{tool.name}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded border ${difficultyColor(tool.difficulty)}`}>
                            {tool.difficulty}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded border border-green-400/20 text-green-400/60">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-xs text-green-400/60">{tool.description}</p>
                      </div>
                      <span className="text-green-400/40 ml-4">{expandedTool === tool.name ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {expandedTool === tool.name && (
                    <div className="px-4 pb-4 border-t border-green-400/10 pt-4 space-y-3">
                      <div>
                        <span className="text-xs text-green-400/50">Features:</span>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {tool.features.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-green-400/5 border border-green-400/10 rounded text-green-400/70">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      {tool.command && (
                        <div>
                          <span className="text-xs text-green-400/50">How to use:</span>
                          <div className="mt-1 p-3 bg-[#0a0a0f] rounded border border-green-400/10 text-xs text-cyan-400">
                            $ {tool.command}
                          </div>
                        </div>
                      )}
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 text-xs rounded border border-green-400/30 text-green-400 hover:bg-green-400/10 transition-all"
                      >
                        🔗 Visit {tool.name} →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHECKLIST */}
        {activeSection === 'checklist' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold glow-green mb-1">Security Checklist</h2>
                <p className="text-sm text-green-400/50">Track your progress. Check items as you verify/fix them.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">{progressPercent}%</div>
                <div className="text-xs text-green-400/50">{completedCount}/{totalCount} complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist by Category */}
            {Array.from(new Set(checklist.map(i => i.category))).map(category => {
              const items = checklist.filter(i => i.category === category);
              const completed = items.filter(i => i.checked).length;
              return (
                <div key={category} className="border border-green-400/10 rounded-lg bg-[#0d0d14] overflow-hidden">
                  <div className="px-4 py-3 border-b border-green-400/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-green-400">{category}</h3>
                    <span className="text-xs text-green-400/50">{completed}/{items.length}</span>
                  </div>
                  <div className="divide-y divide-green-400/5">
                    {items.map(item => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-green-400/5 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleCheck(item.id)}
                          className="w-4 h-4 accent-green-400 rounded"
                        />
                        <span className={`text-sm flex-1 ${item.checked ? 'text-green-400/30 line-through' : 'text-green-400/80'}`}>
                          {item.text}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded border ${priorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* GUIDE */}
        {activeSection === 'guide' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-bold glow-green mb-2">Step-by-Step Security Audit Guide</h2>
              <p className="text-sm text-green-400/50">Follow these steps in order. Each builds on the previous one.</p>
            </div>

            {[
              {
                step: 1,
                title: 'Reconnaissance — Know Your Attack Surface',
                duration: '15-30 min',
                content: 'Before testing, understand what\'s exposed. Run Nmap to find open ports and services. Use WhatWeb to identify technologies. Check for subdomains with Sublist3r.',
                commands: [
                  'nmap -sV -sC yourdomain.com',
                  'whatweb yourdomain.com',
                  'python sublist3r.py -d yourdomain.com',
                ],
                tip: 'Document everything you find. This is your baseline.',
              },
              {
                step: 2,
                title: 'SSL/TLS Check — Is Your Encryption Strong?',
                duration: '5 min',
                content: 'Check your HTTPS configuration. This is quick and catches many issues. Use SSL Labs for a thorough online check, or testssl.sh for command-line detail.',
                commands: [
                  '# Visit: https://www.ssllabs.com/ssltest/',
                  '# Or run locally:',
                  './testssl.sh https://yourdomain.com',
                ],
                tip: 'Aim for grade A or A+. Anything below B needs attention.',
              },
              {
                step: 3,
                title: 'Security Headers — Quick Wins',
                duration: '5 min',
                content: 'Check your HTTP security headers. These are easy to fix and provide significant protection. Use Mozilla Observatory or SecurityHeaders.com.',
                commands: [
                  '# Visit: https://observatory.mozilla.org/',
                  '# Or: https://securityheaders.com/',
                  '',
                  '# Quick manual check:',
                  'curl -I https://yourdomain.com',
                ],
                tip: 'Most header issues can be fixed in minutes with a config change.',
              },
              {
                step: 4,
                title: 'Web Vulnerability Scan — Find the Big Issues',
                duration: '30-60 min',
                content: 'Run OWASP ZAP or Nikto to find common web vulnerabilities like XSS, SQL injection, and misconfigurations. ZAP has a nice GUI; Nikto is command-line only.',
                commands: [
                  '# OWASP ZAP: Download, install, enter URL, click "Attack"',
                  '',
                  '# Nikto (command line):',
                  'nikto -h https://yourdomain.com -o report.html',
                ],
                tip: 'Don\'t panic at the results. Many "findings" may be false positives. Verify each one.',
              },
              {
                step: 5,
                title: 'WordPress-Specific (if applicable)',
                duration: '15-30 min',
                content: 'If your site runs WordPress, use WPScan to check for vulnerable plugins, themes, and user enumeration issues.',
                commands: [
                  '# Get free API token at: https://wpscan.com/api',
                  'wpscan --url https://yourdomain.com --api-token YOUR_TOKEN',
                  'wpscan --url https://yourdomain.com --enumerate u',
                ],
                tip: 'Keep WordPress, plugins, and themes updated. This fixes 90% of WP issues.',
              },
              {
                step: 6,
                title: 'Manual Testing — What Scanners Miss',
                duration: '30-60 min',
                content: 'Scanners can\'t catch everything. Manually test: login forms (try common passwords), password reset flows, access controls (try accessing /admin without login), and file uploads.',
                commands: [
                  '# Test login:',
                  'curl -X POST https://yourdomain.com/login -d "user=admin&pass=admin"',
                  '',
                  '# Check for common paths:',
                  'curl -I https://yourdomain.com/admin',
                  'curl -I https://yourdomain.com/.env',
                  'curl -I https://yourdomain.com/robots.txt',
                  'curl -I https://yourdomain.com/sitemap.xml',
                ],
                tip: 'Think like an attacker. What would YOU try if you wanted to break in?',
              },
              {
                step: 7,
                title: 'Review & Fix — Prioritize by Risk',
                duration: 'Ongoing',
                content: 'Compile all findings. Prioritize: Critical (fix immediately) → High (fix this week) → Medium (fix this month) → Low (fix when possible). Use the checklist to track progress.',
                commands: [
                  '# Create a simple tracking spreadsheet:',
                  '# | Finding | Severity | Status | Fix Date |',
                  '# | RCE in Apache | Critical | Open | ASAP |',
                  '# | Missing HSTS | High | Fixed | 2024-01-15 |',
                ],
                tip: 'Fix critical issues TODAY. Don\'t wait for a "perfect" fix — a partial fix is better than no fix.',
              },
            ].map(step => (
              <div key={step.step} className="border border-green-400/20 rounded-lg bg-[#0d0d14] overflow-hidden">
                <div className="px-5 py-4 border-b border-green-400/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center text-sm font-bold text-green-400">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-green-400">{step.title}</h3>
                      <span className="text-xs text-green-400/40">⏱️ {step.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-sm text-green-400/70">{step.content}</p>
                  <div className="bg-[#0a0a0f] rounded border border-green-400/10 p-3">
                    {step.commands.map((cmd, i) => (
                      <div key={i} className="text-xs text-cyan-400/80 leading-relaxed">
                        {cmd || '\u00A0'}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-green-400/5 rounded border border-green-400/10">
                    <span className="text-green-400 text-sm">💡</span>
                    <span className="text-xs text-green-400/60">{step.tip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESOURCES */}
        {activeSection === 'resources' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-2xl font-bold glow-green mb-2">Learning Resources</h2>
              <p className="text-sm text-green-400/50">Free resources to deepen your security knowledge.</p>
            </div>

            {[
              {
                title: '📚 OWASP Top 10',
                description: 'The definitive list of the 10 most critical web application security risks. Start here.',
                links: [
                  { name: 'OWASP Top 10 (2021)', url: 'https://owasp.org/www-project-top-ten/' },
                  { name: 'OWASP Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
                  { name: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/' },
                ],
              },
              {
                title: '🎓 Free Training',
                description: 'Hands-on practice in safe, legal environments.',
                links: [
                  { name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security' },
                  { name: 'Hack The Box (Free Tier)', url: 'https://www.hackthebox.com/' },
                  { name: 'TryHackMe (Free Path)', url: 'https://tryhackme.com/' },
                  { name: 'OWASP Juice Shop', url: 'https://owasp.org/www-project-juice-shop/' },
                ],
              },
              {
                title: '🔍 Online Scanners (No Install Needed)',
                description: 'Quick checks you can run right now in your browser.',
                links: [
                  { name: 'SSL Labs Test', url: 'https://www.ssllabs.com/ssltest/' },
                  { name: 'Mozilla Observatory', url: 'https://observatory.mozilla.org/' },
                  { name: 'Security Headers', url: 'https://securityheaders.com/' },
                  { name: 'Censys (search your domain)', url: 'https://search.censys.io/' },
                  { name: 'Shodan (search your IP)', url: 'https://www.shodan.io/' },
                ],
              },
              {
                title: '📰 Stay Updated',
                description: 'Security news and vulnerability databases.',
                links: [
                  { name: 'NVD (National Vulnerability Database)', url: 'https://nvd.nist.gov/' },
                  { name: 'CVE Details', url: 'https://www.cvedetails.com/' },
                  { name: 'The Hacker News', url: 'https://thehackernews.com/' },
                  { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/' },
                ],
              },
              {
                title: '🛠️ Quick Fix Guides',
                description: 'How to fix common issues you\'ll find.',
                links: [
                  { name: 'Enable HSTS (nginx)', url: 'https://www.nginx.com/blog/http-strict-transport-security-hsts-and-nginx/' },
                  { name: 'Security Headers Guide', url: 'https://owasp.org/www-project-secure-headers/' },
                  { name: 'CSP Configuration', url: 'https://content-security-policy.com/' },
                  { name: 'OWASP ASVS (Verification Standard)', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
                ],
              },
            ].map(section => (
              <div key={section.title} className="border border-green-400/20 rounded-lg p-5 bg-[#0d0d14]">
                <h3 className="text-green-400 font-bold mb-1">{section.title}</h3>
                <p className="text-xs text-green-400/50 mb-3">{section.description}</p>
                <div className="space-y-2">
                  {section.links.map(link => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cyan-400/80 hover:text-cyan-400 transition-colors"
                    >
                      <span className="text-green-400/40">→</span>
                      {link.name}
                      <span className="text-xs text-green-400/20">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}

            {/* Low-cost alternatives */}
            <div className="border border-cyan-400/20 rounded-lg p-5 bg-cyan-400/5">
              <h3 className="text-cyan-400 font-bold mb-2">💰 Low-Cost Alternatives (If Budget Allows Later)</h3>
              <div className="text-xs text-cyan-400/70 space-y-2">
                <p><strong>Automated scanners ($0-50/mo):</strong> Detectify, Intruder.io, or Snyk for continuous monitoring</p>
                <p><strong>Bug bounty platforms:</strong> HackerOne or Bugcrowd — pay only for findings, not for the test itself</p>
                <p><strong>Freelance pentesters:</strong> Platforms like Upwork — you can find affordable testers for a one-time assessment</p>
                <p><strong>Community audits:</strong> Some security communities offer free reviews for open-source projects</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-green-400/10 mt-12 py-6 text-center">
        <p className="text-xs text-green-400/30">
          Built to help website owners secure their sites for free.
        </p>
        <p className="text-xs text-green-400/20 mt-1">
          Always test only your own systems. Unauthorized access is illegal.
        </p>
      </footer>
    </div>
  );
}

export default App;

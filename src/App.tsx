import { useState, useEffect, useRef } from 'react';

// Types
interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  cvss: number;
  category: string;
  status: 'open' | 'remediated' | 'accepted';
}

interface ScanLog {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface ScanStats {
  hostsFound: number;
  portsOpen: number;
  vulnsFound: number;
  servicesDetected: number;
}

// Mock data
const mockVulnerabilities: Vulnerability[] = [
  { id: 'CVE-2024-1234', severity: 'critical', title: 'Remote Code Execution in Apache Struts', description: 'A critical RCE vulnerability allowing attackers to execute arbitrary commands on the server.', cvss: 9.8, category: 'Web Application', status: 'open' },
  { id: 'CVE-2024-5678', severity: 'high', title: 'SQL Injection in Login Form', description: 'Unsanitized user input allows SQL injection attacks on the authentication endpoint.', cvss: 8.6, category: 'Web Application', status: 'open' },
  { id: 'CVE-2024-9012', severity: 'high', title: 'Outdated OpenSSL Version', description: 'Server running OpenSSL 1.0.2 which has known vulnerabilities.', cvss: 7.5, category: 'Infrastructure', status: 'open' },
  { id: 'CVE-2024-3456', severity: 'medium', title: 'Missing Security Headers', description: 'Several important security headers are not configured (CSP, X-Frame-Options, etc.).', cvss: 5.3, category: 'Web Application', status: 'open' },
  { id: 'CVE-2024-7890', severity: 'medium', title: 'Directory Listing Enabled', description: 'Web server allows directory listing which may expose sensitive files.', cvss: 5.0, category: 'Configuration', status: 'remediated' },
  { id: 'CVE-2024-2345', severity: 'low', title: 'Server Version Disclosure', description: 'HTTP headers reveal detailed server version information.', cvss: 3.1, category: 'Information Disclosure', status: 'open' },
  { id: 'CVE-2024-6789', severity: 'low', title: 'Cookie Without Secure Flag', description: 'Session cookies are set without the Secure flag.', cvss: 3.7, category: 'Web Application', status: 'open' },
  { id: 'CVE-2024-0123', severity: 'info', title: 'DNS Zone Transfer Possible', description: 'DNS zone transfer is allowed from any host.', cvss: 0, category: 'Network', status: 'accepted' },
];

const generateScanLogs = (): ScanLog[] => [
  { timestamp: '14:32:01', message: 'Initializing scan engine...', type: 'info' },
  { timestamp: '14:32:02', message: 'Loading vulnerability database (v2024.12.3)...', type: 'info' },
  { timestamp: '14:32:03', message: 'Target resolved: example.com → 192.168.1.100', type: 'info' },
  { timestamp: '14:32:05', message: 'Starting Nmap port scan (1-65535)...', type: 'info' },
  { timestamp: '14:32:12', message: 'Port 22/tcp open - SSH (OpenSSH 8.9)', type: 'success' },
  { timestamp: '14:32:13', message: 'Port 80/tcp open - HTTP (Apache 2.4.52)', type: 'success' },
  { timestamp: '14:32:14', message: 'Port 443/tcp open - HTTPS (nginx 1.18.0)', type: 'success' },
  { timestamp: '14:32:15', message: 'Port 3306/tcp open - MySQL 8.0.32', type: 'warning' },
  { timestamp: '14:32:16', message: 'Port 8080/tcp open - HTTP Proxy', type: 'warning' },
  { timestamp: '14:32:20', message: 'Running service detection scripts...', type: 'info' },
  { timestamp: '14:32:25', message: 'OS fingerprint: Linux 5.15 (Ubuntu 22.04)', type: 'info' },
  { timestamp: '14:32:30', message: 'Starting vulnerability assessment...', type: 'info' },
  { timestamp: '14:32:35', message: '[CRITICAL] CVE-2024-1234: RCE in Apache Struts detected', type: 'error' },
  { timestamp: '14:32:38', message: '[HIGH] CVE-2024-5678: SQL Injection vector found', type: 'error' },
  { timestamp: '14:32:42', message: '[HIGH] CVE-2024-9012: Outdated OpenSSL detected', type: 'warning' },
  { timestamp: '14:32:45', message: '[MEDIUM] Missing security headers detected', type: 'warning' },
  { timestamp: '14:32:48', message: '[MEDIUM] Directory listing enabled on /assets/', type: 'warning' },
  { timestamp: '14:32:50', message: '[LOW] Server version disclosure in headers', type: 'info' },
  { timestamp: '14:32:52', message: '[LOW] Insecure cookie configuration', type: 'info' },
  { timestamp: '14:32:55', message: 'Running web application tests...', type: 'info' },
  { timestamp: '14:33:01', message: 'XSS testing: No reflected XSS found', type: 'success' },
  { timestamp: '14:33:05', message: 'CSRF testing: Token validation present', type: 'success' },
  { timestamp: '14:33:10', message: 'SSL/TLS analysis: Grade B (TLS 1.2 min)', type: 'warning' },
  { timestamp: '14:33:15', message: 'Scan complete. Generating report...', type: 'success' },
];

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scan' | 'vulnerabilities' | 'network' | 'report'>('dashboard');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [stats, setStats] = useState<ScanStats>({ hostsFound: 0, portsOpen: 0, vulnsFound: 0, servicesDetected: 0 });
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [scanLogs]);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs([]);
    setStats({ hostsFound: 0, portsOpen: 0, vulnsFound: 0, servicesDetected: 0 });

    const allLogs = generateScanLogs();
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < allLogs.length) {
        setScanLogs(prev => [...prev, allLogs[currentIndex]]);
        setScanProgress(Math.round(((currentIndex + 1) / allLogs.length) * 100));

        // Update stats progressively
        if (currentIndex === 3) setStats(s => ({ ...s, hostsFound: 1 }));
        if (currentIndex === 8) setStats(s => ({ ...s, portsOpen: 5 }));
        if (currentIndex === 10) setStats(s => ({ ...s, servicesDetected: 5 }));
        if (currentIndex === 12) setStats(s => ({ ...s, vulnsFound: 1 }));
        if (currentIndex === 13) setStats(s => ({ ...s, vulnsFound: 2 }));
        if (currentIndex === 14) setStats(s => ({ ...s, vulnsFound: 3 }));
        if (currentIndex === 15) setStats(s => ({ ...s, vulnsFound: 4 }));
        if (currentIndex === 16) setStats(s => ({ ...s, vulnsFound: 5 }));
        if (currentIndex === 17) setStats(s => ({ ...s, vulnsFound: 6 }));
        if (currentIndex === 18) setStats(s => ({ ...s, vulnsFound: 7 }));
        if (currentIndex === 23) setStats(s => ({ ...s, vulnsFound: 8 }));

        currentIndex++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 400);
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'info': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const logTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-green-400 terminal-text scan-grid">
      {/* Header */}
      <header className="border-b border-green-400/20 bg-[#0a0a0f]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-green-400/20 flex items-center justify-center">
              <span className="text-green-400 text-lg">⚡</span>
            </div>
            <h1 className="text-xl font-bold glow-green">CyberScan</h1>
            <span className="text-xs text-green-400/50 ml-2">v3.2.1</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-green-400/60">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse"></span>
              System Online
            </span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-green-400/10 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '' },
            { id: 'scan', label: '🔍 Scanner', icon: '' },
            { id: 'vulnerabilities', label: '🛡️ Vulnerabilities', icon: '' },
            { id: 'network', label: '🌐 Network Map', icon: '' },
            { id: 'report', label: '📋 Report', icon: '' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm transition-all ${
                activeTab === tab.id
                  ? 'text-green-400 border-b-2 border-green-400 bg-green-400/5'
                  : 'text-green-400/50 hover:text-green-400/80 hover:bg-green-400/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardView stats={stats} isScanning={isScanning} />}
        {activeTab === 'scan' && (
          <ScanView
            targetUrl={targetUrl}
            setTargetUrl={setTargetUrl}
            isScanning={isScanning}
            scanProgress={scanProgress}
            scanLogs={scanLogs}
            startScan={startScan}
            logContainerRef={logContainerRef}
            logTypeColor={logTypeColor}
          />
        )}
        {activeTab === 'vulnerabilities' && <VulnerabilitiesView severityColor={severityColor} />}
        {activeTab === 'network' && <NetworkView />}
        {activeTab === 'report' && <ReportView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-green-400/10 mt-8 py-4 text-center text-xs text-green-400/30">
        <p>⚠️ This is a DEMO interface. No actual scanning is performed. For educational purposes only.</p>
        <p className="mt-1">Always obtain proper authorization before conducting security assessments.</p>
      </footer>
    </div>
  );
}

// Dashboard View
function DashboardView({ stats, isScanning }: { stats: ScanStats; isScanning: boolean }) {
  const riskScore = 72;
  
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold glow-green">Security Overview</h2>
        <span className="text-xs text-green-400/50">Last scan: 2 minutes ago</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Hosts Found" value={stats.hostsFound || 3} icon="🖥️" color="cyan" />
        <StatCard title="Open Ports" value={stats.portsOpen || 12} icon="🔌" color="green" />
        <StatCard title="Vulnerabilities" value={stats.vulnsFound || 8} icon="⚠️" color="red" />
        <StatCard title="Services" value={stats.servicesDetected || 7} icon="⚙️" color="yellow" />
      </div>

      {/* Risk Score & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score */}
        <div className="lg:col-span-1 border border-green-400/20 rounded-lg p-6 bg-[#0d0d14]">
          <h3 className="text-sm text-green-400/70 mb-4">RISK SCORE</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a2e" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={riskScore > 70 ? '#ff4444' : riskScore > 40 ? '#ffaa00' : '#00ff41'}
                  strokeWidth="8"
                  strokeDasharray={`${riskScore * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-3xl font-bold ${riskScore > 70 ? 'text-red-400 glow-red' : 'text-yellow-400'}`}>
                  {riskScore}
                </span>
                <span className="text-xs text-green-400/50">/100</span>
              </div>
            </div>
          </div>
          <p className="text-center mt-4 text-sm text-red-400">High Risk</p>
        </div>

        {/* Severity Breakdown */}
        <div className="lg:col-span-2 border border-green-400/20 rounded-lg p-6 bg-[#0d0d14]">
          <h3 className="text-sm text-green-400/70 mb-4">SEVERITY BREAKDOWN</h3>
          <div className="space-y-4">
            <SeverityBar label="Critical" count={1} max={8} color="red" />
            <SeverityBar label="High" count={2} max={8} color="orange" />
            <SeverityBar label="Medium" count={2} max={8} color="yellow" />
            <SeverityBar label="Low" count={2} max={8} color="blue" />
            <SeverityBar label="Info" count={1} max={8} color="gray" />
          </div>
        </div>
      </div>

      {/* Recent Findings */}
      <div className="border border-green-400/20 rounded-lg p-6 bg-[#0d0d14]">
        <h3 className="text-sm text-green-400/70 mb-4">RECENT FINDINGS</h3>
        <div className="space-y-2">
          {mockVulnerabilities.slice(0, 4).map(v => (
            <div key={v.id} className="flex items-center justify-between p-3 rounded border border-green-400/10 bg-[#0a0a0f]">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 text-xs rounded border ${
                  v.severity === 'critical' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                  v.severity === 'high' ? 'text-orange-400 border-orange-400/30 bg-orange-400/10' :
                  'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                }`}>
                  {v.severity.toUpperCase()}
                </span>
                <span className="text-sm text-green-400/80">{v.title}</span>
              </div>
              <span className="text-xs text-green-400/40">{v.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scan Status */}
      {isScanning && (
        <div className="border border-cyan-400/30 rounded-lg p-4 bg-cyan-400/5 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-cyan-400 text-sm">Scan in progress...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    cyan: 'border-cyan-400/30 text-cyan-400',
    green: 'border-green-400/30 text-green-400',
    red: 'border-red-400/30 text-red-400',
    yellow: 'border-yellow-400/30 text-yellow-400',
  };

  return (
    <div className={`border rounded-lg p-4 bg-[#0d0d14] ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-xs mt-2 text-green-400/50">{title}</p>
    </div>
  );
}

// Severity Bar
function SeverityBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    gray: 'bg-gray-500',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-green-400/70 w-16">{label}</span>
      <div className="flex-1 h-3 bg-[#1a1a2e] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorMap[color]} transition-all duration-1000`}
          style={{ width: `${(count / max) * 100}%` }}
        />
      </div>
      <span className="text-xs text-green-400/70 w-8 text-right">{count}</span>
    </div>
  );
}

// Scan View
function ScanView({
  targetUrl, setTargetUrl, isScanning, scanProgress, scanLogs, startScan, logContainerRef, logTypeColor
}: {
  targetUrl: string;
  setTargetUrl: (url: string) => void;
  isScanning: boolean;
  scanProgress: number;
  scanLogs: ScanLog[];
  startScan: () => void;
  logContainerRef: React.RefObject<HTMLDivElement>;
  logTypeColor: (type: string) => string;
}) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold glow-green">Vulnerability Scanner</h2>

      {/* Target Input */}
      <div className="border border-green-400/20 rounded-lg p-6 bg-[#0d0d14]">
        <label className="text-sm text-green-400/70 block mb-2">TARGET URL</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="flex-1 bg-[#0a0a0f] border border-green-400/20 rounded px-4 py-2 text-green-400 focus:outline-none focus:border-green-400/50 placeholder-green-400/30"
            placeholder="https://target.com"
            disabled={isScanning}
          />
          <button
            onClick={startScan}
            disabled={isScanning}
            className={`px-6 py-2 rounded font-bold transition-all ${
              isScanning
                ? 'bg-yellow-400/20 text-yellow-400 cursor-not-allowed'
                : 'bg-green-400/20 text-green-400 hover:bg-green-400/30 border border-green-400/30'
            }`}
          >
            {isScanning ? '⏳ Scanning...' : '🚀 Start Scan'}
          </button>
        </div>

        {/* Scan Options */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Port Scan', 'Vuln Assessment', 'Web App Test', 'SSL Analysis'].map(opt => (
            <label key={opt} className="flex items-center gap-2 text-xs text-green-400/70 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-green-400" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <div className="border border-green-400/20 rounded-lg p-4 bg-[#0d0d14]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-400/70">Scan Progress</span>
            <span className="text-sm text-green-400">{scanProgress}%</span>
          </div>
          <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div className="border border-green-400/20 rounded-lg bg-[#0a0a0f] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-green-400/10 bg-[#0d0d14]">
          <span className="w-3 h-3 rounded-full bg-red-500/70"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500/70"></span>
          <span className="w-3 h-3 rounded-full bg-green-500/70"></span>
          <span className="text-xs text-green-400/50 ml-2">scan-output.log</span>
        </div>
        <div
          ref={logContainerRef}
          className="p-4 h-80 overflow-y-auto text-xs leading-relaxed"
        >
          {scanLogs.length === 0 ? (
            <div className="text-green-400/40">
              <p>$ cyberscan --target {targetUrl} --full-scan</p>
              <p className="mt-1">Waiting for scan to start...</p>
              <span className="animate-blink">█</span>
            </div>
          ) : (
            scanLogs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-green-400/30">[{log.timestamp}]</span>
                <span className={logTypeColor(log.type)}>{log.message}</span>
              </div>
            ))
          )}
          {isScanning && <span className="animate-blink text-green-400">█</span>}
        </div>
      </div>
    </div>
  );
}

// Vulnerabilities View
function VulnerabilitiesView({ severityColor }: { severityColor: (s: string) => string }) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? mockVulnerabilities : mockVulnerabilities.filter(v => v.severity === filter);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold glow-green">Vulnerability Findings</h2>
        <span className="text-sm text-green-400/50">{filtered.length} findings</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'critical', 'high', 'medium', 'low', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded border transition-all ${
              filter === f
                ? 'bg-green-400/20 text-green-400 border-green-400/50'
                : 'text-green-400/50 border-green-400/10 hover:border-green-400/30'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Vulnerability List */}
      <div className="space-y-3">
        {filtered.map((v, i) => (
          <div
            key={v.id}
            className="border border-green-400/10 rounded-lg p-4 bg-[#0d0d14] hover:border-green-400/30 transition-all"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs rounded border ${severityColor(v.severity)}`}>
                    {v.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-green-400/40">{v.id}</span>
                  <span className="text-xs text-green-400/40">CVSS: {v.cvss}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    v.status === 'open' ? 'bg-red-400/10 text-red-400' :
                    v.status === 'remediated' ? 'bg-green-400/10 text-green-400' :
                    'bg-yellow-400/10 text-yellow-400'
                  }`}>
                    {v.status}
                  </span>
                </div>
                <h4 className="text-sm text-green-400 font-bold">{v.title}</h4>
                <p className="text-xs text-green-400/50 mt-1">{v.description}</p>
                <span className="text-xs text-green-400/30 mt-2 inline-block">Category: {v.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Network View
function NetworkView() {
  const nodes = [
    { id: 'web-server', label: 'Web Server', x: 50, y: 20, type: 'server', status: 'vulnerable' },
    { id: 'db-server', label: 'Database', x: 25, y: 50, type: 'database', status: 'open' },
    { id: 'firewall', label: 'Firewall', x: 50, y: 50, type: 'firewall', status: 'secure' },
    { id: 'api-server', label: 'API Server', x: 75, y: 50, type: 'server', status: 'vulnerable' },
    { id: 'cdn', label: 'CDN', x: 50, y: 80, type: 'cloud', status: 'secure' },
    { id: 'dns', label: 'DNS Server', x: 20, y: 80, type: 'server', status: 'warning' },
    { id: 'mail', label: 'Mail Server', x: 80, y: 80, type: 'server', status: 'secure' },
  ];

  const connections = [
    ['web-server', 'firewall'],
    ['firewall', 'db-server'],
    ['firewall', 'api-server'],
    ['web-server', 'cdn'],
    ['cdn', 'dns'],
    ['cdn', 'mail'],
    ['api-server', 'db-server'],
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'vulnerable': return '#ff4444';
      case 'warning': return '#ffaa00';
      case 'open': return '#ff8800';
      case 'secure': return '#00ff41';
      default: return '#00d4ff';
    }
  };

  const nodeIcon = (type: string) => {
    switch (type) {
      case 'server': return '🖥️';
      case 'database': return '🗄️';
      case 'firewall': return '🛡️';
      case 'cloud': return '☁️';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-2xl font-bold glow-green">Network Topology</h2>

      <div className="border border-green-400/20 rounded-lg p-6 bg-[#0d0d14]">
        <div className="relative w-full h-96 bg-[#0a0a0f] rounded-lg overflow-hidden border border-green-400/10">
          {/* Grid background */}
          <div className="absolute inset-0 scan-grid opacity-50"></div>

          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full">
            {connections.map(([from, to], i) => {
              const fromNode = nodes.find(n => n.id === from);
              const toNode = nodes.find(n => n.id === to);
              if (!fromNode || !toNode) return null;
              return (
                <line
                  key={i}
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke="#00ff41"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl border-2 animate-pulse-glow"
                style={{ borderColor: statusColor(node.status), backgroundColor: `${statusColor(node.status)}15` }}
              >
                {nodeIcon(node.type)}
              </div>
              <span className="text-xs text-green-400/70 whitespace-nowrap">{node.label}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusColor(node.status) }}
              ></span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-xs text-green-400/50">Vulnerable</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-xs text-green-400/50">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-xs text-green-400/50">Secure</span>
          </div>
        </div>
      </div>

      {/* Host Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.filter(n => n.status !== 'secure').map(node => (
          <div key={node.id} className="border border-green-400/10 rounded-lg p-4 bg-[#0d0d14]">
            <div className="flex items-center gap-2 mb-2">
              <span>{nodeIcon(node.type)}</span>
              <span className="text-sm text-green-400 font-bold">{node.label}</span>
            </div>
            <div className="text-xs text-green-400/50 space-y-1">
              <p>IP: 192.168.1.{Math.floor(Math.random() * 254) + 1}</p>
              <p>Status: <span className={node.status === 'vulnerable' ? 'text-red-400' : 'text-yellow-400'}>{node.status}</span></p>
              <p>OS: Linux 5.15</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Report View
function ReportView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold glow-green">Scan Report</h2>
        <button className="px-4 py-2 text-xs rounded border border-green-400/30 text-green-400 hover:bg-green-400/10 transition-all">
          📥 Export PDF
        </button>
      </div>

      {/* Report Summary */}
      <div className="border border-green-400/20 rounded-lg p-6 bg-[#0d0d14]">
        <h3 className="text-lg text-green-400 mb-4">Executive Summary</h3>
        <div className="text-sm text-green-400/70 space-y-3">
          <p>
            <span className="text-green-400">Target:</span> example.com (192.168.1.100)
          </p>
          <p>
            <span className="text-green-400">Scan Date:</span> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </p>
          <p>
            <span className="text-green-400">Duration:</span> 47 seconds
          </p>
          <p>
            <span className="text-green-400">Scope:</span> Full vulnerability assessment including port scanning, service detection, and web application testing.
          </p>
          <div className="mt-4 p-3 border border-red-400/20 rounded bg-red-400/5">
            <p className="text-red-400 font-bold">⚠️ Overall Risk: HIGH</p>
            <p className="text-red-400/70 mt-1">
              8 vulnerabilities discovered, including 1 critical remote code execution vulnerability that requires immediate attention.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="border border-green-400/20 rounded-lg p-6 bg-[#0d0d14]">
        <h3 className="text-lg text-green-400 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {[
            { priority: 'IMMEDIATE', text: 'Patch Apache Struts to latest version to remediate RCE vulnerability', color: 'red' },
            { priority: 'HIGH', text: 'Implement input validation and parameterized queries to prevent SQL injection', color: 'orange' },
            { priority: 'HIGH', text: 'Update OpenSSL to version 3.x to address known vulnerabilities', color: 'orange' },
            { priority: 'MEDIUM', text: 'Configure security headers (CSP, X-Frame-Options, HSTS)', color: 'yellow' },
            { priority: 'MEDIUM', text: 'Disable directory listing on web server', color: 'yellow' },
            { priority: 'LOW', text: 'Remove server version information from HTTP headers', color: 'blue' },
          ].map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded border border-green-400/10 bg-[#0a0a0f]">
              <span className={`px-2 py-0.5 text-xs rounded border ${
                rec.color === 'red' ? 'text-red-400 border-red-400/30' :
                rec.color === 'orange' ? 'text-orange-400 border-orange-400/30' :
                rec.color === 'yellow' ? 'text-yellow-400 border-yellow-400/30' :
                'text-blue-400 border-blue-400/30'
              }`}>
                {rec.priority}
              </span>
              <span className="text-sm text-green-400/70">{rec.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border border-yellow-400/20 rounded-lg p-4 bg-yellow-400/5">
        <p className="text-xs text-yellow-400/70">
          ⚠️ <strong>DISCLAIMER:</strong> This is a demo/mock report. No actual vulnerability scanning was performed. 
          This interface is for educational and demonstration purposes only. Always obtain proper written authorization 
          before conducting any security assessment on systems you do not own.
        </p>
      </div>
    </div>
  );
}

export default App;

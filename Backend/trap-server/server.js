import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.TRAP_SERVER_PORT || 3001
const MAIN_SERVER_URL = `http://localhost:${process.env.MAIN_SERVER_PORT || 3000}`

// Middleware
app.use(cors())
app.use(express.text())
app.use(express.json())

// Honeypot Traps
const traps = {
  ssh: 'SSH-2.0-OpenSSH_7.4\r\n',
  http: '<html><body><h1>Default Web Server</h1></body></html>',
  ftp: '220 FTP Server Ready\r\n',
  telnet: 'Welcome to Telnet Server\r\n'
}

// Classification function
function classifySeverity(req) {
  const userAgent = req.get('user-agent') || ''
  const url = req.originalUrl

  if (userAgent.includes('nmap') || userAgent.includes('masscan') || userAgent.includes('shodan')) {
    return 'Critical'
  }
  if (url.includes('/admin') || url.includes('/shell') || url.includes('union select')) {
    return 'High'
  }
  if (url.includes('/config') || url.includes('/backup') || url.includes('..') || req.method === 'TRACE') {
    return 'Medium'
  }
  return 'Low'
}

// Generic trap handler
async function trapHandler(req, res, service) {
  const severity = classifySeverity(req)
  const log = {
    attackerIp: req.ip || req.connection.remoteAddress,
    service,
    endpoint: req.originalUrl,
    severity,
    userAgent: req.get('user-agent') || 'Unknown',
    timestamp: new Date().toISOString(),
    headers: JSON.stringify(req.headers),
    method: req.method,
    body: req.body || ''
  }

  console.log(`[${service.toUpperCase()}] ${severity} - ${log.attackerIp}`)

  // Send log to main server
  try {
    await axios.post(`${MAIN_SERVER_URL}/api/trap/log`, log)
  } catch (error) {
    console.error('Failed to send log to main server:', error)
  }

  // Send trap response
  res.type('text/plain').send(traps[service] || 'Service Active')
}

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Adaptive Honeypot System - Trap Server',
    version: '2.0.0',
    status: 'running',
    traps: ['ssh', 'http', 'ftp', 'telnet']
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mainServerConnected: true
  })
})

async function checkMainServer() {
  try {
    await axios.get(`${MAIN_SERVER_URL}/health`)
    return true
  } catch {
    return false
  }
}

// Honeypot trap endpoints
app.all('/honeypot/ssh', (req, res) => trapHandler(req, res, 'ssh'))
app.all('/honeypot/http', (req, res) => trapHandler(req, res, 'http'))
app.all('/honeypot/ftp', (req, res) => trapHandler(req, res, 'ftp'))
app.all('/honeypot/telnet', (req, res) => trapHandler(req, res, 'telnet'))

// Catch-all for any suspicious activity
app.all('*', (req, res) => {
  const severity = classifySeverity(req)
  console.log(`[UNKNOWN] ${severity} - ${req.ip} - ${req.method} ${req.originalUrl}`)
  trapHandler(req, res, 'unknown')
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║       Adaptive Honeypot System - Trap Server                   ║
╠════════════════════════════════════════════════════════════════╣
║ Server: http://localhost:${PORT}                              │
║ Status: Running                                                 ║
║ Services:                                                       ║
║   SSH:    /honeypot/ssh                                         ║
║   HTTP:   /honeypot/http                                        ║
║   FTP:    /honeypot/ftp                                         ║
║   Telnet: /honeypot/telnet                                      ║
╚════════════════════════════════════════════════════════════════╝
  `)
})

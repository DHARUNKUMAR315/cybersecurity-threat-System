import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import net from 'net'

dotenv.config()

const app = express()
const PORT = process.env.TRAP_SERVER_PORT || 3001
const MAIN_SERVER_URL = `http://localhost:${process.env.MAIN_SERVER_PORT || 3000}`

// Middleware
app.use(cors())
app.use(express.text())
app.use(express.json())

// Honeypot Traps Responses
const traps = {
  ssh: 'SSH-2.0-OpenSSH_7.4\r\n',
  http: '<html><body><h1>Default Web Server</h1></body></html>',
  ftp: '220 FTP Server Ready\r\n',
  telnet: 'Welcome to Telnet Server\r\n'
}

// Fetch settings from Main Server
async function getSettings() {
  try {
    const response = await axios.get(`${MAIN_SERVER_URL}/api/settings`)
    if (response.data && response.data.data) {
      return response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch settings from main server:', error.message)
  }
  // Fallback defaults
  return {
    enableSSH: true,
    enableHTTP: true,
    enableFTP: true,
    enableTelnet: true
  }
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

// Generic HTTP trap handler
async function trapHandler(req, res, service) {
  const settings = await getSettings()
  const isEnabled = 
    service === 'ssh' ? settings.enableSSH :
    service === 'http' ? settings.enableHTTP :
    service === 'ftp' ? settings.enableFTP :
    service === 'telnet' ? settings.enableTelnet : true

  if (!isEnabled) {
    return res.status(404).send('Not Found')
  }

  const severity = classifySeverity(req)
  const log = {
    attackerIp: req.ip || req.connection.remoteAddress || '127.0.0.1',
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
    console.error('Failed to send log to main server:', error.message)
  }

  // Send trap response
  res.type('text/plain').send(traps[service] || 'Service Active')
}

// Helper to report raw TCP attacks
async function reportTcpAttack(attackerIp, service, eventDetails, severity = 'High') {
  // Format IP nicely if it contains IPv6 prefix (e.g. ::ffff:127.0.0.1)
  let cleanIp = attackerIp
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.substring(7)
  } else if (cleanIp === '::1') {
    cleanIp = '127.0.0.1'
  }

  const log = {
    attackerIp: cleanIp,
    service,
    endpoint: `TCP Port ${service === 'ssh' ? 2222 : service === 'ftp' ? 2121 : 2323}`,
    severity,
    userAgent: 'TCP Connection Client',
    timestamp: new Date().toISOString(),
    headers: JSON.stringify({ protocol: 'TCP' }),
    method: 'CONNECT',
    body: eventDetails
  }

  console.log(`[TCP ${service.toUpperCase()}] ${severity} - ${cleanIp} - ${eventDetails}`)

  try {
    await axios.post(`${MAIN_SERVER_URL}/api/trap/log`, log)
  } catch (error) {
    console.error('Failed to send TCP log to main server:', error.message)
  }
}

// --- Raw TCP Honeypot Trap Listeners ---

// 1. SSH Honeypot (Port 2222)
const sshServer = net.createServer((socket) => {
  const remoteAddress = socket.remoteAddress || '127.0.0.1'
  
  getSettings().then(settings => {
    if (!settings.enableSSH) {
      socket.destroy()
      return
    }

    reportTcpAttack(remoteAddress, 'ssh', 'TCP connection established to SSH port 2222', 'Medium')
    socket.write('SSH-2.0-OpenSSH_7.4\r\n')

    let buffer = ''
    socket.on('data', (data) => {
      buffer += data.toString()
      if (buffer.length > 500 || buffer.includes('\n')) {
        const cleaned = buffer.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim()
        reportTcpAttack(remoteAddress, 'ssh', `Credential brute-force/Handshake payload: ${cleaned.substring(0, 100)}`, 'Critical')
        socket.write('Access denied\r\n')
        socket.end()
      }
    })

    socket.on('error', () => {})
  })
})
sshServer.listen(2222, () => {
  console.log('SSH Honeypot Trap listening on TCP port 2222')
})

// 2. FTP Honeypot (Port 2121)
const ftpServer = net.createServer((socket) => {
  const remoteAddress = socket.remoteAddress || '127.0.0.1'
  
  getSettings().then(settings => {
    if (!settings.enableFTP) {
      socket.destroy()
      return
    }

    reportTcpAttack(remoteAddress, 'ftp', 'TCP connection established to FTP port 2121', 'Medium')
    socket.write('220 FTP Server Ready\r\n')

    let state = 'USER'
    let username = ''
    
    socket.on('data', (data) => {
      const line = data.toString().trim()
      const cmd = line.split(' ')[0].toUpperCase()
      const arg = line.split(' ').slice(1).join(' ')

      if (cmd === 'USER') {
        username = arg
        socket.write(`331 Password required for ${arg}\r\n`)
        state = 'PASS'
      } else if (cmd === 'PASS') {
        reportTcpAttack(remoteAddress, 'ftp', `Brute force credentials attempt: USER="${username}" PASS="${arg}"`, 'High')
        socket.write('530 Login incorrect.\r\n')
        socket.end()
      } else {
        socket.write('500 Command not understood.\r\n')
      }
    })

    socket.on('error', () => {})
  })
})
ftpServer.listen(2121, () => {
  console.log('FTP Honeypot Trap listening on TCP port 2121')
})

// 3. Telnet Honeypot (Port 2323)
const telnetServer = net.createServer((socket) => {
  const remoteAddress = socket.remoteAddress || '127.0.0.1'
  
  getSettings().then(settings => {
    if (!settings.enableTelnet) {
      socket.destroy()
      return
    }

    reportTcpAttack(remoteAddress, 'telnet', 'TCP connection established to Telnet port 2323', 'Medium')
    socket.write('Welcome to Telnet Server\r\nLogin: ')

    let state = 'USER'
    let username = ''
    let buffer = ''

    socket.on('data', (data) => {
      const str = data.toString()
      buffer += str
      if (str.includes('\r') || str.includes('\n')) {
        const input = buffer.trim()
        buffer = ''

        if (state === 'USER') {
          username = input
          socket.write('Password: ')
          state = 'PASS'
        } else if (state === 'PASS') {
          reportTcpAttack(remoteAddress, 'telnet', `Brute force credentials attempt: USER="${username}" PASS="${input}"`, 'High')
          socket.write('\r\nLogin incorrect\r\nLogin: ')
          state = 'USER'
          username = ''
        }
      }
    })

    socket.on('error', () => {})
  })
})
telnetServer.listen(2323, () => {
  console.log('Telnet Honeypot Trap listening on TCP port 2323')
})

// --- REST Routes ---
app.get('/', (req, res) => {
  res.json({
    name: 'Adaptive Honeypot System - Trap Server',
    version: '2.0.0',
    status: 'running',
    traps: ['ssh', 'http', 'ftp', 'telnet'],
    tcpTraps: {
      ssh: 2222,
      ftp: 2121,
      telnet: 2323
    }
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mainServerConnected: true
  })
})

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

// Start Express Server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║       Adaptive Honeypot System - Trap Server                   ║
╠════════════════════════════════════════════════════════════════╣
║ HTTP Server: http://localhost:${PORT}                           │
║ Status: Running                                                 ║
║ HTTP Services:                                                  ║
║   SSH:    /honeypot/ssh                                         ║
║   HTTP:   /honeypot/http                                        ║
║   FTP:    /honeypot/ftp                                         ║
║   Telnet: /honeypot/telnet                                      ║
║ Raw TCP Services:                                               ║
║   SSH:    TCP Port 2222                                         ║
║   FTP:    TCP Port 2121                                         ║
║   Telnet: TCP Port 2323                                         ║
╚════════════════════════════════════════════════════════════════╝
  `)
})

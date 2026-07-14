import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.MAIN_SERVER_PORT || 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Database Setup
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOGS_FILE = path.join(__dirname, 'logs_db.json')
const SETTINGS_FILE = path.join(__dirname, 'settings_db.json')

let settings = {
  mainPort: 3000,
  trapPort: 3001,
  enableSSH: true,
  enableHTTP: true,
  enableFTP: true,
  enableTelnet: true
}

let logs = []

// Load existing logs
try {
  if (fs.existsSync(LOGS_FILE)) {
    logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'))
  }
} catch (error) {
  console.error('Failed to load logs database:', error)
}

// Load settings
try {
  if (fs.existsSync(SETTINGS_FILE)) {
    settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))
  } else {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
  }
} catch (error) {
  console.error('Failed to load settings database:', error)
}

const stats = {
  total: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0
}

function saveLogs() {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to save logs database:', error)
  }
}

function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to save settings database:', error)
  }
}

// Initialize Stats on startup
updateStats()

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Adaptive Honeypot System - Main Server',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      logs: '/api/logs',
      stats: '/api/stats',
      health: '/health'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    totalAttacks: logs.length
  })
})

// Logs API
app.get('/api/logs', (req, res) => {
  res.json({ success: true, data: logs })
})

app.get('/api/logs/:id', (req, res) => {
  const log = logs.find(l => l.id === parseInt(req.params.id))
  if (!log) return res.status(404).json({ error: 'Log not found' })
  res.json({ success: true, data: log })
})

app.post('/api/logs', (req, res) => {
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...req.body
  }
  logs.unshift(newLog)
  updateStats()
  saveLogs()

  io.emit('attackDetected', newLog)

  res.status(201).json({ success: true, data: newLog })
})

app.delete('/api/logs/:id', (req, res) => {
  const index = logs.findIndex(l => l.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Log not found' })
  logs.splice(index, 1)
  updateStats()
  saveLogs()
  res.json({ success: true, message: 'Log deleted' })
})

app.get('/api/stats', (req, res) => {
  res.json({ success: true, data: stats })
})

app.get('/api/attacks/severity/:level', (req, res) => {
  const attacks = logs.filter(l => l.severity === req.params.level)
  res.json({ success: true, data: attacks })
})

// Settings API
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: settings })
})

app.post('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body }
  saveSettings()
  io.emit('settingsUpdated', settings)
  res.json({ success: true, data: settings })
})

// WebSocket events
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`)
  
  socket.emit('initialLogs', logs)
  socket.emit('stats', stats)
  
  socket.on('disconnect', () => {
    console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}`)
  })
})

async function ipToGeo(ip) {
  const privatePrefixes = ['10.', '172.', '192.168.', '127.', '::1', 'localhost']
  if (!ip || privatePrefixes.some(prefix => ip.startsWith(prefix) || ip === prefix)) {
    return { location: 'Local Network', lat: 13.0827, lon: 80.2707 } // Local Network maps to Chennai coordinate
  }
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`)
    if (response.ok) {
      const data = await response.json()
      if (data && data.status === 'success') {
        return {
          location: `${data.city}, ${data.country}`,
          lat: data.lat,
          lon: data.lon
        }
      }
    }
  } catch (error) {
    console.error('GeoIP lookup failed for IP:', ip, error.message)
  }
  // Fallback to a mock location if API fails or rate limit hit
  const sampleGeo = [
    { location: 'San Francisco, USA', lat: 37.7749, lon: -122.4194 },
    { location: 'Berlin, Germany', lat: 52.52, lon: 13.405 },
    { location: 'Tokyo, Japan', lat: 35.6895, lon: 139.6917 },
    { location: 'Mumbai, India', lat: 19.076, lon: 72.8777 },
    { location: 'São Paulo, Brazil', lat: -23.5505, lon: -46.6333 },
    { location: 'Nairobi, Kenya', lat: -1.2921, lon: 36.8219 }
  ]
  return sampleGeo[Math.floor(Math.random() * sampleGeo.length)]
}

// Receive logs from trap server
app.post('/api/trap/log', async (req, res) => {
  const geo = await ipToGeo(req.body.attackerIp || '')
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...req.body,
    location: req.body.location || geo.location,
    lat: req.body.lat ?? geo.lat,
    lon: req.body.lon ?? geo.lon
  }
  logs.unshift(log)
  updateStats()
  saveLogs()
  io.emit('attackDetected', log)
  res.status(201).json({ success: true, data: log })
})

function updateStats() {
  stats.total = logs.length
  stats.critical = logs.filter(l => l.severity === 'Critical').length
  stats.high = logs.filter(l => l.severity === 'High').length
  stats.medium = logs.filter(l => l.severity === 'Medium').length
  stats.low = logs.filter(l => l.severity === 'Low').length
}

// Simulate attacks for demo
setInterval(() => {
  if (Math.random() > 0.7) {
    const severities = ['Critical', 'High', 'Medium', 'Low']
    const services = ['ssh', 'http', 'ftp', 'telnet']
    const geoSamples = [
      { location: 'San Francisco, USA', lat: 37.7749, lon: -122.4194 },
      { location: 'Berlin, Germany', lat: 52.52, lon: 13.405 },
      { location: 'Tokyo, Japan', lat: 35.6895, lon: 139.6917 },
      { location: 'Mumbai, India', lat: 19.076, lon: 72.8777 },
      { location: 'São Paulo, Brazil', lat: -23.5505, lon: -46.6333 },
      { location: 'Nairobi, Kenya', lat: -1.2921, lon: 36.8219 }
    ]
    const geo = geoSamples[Math.floor(Math.random() * geoSamples.length)]
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      attackerIp: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      service: services[Math.floor(Math.random() * services.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      userAgent: 'Mozilla/5.0 or Malicious Bot',
      event: 'Suspicious activity detected',
      location: geo.location,
      lat: geo.lat,
      lon: geo.lon
    }
    logs.unshift(log)
    updateStats()
    saveLogs()
    io.emit('attackDetected', log)
    console.log(`[Attack Detected] ${log.severity} - ${log.attackerIp}`)
  }
}, 3000)

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Adaptive Honeypot System - Main Server                 ║
╠════════════════════════════════════════════════════════════════╣
║ Server: http://localhost:${PORT}                              │
║ Status: Running                                                 ║
║ WebSocket: ws://localhost:${PORT}                              │
╚════════════════════════════════════════════════════════════════╝
  `)
})

export { io, app }

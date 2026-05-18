# Adaptive Honeypot System v2.0
A professional cybersecurity honeypot system with dual-server architecture designed to detect and analyze network attacks in real-time.
## Architecture
```
┌─────────────────────────────────────────────────────────┐
│                  Vue.js Frontend (5173)                 │
│         Beautiful Dashboard & Real-time Analytics       │
└────────────────────────┬────────────────────────────────┘
                         │ WebSocket + REST API
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │  Main   │    │  Trap   │    │Analytics│
    │ Server  │    │ Server  │    │ Engine  │
    │ :3000   │◄──►│ :3001   │◄──►│ Backend │
    └────┬────┘    └────┬────┘    └────────┘
         │               │
    ┌────┴──────────────┴────────────────┐
    │    Dashboard & Security Analysis   │
    │  - Real-time log monitoring        │
    │  - Attack classification           │
    │  - Severity analysis               │
    │  - Attacker IP tracking            │
    └────────────────────────────────────┘
```
**Main Server (Control Center)**
- Real-time dashboard for all captured attacks
- Attack analytics and statistics
- Log management system
- WebSocket broadcast to all clients
- REST API for attack queries
 **Trap/Dummy Server (Honeypot)**
- Fake SSH service (port 22)
- Fake HTTP/HTTPS service (ports 80, 443)
- Fake FTP service (port 21)
- Fake Telnet service (port 23)
- Captures all attack details
- Sends data to Main Server

 **Beautiful Frontend**
- Modern Vue.js 3 UI
- Real-time attack visualization
- Interactive charts
- Attack severity dashboard
- Attacker IP geolocation (optional)
- Export logs to CSV/JSON

## Quick Start
### 1. Install Dependencies
```bash
npm install
cd frontend && npm install && cd ..
```
### 2. Start Main Server
```bash
npm run dev
```
Backend: **http://localhost:3000**

### 3. Start Trap Server (Another Terminal)
```bash
npm run trap
```
Honeypot Traps: **http://localhost:3001**

### 4. Start Frontend (Another Terminal)
```bash
cd frontend
npm run dev
```

Frontend: **http://localhost:5173**

## API Endpoints

### Main Server (Port 3000)
```
GET  /              - Server info
GET  /health        - Health check
GET  /api/logs      - Get all captured attacks
GET  /api/logs/:id  - Get specific attack
POST /api/logs      - Create log entry
DELETE /api/logs/:id - Delete log
GET  /api/stats     - Attack statistics
GET  /api/attacks/severity/:level - Get attacks by severity
```

### Trap Server (Port 3001)

```
GET  /honeypot/ssh      - SSH honeypot trap
GET  /honeypot/http     - HTTP honeypot trap
GET  /honeypot/ftp      - FTP honeypot trap
GET  /honeypot/telnet   - Telnet honeypot trap
POST /api/trap/log      - Log attack to main server
```

## WebSocket Events

### Main Server Broadcasts

```javascript
// Real-time attack event
socket.on('attackDetected', (attack) => {
  // {
  //   id: number,
  //   timestamp: string,
  //   attackerIp: string,
  //   service: 'ssh' | 'http' | 'ftp' | 'telnet',
  //   severity: 'Critical' | 'High' | 'Medium' | 'Low',
  //   userAgent: string,
  //   headers: object,
  //   geoLocation: { country, city, latitude, longitude } (if enabled)
  // }
});
```

## File Structure

```
.
├── main-server/
│   ├── server.js           - Main backend server (port 3000)
│   ├── config.js           - Configuration
│   └── handlers/
│       ├── logHandler.js   - Log management
│       ├── statsHandler.js - Analytics
│       └── wsHandler.js    - WebSocket handling
│
├── trap-server/
│   ├── server.js           - Honeypot trap server (port 3001)
│   ├── traps/
│   │   ├── sshTrap.js     - SSH service emulator
│   │   ├── httpTrap.js    - HTTP service emulator
│   │   ├── ftpTrap.js     - FTP service emulator
│   │   └── telnetTrap.js  - Telnet service emulator
│   └── utils.js            - Utility functions
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.vue
    │   │   ├── AttackLogs.vue
    │   │   ├── Statistics.vue
    │   │   ├── SeverityChart.vue
    │   │   ├── IpMap.vue
    │   │   └── Header.vue
    │   ├── api.js
    │   ├── App.vue
    │   └── main.ts
    └── package.json
```

## Severity Classification

- **Critical**: Known malware signatures, SQL injection attempts
- **High**: Brute force attacks, shell command attempts, directory traversal
- **Medium**: Port scanning, unusual user agents, repeated requests
- **Low**: Legitimate requests to non-existent endpoints

## Configuration

Edit `.env` to customize:

```env
MAIN_SERVER_PORT=3000          # Main server port
TRAP_SERVER_PORT=3001          # Trap server port
NODE_ENV=development           # Environment
ENABLE_SSH_TRAP=true           # Enable SSH honeypot
ENABLE_HTTP_TRAP=true          # Enable HTTP honeypot
ENABLE_FTP_TRAP=true           # Enable FTP honeypot
ENABLE_TELNET_TRAP=true        # Enable Telnet honeypot
```

## Security Considerations

 **Important for Production:**

1. Change `JWT_SECRET` in `.env`
2. Enable HTTPS/TLS certificates
3. Implement rate limiting
4. Use a real database (MongoDB/PostgreSQL)
5. Enable IP-based blocking
6. Set up log rotation
7. Configure firewall rules
8. Enable authentication for dashboard

## Testing Attacks

### Test with cURL

```bash
# SSH trap
curl http://localhost:3001/honeypot/ssh

# HTTP trap
curl http://localhost:3001/honeypot/http

# FTP trap
curl http://localhost:3001/honeypot/ftp

# Get all logs
curl http://localhost:3000/api/logs

# Get statistics
curl http://localhost:3000/api/stats
```

### Test with Nmap

```bash
nmap -p 22,80,443,21,23 localhost
```

## Performance

- Handles 1000+ concurrent attacks
- Real-time log processing
- Optimized WebSocket broadcasting
- Memory-efficient log storage

## License

MIT License - Open source cybersecurity tool

## Support

For issues and questions, refer to the documentation files included in this project.

# Adaptive Honeypot System - Quick Start Guide

## 🚀 Installation

### Step 1: Install Dependencies

**Windows:**
```powershell
.\install.bat
```

**Linux/macOS:**
```bash
chmod +x install.sh
./install.sh
```

**Manual:**
```bash
npm install
cd frontend && npm install && cd ..
```

---

## ▶️ Running the System

Open **3 terminals** and run each command:

### Terminal 1: Main Server (Control Center)
```bash
npm run dev
```
- Runs on **http://localhost:3000**
- Manages all attack logs
- WebSocket server for real-time updates

### Terminal 2: Trap Server (Honeypot Traps)
```bash
npm run trap
```
- Runs on **http://localhost:3001**
- Hosts fake services (SSH, HTTP, FTP, Telnet)
- Captures and logs all attack attempts

### Terminal 3: Frontend Dashboard
```bash
cd frontend
npm run dev
```
- Runs on **http://localhost:5173**
- Beautiful security dashboard
- Real-time attack visualization

---

## 🌐 Access Points

| Service | URL |
|---------|-----|
| **Dashboard UI** | http://localhost:5173 |
| **Main API** | http://localhost:3000 |
| **Trap Server** | http://localhost:3001 |
| **WebSocket** | ws://localhost:3000 |

---

## 🔌 Test Attacks

### Using cURL

```bash
# Test SSH trap
curl http://localhost:3001/honeypot/ssh

# Test HTTP trap
curl http://localhost:3001/honeypot/http

# Test FTP trap
curl http://localhost:3001/honeypot/ftp

# Get all logged attacks
curl http://localhost:3000/api/logs

# Get attack statistics
curl http://localhost:3000/api/stats

# Health check
curl http://localhost:3000/health
```

### Using Browser

Visit in your browser:
- **SSH Trap:** http://localhost:3001/honeypot/ssh
- **HTTP Trap:** http://localhost:3001/honeypot/http
- **FTP Trap:** http://localhost:3001/honeypot/ftp

---

## 📊 API Endpoints

### Main Server (Port 3000)

#### Logs Management
```
GET  /api/logs              - Get all attack logs
GET  /api/logs/:id          - Get specific attack
POST /api/logs              - Create new log
DELETE /api/logs/:id        - Delete log
```

#### Statistics
```
GET  /api/stats             - Get attack statistics
GET  /api/attacks/severity/:level - Get attacks by severity level
```

#### Server Info
```
GET  /                      - Server info
GET  /health                - Server health status
```

### Trap Server (Port 3001)

#### Honeypot Traps
```
/honeypot/ssh               - SSH service trap
/honeypot/http              - HTTP service trap
/honeypot/ftp               - FTP service trap
/honeypot/telnet            - Telnet service trap
```

---

## 🎯 Features

✅ **Real-time Attack Monitoring**
- Live dashboard showing all attacks
- Automatic UI updates via WebSocket

✅ **Attack Classification**
- Critical: Malware signatures, SQL injection
- High: Brute force, shell commands
- Medium: Port scanning, abnormal patterns
- Low: Benign suspicious activity

✅ **Dual-Server Architecture**
- Main Server: Dashboard & analytics
- Trap Server: Honeypot services

✅ **Beautiful UI**
- Modern Vue.js 3 interface
- Dark theme optimized for security centers
- Real-time charts and statistics

✅ **Security Analysis**
- Top attacking IPs
- Most targeted services
- Attack timeline
- Severity distribution

---

## 🔧 Configuration

Edit `.env` file:

```env
# Server Ports
MAIN_SERVER_PORT=3000
TRAP_SERVER_PORT=3001

# Environment
NODE_ENV=development

# Security
JWT_SECRET=honeypot-secret-key-change-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:3001

# Honeypot Services (enable/disable)
ENABLE_SSH_TRAP=true
ENABLE_HTTP_TRAP=true
ENABLE_FTP_TRAP=true
ENABLE_TELNET_TRAP=true
```

---

## 🛡️ Security Considerations

⚠️ **For Production Deployment:**

1. Change `JWT_SECRET` to a strong random string
2. Use HTTPS/TLS certificates
3. Implement proper authentication
4. Set up database for log persistence
5. Enable rate limiting
6. Configure firewall rules
7. Use environment-specific configurations
8. Enable logging and monitoring

---

## 📁 Project Structure

```
adaptive-honeypot-system/
├── main-server/
│   └── server.js              # Main control server
├── trap-server/
│   └── server.js              # Honeypot traps server
├── frontend/
│   ├── src/
│   │   ├── App.vue            # Main Vue app
│   │   ├── components/        # Vue components
│   │   ├── main.ts            # Vue entry point
│   │   └── style.css          # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── package.json
├── .env                       # Configuration
└── README.md
```

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Windows: Find and kill process on port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS: Kill process on port
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installing
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Issues
- Ensure Main Server is running on port 3000
- Check browser console for errors
- Verify CORS settings in `.env`

---

## 📚 API Examples

### Create Log Entry
```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "attackerIp": "192.168.1.1",
    "service": "ssh",
    "severity": "High",
    "userAgent": "OpenSSH_7.4"
  }'
```

### Get Critical Attacks
```bash
curl http://localhost:3000/api/attacks/severity/Critical
```

### Export Logs
```bash
curl http://localhost:3000/api/logs > attacks.json
```

---

## 🎓 Learning Resources

- Vue.js 3 Docs: https://vuejs.org/
- Express.js Guide: https://expressjs.com/
- Socket.IO Manual: https://socket.io/docs/
- Security Testing: OWASP Top 10

---

## 📝 License

MIT License - Open Source Security Tool

---

## ❓ Need Help?

1. Check the README.md file
2. Review API.md for endpoint details
3. Check browser console for errors
4. Verify all three servers are running
5. Ensure correct ports are configured

**Happy Honeypotting! 🍯**

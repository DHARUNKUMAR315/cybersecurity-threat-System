import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7860;

// Start child servers with auto-restart supervisor logic
let backend, trap;

function startBackend() {
  backend = spawn('node', ['Backend/main-server/server.js'], { 
    env: { ...process.env, MAIN_SERVER_PORT: '3000' }, 
    stdio: 'inherit' 
  });
  backend.on('exit', (code) => {
    console.log(`Backend main-server exited with code ${code}. Respawning in 1s...`);
    setTimeout(startBackend, 1000);
  });
}

function startTrap() {
  trap = spawn('node', ['Backend/trap-server/server.js'], { 
    env: { ...process.env, TRAP_SERVER_PORT: '3001', MAIN_SERVER_PORT: '3000' }, 
    stdio: 'inherit' 
  });
  trap.on('exit', (code) => {
    console.log(`Trap server exited with code ${code}. Respawning in 1s...`);
    setTimeout(startTrap, 1000);
  });
}

startBackend();
startTrap();

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Proxy rules
app.use('/api', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));
app.use('/socket.io', createProxyMiddleware({ target: 'http://localhost:3000', ws: true, changeOrigin: true }));
app.use('/health', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));

// Trap proxy
app.use('/honeypot', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));

// Catch-all route to serve the Vue app for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hugging Face Proxy Server running on port ${PORT}`);
});

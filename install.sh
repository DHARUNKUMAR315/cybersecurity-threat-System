#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Adaptive Honeypot System - Complete Setup                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Install main dependencies
echo ""
echo "[1/3] Installing main server dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "[2/3] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Setup Complete!                                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "To start the system:"
echo ""
echo "Terminal 1 - Main Server (Port 3000):"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Trap Server (Port 3001):"
echo "  npm run trap"
echo ""
echo "Terminal 3 - Frontend (Port 5173):"
echo "  cd frontend && npm run dev"
echo ""
echo "Open: http://localhost:5173"

<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <h1>🛡️ Adaptive Honeypot System</h1>
        <div class="status">
          <span :class="{ connected: isConnected, disconnected: !isConnected }">
            {{ isConnected ? '● Online' : '● Offline' }}
          </span>
        </div>
      </div>
    </header>

    <div class="container">
      <nav class="sidebar">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
          class="nav-btn"
        >
          {{ tab }}
        </button>
      </nav>

      <main class="main-content">
        <!-- Dashboard Tab -->
        <div v-show="activeTab === 'Dashboard'" class="tab-content">
          <Statistics :stats="stats" />
          <div class="charts-grid">
            <SeverityChart :logs="logs" />
            <TimelineChart :logs="logs" />
            <WorldMap :logs="logs" />
          </div>
        </div>

        <!-- Logs Tab -->
        <div v-show="activeTab === 'Logs'" class="tab-content">
          <LogsTable :logs="logs" @delete="deleteLog" />
        </div>

        <!-- Statistics Tab -->
        <div v-show="activeTab === 'Statistics'" class="tab-content">
          <StatisticsPanel :stats="stats" />
        </div>

        <!-- Settings Tab -->
        <div v-show="activeTab === 'Settings'" class="tab-content">
          <Settings />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { io } from 'socket.io-client'
import axios from 'axios'
import Dashboard from './components/Dashboard.vue'
import LogsTable from './components/LogsTable.vue'
import Statistics from './components/Statistics.vue'
import SeverityChart from './components/SeverityChart.vue'
import TimelineChart from './components/TimelineChart.vue'
import WorldMap from './components/WorldMap.vue'
import StatisticsPanel from './components/StatisticsPanel.vue'
import Settings from './components/Settings.vue'

interface Attack {
  id: number
  timestamp: string
  attackerIp: string
  service: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  userAgent: string
  location?: string
  lat?: number
  lon?: number
  event?: string
}

const logs = ref<Attack[]>([])
const isConnected = ref(false)
const activeTab = ref('Dashboard')
const tabs = ['Dashboard', 'Logs', 'Statistics', 'Settings']

const stats = computed(() => ({
  total: logs.value.length,
  critical: logs.value.filter(l => l.severity === 'Critical').length,
  high: logs.value.filter(l => l.severity === 'High').length,
  medium: logs.value.filter(l => l.severity === 'Medium').length,
  low: logs.value.filter(l => l.severity === 'Low').length,
}))

const isDev = import.meta.env.DEV
const socket = io(isDev ? 'http://localhost:3000' : undefined)

socket.on('connect', () => {
  isConnected.value = true
  console.log('Connected to server')
  fetchLogs()
})

socket.on('disconnect', () => {
  isConnected.value = false
  console.log('Disconnected from server')
})

socket.on('attackDetected', (attack: Attack) => {
  console.log('New attack:', attack)
  logs.value.unshift(attack)
})

async function fetchLogs() {
  try {
    const response = await axios.get('/api/logs')
    logs.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Failed to fetch logs:', error)
  }
}

async function deleteLog(id: number) {
  try {
    await axios.delete(`/api/logs/${id}`)
    logs.value = logs.value.filter(log => log.id !== id)
  } catch (error) {
    console.error('Failed to delete log:', error)
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid #00d4ff;
  padding: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.status {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status span {
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.status .connected {
  color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
}

.status .disconnected {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
}

.container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 30px;
  padding: 30px;
}

.sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-btn {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
  transform: translateX(5px);
}

.nav-btn.active {
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  color: #000;
  border-color: #00d4ff;
  font-weight: 600;
}

.main-content {
  flex: 1;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>

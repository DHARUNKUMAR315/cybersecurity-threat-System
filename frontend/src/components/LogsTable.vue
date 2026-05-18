<template>
  <div class="logs-table">
    <div v-if="notification" class="notification">{{ notification }}</div>
    <div class="table-header">
      <h2>Attack Logs</h2>
      <button class="export-btn" @click="exportLogs">📥 Export</button>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Attacker IP</th>
            <th>Location</th>
            <th>Service</th>
            <th>Severity</th>
            <th>User Agent</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" :class="log.severity.toLowerCase()">
            <td class="time">{{ formatTime(log.timestamp) }}</td>
            <td class="ip">{{ log.attackerIp }}</td>
            <td class="location">{{ log.location || 'Unknown' }}</td>
            <td class="service">{{ log.service }}</td>
            <td class="severity">
              <span class="badge" :class="log.severity.toLowerCase()">
                {{ log.severity }}
              </span>
            </td>
            <td class="user-agent" :title="log.userAgent">{{ truncate(log.userAgent, 40) }}</td>
            <td class="action">
              <button class="delete-btn" @click="$emit('delete', log.id)">🗑️</button>
            </td>
          </tr>
          <tr v-if="logs.length === 0" class="empty">
            <td colspan="6" class="empty-message">No attacks detected yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Attack {
  id: number
  timestamp: string
  attackerIp: string
  service: string
  severity: string
  userAgent: string
  location?: string
}

const props = defineProps<{
  logs: Attack[]
}>()

const notification = ref('')

function setNotification(message: string) {
  notification.value = message
  window.setTimeout(() => {
    notification.value = ''
  }, 2600)
}

defineEmits<{
  delete: [id: number]
}>()

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString()
}

function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str
}

function escapeCsv(value: string) {
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

function exportLogs() {
  const logRows = props.logs.map(log => {
    return [
      new Date(log.timestamp).toLocaleString(),
      log.attackerIp,
      log.location || 'Unknown',
      log.service,
      log.severity,
      log.userAgent
    ].map(v => escapeCsv(String(v))).join(',')
  })

  if (logRows.length === 0) {
    setNotification('No logs to export.')
    return
  }

  const csv = ['Time,Attacker IP,Location,Service,Severity,User Agent', ...logRows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `honeypot-logs-${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  setNotification('Export successful. CSV downloaded.')
}
</script>

<style scoped>
.logs-table {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.table-header h2 {
  font-size: 18px;
}

.export-btn {
  padding: 8px 16px;
  background: #00d4ff;
  color: #000;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: #0099ff;
  transform: scale(1.05);
}

.table-wrapper {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

thead {
  background: rgba(0, 212, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #00d4ff;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
}

tr:hover {
  background: rgba(0, 212, 255, 0.05);
}

.time { color: #a0a0a0; }
.ip { font-family: monospace; color: #00d4ff; }
.service { text-transform: uppercase; }

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 11px;
}

.badge.critical { background: rgba(255, 68, 68, 0.3); color: #ff4444; }
.badge.high { background: rgba(255, 153, 68, 0.3); color: #ff9944; }
.badge.medium { background: rgba(255, 221, 68, 0.3); color: #ffdd44; }
.badge.low { background: rgba(68, 255, 68, 0.3); color: #44ff44; }

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: scale(1.2);
}

.notification {
  background: #06d6a0;
  color: #0a0a0;
  border-radius: 8px;
  padding: 10px 14px;
  border: 1px solid #10b981;
  text-align: center;
  margin: 12px 20px 0;
  font-weight: 600;
}

.empty-message {
  text-align: center;
  color: #a0a0a0;
  padding: 40px !important;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #00d4ff;
  border-radius: 3px;
}
</style>

<template>
  <div class="statistics-panel">
    <h2>Security Analysis</h2>
    <div class="analytic-card">
      <h3>Top Attacking IPs</h3>
      <div class="ip-list">
        <div v-for="(ip, index) in topIps" :key="index" class="ip-item">
          <span class="ip-address">{{ ip.ip }}</span>
          <span class="ip-count">{{ ip.count }} attacks</span>
        </div>
      </div>
    </div>
    <div class="analytic-card">
      <h3>Most Targeted Services</h3>
      <div class="service-list">
        <div v-for="(service, index) in topServices" :key="index" class="service-item">
          <span class="service-name">{{ service.name }}</span>
          <span class="service-count">{{ service.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Attack {
  attackerIp: string
  service: string
}

interface Stats {
  total: number
  critical: number
  high: number
  medium: number
  low: number
}

const props = defineProps<{
  stats: Stats
}>()

const topIps = computed(() => {
  const ips: Record<string, number> = {}
  // This would be calculated from logs in a real implementation
  return [
    { ip: '192.168.1.100', count: 23 },
    { ip: '10.0.0.50', count: 18 },
    { ip: '172.16.0.5', count: 12 },
  ]
})

const topServices = computed(() => [
  { name: 'SSH', count: 45 },
  { name: 'HTTP', count: 32 },
  { name: 'FTP', count: 18 },
  { name: 'Telnet', count: 5 },
])
</script>

<style scoped>
.statistics-panel {
  display: grid;
  gap: 20px;
}

.statistics-panel h2 {
  color: #00d4ff;
  font-size: 20px;
}

.analytic-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.analytic-card h3 {
  color: #e0e0e0;
  margin-bottom: 15px;
  font-size: 14px;
}

.ip-list, .service-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ip-item, .service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(0, 212, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.ip-address {
  font-family: monospace;
  color: #00d4ff;
  font-weight: 600;
}

.ip-count, .service-count {
  color: #a0a0a0;
  font-size: 12px;
}

.service-name {
  color: #e0e0e0;
  font-weight: 600;
}
</style>

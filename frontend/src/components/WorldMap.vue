<template>
  <div class="map-card">
    <div class="map-header">
      <h3>Attack Map</h3>
      <span class="subtitle">Live attack locations</span>
    </div>
    <div class="map-wrapper">
      <svg viewBox="0 0 1000 500" class="world-map" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="1000" height="500" fill="#0b1f37" />
        <g fill="#1f4f93" stroke="#1f4f93" stroke-width="1" opacity="0.35">
          <path d="M0 300 L120 220 L180 245 L260 190 L320 210 L380 170 L480 160 L580 180 L640 130 L700 140 L760 110 L820 115 L900 90 L1000 100 L1000 500 L0 500 Z"/>
          <path d="M0 110 L110 90 L180 80 L260 95 L340 80 L420 115 L500 110 L560 130 L620 110 L700 140 L780 135 L860 120 L940 125 L1000 130 L1000 0 L0 0 Z"/>
        </g>
        <g v-if="points.length">
          <circle
            v-for="(point, index) in points"
            :key="index"
            :cx="lonToX(point.lon)"
            :cy="latToY(point.lat)"
            r="5"
            fill="#ff4d4d"
            stroke="#fff"
            stroke-width="1"
          >
            <title>{{ point.label }}</title>
          </circle>
        </g>
      </svg>
    </div>
    <div class="legend">Showing {{ points.length }} mapped attacks</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AttackPoint {
  location?: string
  lat?: number
  lon?: number
  attackerIp?: string
}

const props = defineProps<{ logs: AttackPoint[] }>()

const points = computed(() => {
  return props.logs
    .filter(log => typeof log.lat === 'number' && typeof log.lon === 'number')
    .slice(0, 100)
    .map(log => ({
      lat: log.lat as number,
      lon: log.lon as number,
      label: `${log.location || 'Unknown'} (${log.attackerIp || 'IP'})`
    }))
})

function lonToX(lon: number) {
  return ((lon + 180) / 360) * 1000
}

function latToY(lat: number) {
  return ((90 - lat) / 180) * 500
}
</script>

<style scoped>
.map-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}

.map-header h3 {
  margin: 0;
  font-size: 16px;
}

.subtitle {
  color: #a0d2ff;
  font-size: 12px;
}

.map-wrapper {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.world-map {
  width: 100%;
  height: 260px;
  display: block;
}

.legend {
  margin-top: 8px;
  color: #a0a0a0;
  font-size: 12px;
}
</style>

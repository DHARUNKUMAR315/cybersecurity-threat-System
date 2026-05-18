<template>
  <div class="chart-container">
    <h3>Attacks Over Time</h3>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

interface Attack {
  timestamp: string
  severity: string
}

const props = defineProps<{
  logs: Attack[]
}>()

const chartCanvas = ref<HTMLCanvasElement>()
let chart: Chart

function getTimeData() {
  const timeMap = new Map<string, number>()
  
  props.logs.forEach(log => {
    const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    timeMap.set(time, (timeMap.get(time) || 0) + 1)
  })

  const sorted = Array.from(timeMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-10)

  return {
    labels: sorted.map(([time]) => time),
    data: sorted.map(([, count]) => count),
  }
}

function updateChart() {
  const timeData = getTimeData()

  if (chart) {
    chart.data.labels = timeData.labels
    chart.data.datasets[0].data = timeData.data
    chart.update()
  } else if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')!
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeData.labels,
        datasets: [{
          label: 'Attacks',
          data: timeData.data,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00d4ff',
          pointBorderColor: '#00d4ff',
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#e0e0e0' },
          },
        },
        scales: {
          y: {
            ticks: { color: '#a0a0a0' },
            grid: { color: 'rgba(0, 212, 255, 0.1)' },
          },
          x: {
            ticks: { color: '#a0a0a0' },
            grid: { color: 'rgba(0, 212, 255, 0.1)' },
          },
        },
      },
    })
  }
}

onMounted(updateChart)
watch(() => props.logs.length, updateChart)
</script>

<style scoped>
.chart-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.chart-container h3 {
  margin-bottom: 20px;
  color: #00d4ff;
}

canvas {
  max-height: 300px;
}
</style>

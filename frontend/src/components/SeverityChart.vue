<template>
  <div class="chart-container">
    <h3>Attacks by Severity</h3>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

interface Attack {
  id: number
  severity: string
}

const props = defineProps<{
  logs: Attack[]
}>()

const chartCanvas = ref<HTMLCanvasElement>()
let chart: Chart

function updateChart() {
  const data = {
    critical: props.logs.filter(l => l.severity === 'Critical').length,
    high: props.logs.filter(l => l.severity === 'High').length,
    medium: props.logs.filter(l => l.severity === 'Medium').length,
    low: props.logs.filter(l => l.severity === 'Low').length,
  }

  if (chart) {
    chart.data.datasets[0].data = [data.critical, data.high, data.medium, data.low]
    chart.update()
  } else if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')!
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [{
          data: [data.critical, data.high, data.medium, data.low],
          backgroundColor: [
            '#ff4444',
            '#ff9944',
            '#ffdd44',
            '#44ff44',
          ],
          borderColor: 'rgba(0, 212, 255, 0.2)',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: {
              color: '#e0e0e0',
              font: { size: 12 },
            },
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

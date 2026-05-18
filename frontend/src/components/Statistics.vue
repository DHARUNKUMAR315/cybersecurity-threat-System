<template>
  <div class="statistics">
    <div class="stat-card total">
      <div class="stat-icon">📊</div>
      <div class="stat-info">
        <h3>Total Attacks</h3>
        <p class="stat-number">{{ stats.total }}</p>
      </div>
    </div>
    <div class="stat-card critical">
      <div class="stat-icon">🔴</div>
      <div class="stat-info">
        <h3>Critical</h3>
        <p class="stat-number">{{ stats.critical }}</p>
      </div>
    </div>
    <div class="stat-card high">
      <div class="stat-icon">🟠</div>
      <div class="stat-info">
        <h3>High</h3>
        <p class="stat-number">{{ stats.high }}</p>
      </div>
    </div>
    <div class="stat-card medium">
      <div class="stat-icon">🟡</div>
      <div class="stat-info">
        <h3>Medium</h3>
        <p class="stat-number">{{ stats.medium }}</p>
      </div>
    </div>
    <div class="stat-card low">
      <div class="stat-icon">🟢</div>
      <div class="stat-info">
        <h3>Low</h3>
        <p class="stat-number">{{ stats.low }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Stats {
  total: number
  critical: number
  high: number
  medium: number
  low: number
}

defineProps<{
  stats: Stats
}>()
</script>

<style scoped>
.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 32px;
}

.stat-info h3 {
  font-size: 12px;
  color: #a0a0a0;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #00d4ff;
}

.stat-card.critical .stat-number { color: #ff4444; }
.stat-card.high .stat-number { color: #ff9944; }
.stat-card.medium .stat-number { color: #ffdd44; }
.stat-card.low .stat-number { color: #44ff44; }

@media (max-width: 768px) {
  .statistics {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

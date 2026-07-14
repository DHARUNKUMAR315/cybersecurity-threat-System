<template>
  <div class="settings">
    <h2>Settings</h2>
    <div class="settings-group">
      <h3>Server Configuration</h3>
      <div class="setting-item">
        <label>Main Server Port</label>
        <input type="number" v-model="mainPort" />
      </div>
      <div class="setting-item">
        <label>Trap Server Port</label>
        <input type="number" v-model="trapPort" />
      </div>
    </div>
    <div class="settings-group">
      <h3>Honeypot Services</h3>
      <div class="setting-toggle">
        <label>
          <input type="checkbox" v-model="enableSSH" />
          <span>Enable SSH Trap</span>
        </label>
      </div>
      <div class="setting-toggle">
        <label>
          <input type="checkbox" v-model="enableHTTP" />
          <span>Enable HTTP Trap</span>
        </label>
      </div>
      <div class="setting-toggle">
        <label>
          <input type="checkbox" v-model="enableFTP" />
          <span>Enable FTP Trap</span>
        </label>
      </div>
      <div class="setting-toggle">
        <label>
          <input type="checkbox" v-model="enableTelnet" />
          <span>Enable Telnet Trap</span>
        </label>
      </div>
    </div>
    <button class="save-btn" @click="saveSettings">💾 Save Settings</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const mainPort = ref(3000)
const trapPort = ref(3001)
const enableSSH = ref(true)
const enableHTTP = ref(true)
const enableFTP = ref(true)
const enableTelnet = ref(true)

async function fetchSettings() {
  try {
    const response = await axios.get('/api/settings')
    const data = response.data.data
    if (data) {
      mainPort.value = data.mainPort
      trapPort.value = data.trapPort
      enableSSH.value = data.enableSSH
      enableHTTP.value = data.enableHTTP
      enableFTP.value = data.enableFTP
      enableTelnet.value = data.enableTelnet
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

async function saveSettings() {
  try {
    await axios.post('/api/settings', {
      mainPort: mainPort.value,
      trapPort: trapPort.value,
      enableSSH: enableSSH.value,
      enableHTTP: enableHTTP.value,
      enableFTP: enableFTP.value,
      enableTelnet: enableTelnet.value
    })
    alert('Settings saved successfully in database!')
  } catch (error) {
    console.error('Failed to save settings:', error)
    alert('Failed to save settings to server.')
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.settings {
  max-width: 500px;
}

.settings h2 {
  color: #00d4ff;
  margin-bottom: 20px;
}

.settings-group {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.settings-group h3 {
  color: #e0e0e0;
  margin-bottom: 15px;
  font-size: 14px;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item label {
  display: block;
  color: #a0a0a0;
  margin-bottom: 5px;
  font-size: 12px;
}

.setting-item input[type="number"] {
  width: 100%;
  padding: 8px;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
}

.setting-toggle {
  margin-bottom: 10px;
}

.setting-toggle label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #e0e0e0;
}

.setting-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.save-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);
}
</style>

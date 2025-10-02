<template>
  <div class="card mb-3">
    <div class="card-header">
      <h5 class="mb-0">Control de Zeon</h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <!-- Zeon Actual -->
        <div class="col-12">
          <label class="form-label">Zeon Actual</label>
          <div class="progress" style="height: 30px;">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: zeonPercentage + '%' }"
              :class="zeonBarClass"
            >
              {{ gameState.zeon }} / {{ gameState.rzeon }}
            </div>
          </div>
        </div>

        <!-- Controles de Zeon Actual -->
        <div class="col-12">
          <div class="input-group">
            <button
              class="btn btn-outline-danger"
              @click="modifyZeon(-10)"
            >
              -10
            </button>
            <button
              class="btn btn-outline-danger"
              @click="modifyZeon(-1)"
            >
              -1
            </button>
            <input
              type="number"
              class="form-control text-center"
              v-model.number="zeonAmount"
              min="0"
              placeholder="Cantidad"
            >
            <button
              class="btn btn-outline-success"
              @click="modifyZeon(1)"
            >
              +1
            </button>
            <button
              class="btn btn-outline-success"
              @click="modifyZeon(10)"
            >
              +10
            </button>
          </div>
        </div>

        <!-- Zeon Acumulado -->
        <div class="col-md-6">
          <label class="form-label">Zeon Acumulado (Normal)</label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              v-model.number="zeonAccumulatedAmount"
              min="0"
            >
            <button
              class="btn btn-outline-primary"
              @click="addZeonAccumulated('normal')"
            >
              Añadir
            </button>
          </div>
          <div class="mt-1">
            <small class="text-muted">Actual: {{ gameState.zeona }}</small>
          </div>
        </div>

        <!-- Zeon Perdido -->
        <div class="col-md-6">
          <label class="form-label">Zeon Perdido</label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              v-model.number="zeonLostAmount"
              min="0"
            >
            <button
              class="btn btn-outline-warning"
              @click="addZeonAccumulated('lost')"
            >
              Añadir
            </button>
          </div>
          <div class="mt-1">
            <small class="text-muted">Actual: {{ gameState.zeonp }}</small>
          </div>
        </div>

        <!-- Resumen -->
        <div class="col-12">
          <div class="alert alert-info mb-0">
            <div class="d-flex justify-content-between">
              <span>Zeon para lanzar:</span>
              <strong>{{ gameState.zeonToSpend }}</strong>
            </div>
            <div class="d-flex justify-content-between">
              <span>Zeon para mantener:</span>
              <strong>{{ gameState.mantainZeonToSpend }}</strong>
            </div>
            <hr class="my-2">
            <div class="d-flex justify-content-between">
              <span>Zeon disponible:</span>
              <strong :class="availableZeonClass">{{ gameState.availableZeon }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useGameStateStore } from '@/stores/gameState'

export default {
  name: 'ZeonControl',
  setup() {
    const gameState = useGameStateStore()

    const zeonAmount = ref(1)
    const zeonAccumulatedAmount = ref(0)
    const zeonLostAmount = ref(0)

    const zeonPercentage = computed(() => {
      if (gameState.rzeon === 0) return 0
      return Math.min(100, (gameState.zeon / gameState.rzeon) * 100)
    })

    const zeonBarClass = computed(() => {
      const percentage = zeonPercentage.value
      if (percentage < 25) return 'bg-danger'
      if (percentage < 50) return 'bg-warning'
      if (percentage < 75) return 'bg-info'
      return 'bg-success'
    })

    const availableZeonClass = computed(() => {
      return gameState.availableZeon < 0 ? 'text-danger' : 'text-success'
    })

    const modifyZeon = async (amount) => {
      if (amount > 0) {
        await gameState.addZeon(amount)
      } else {
        await gameState.spendZeon(Math.abs(amount))
      }
    }

    const addZeonAccumulated = async (type) => {
      const amount = type === 'normal' ? zeonAccumulatedAmount.value : zeonLostAmount.value
      if (amount > 0) {
        await gameState.addZeonAccumulated(amount, type)
        if (type === 'normal') {
          zeonAccumulatedAmount.value = 0
        } else {
          zeonLostAmount.value = 0
        }
      }
    }

    return {
      gameState,
      zeonAmount,
      zeonAccumulatedAmount,
      zeonLostAmount,
      zeonPercentage,
      zeonBarClass,
      availableZeonClass,
      modifyZeon,
      addZeonAccumulated
    }
  }
}
</script>

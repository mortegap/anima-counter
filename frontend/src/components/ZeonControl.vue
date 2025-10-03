<template>
  <div class="card mb-3">
    <div class="card-header">
      <h5 class="mb-0">{{ $t('zeonControl.title') }}</h5>
    </div>
    <div class="card-body">
      <!-- Sección de Turno (integrada desde TurnCounter) -->
      <div>
        <h6 class="text-muted mb-3 text-center">{{ $t('zeonControl.turn') }}</h6>
        <div class="d-flex justify-content-center align-items-center gap-3">
          <button
            class="btn btn-outline-secondary"
            @click="previousTurn"
            :disabled="gameState.turn_number === 0"
          >
            <i class="bi bi-arrow-left"></i>
          </button>

          <div class="turn-display">
            <h1 class="mb-0">{{ gameState.turn_number }}</h1>
          </div>

          <button
            class="btn btn-outline-primary"
            @click="nextTurn"
          >
            <i class="bi bi-arrow-right"></i>
          </button>
        </div>

      </div>
        <div class="mt-3 d-flex gap-2 justify-content-center">
          <button
            class="btn btn-outline-success btn-sm"
            @click="newDay"
          >
            <i class="bi bi-sunrise"></i>
            {{ $t('turnCounter.newDay') }}
          </button>
          <button
            class="btn btn-outline-warning btn-sm"
            @click="resetTurn"
            :title="$t('turnCounter.resetTooltip')"
          >
            <i class="bi bi-arrow-counterclockwise"></i>
            {{ $t('turnCounter.reset') }}
          </button>
        </div>
        <div v-if="gameState.rzeoni > 0" class="mt-3 text-muted small text-center">
          <i class="bi bi-arrow-repeat"></i>
          {{ $t('zeonControl.regeneration') }}: +{{ gameState.rzeoni }} {{ $t('zeonControl.zeonPerDay') }}
        </div>    
      <div class="row g-3">
        <!-- Reserva de Zeon (rzeon) - Barra de progreso -->
        <div class="col-12">
          <label class="form-label">{{ $t('zeonControl.zeonPool') }}</label>
          <div class="progress" style="height: 30px;">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: zeonPercentage + '%' }"
              :class="zeonBarClass"
            >
              {{ gameState.rzeon }} / {{ gameState.zeon }}
            </div>
          </div>
        </div>

        <!-- Checkbox Acumulación -->
        <div class="col-12">
          <div class="form-check">
            <input
              id="zeon-control-accumulate-checkbox"
              type="checkbox"
              class="form-check-input"
              v-model="acuCheckbox"
              @change="toggleAccumulation"
            >
            <label for="zeon-control-accumulate-checkbox" class="form-check-label">
              {{ $t('zeonControl.accumulateZeon') }}
            </label>
          </div>
        </div>

        <!-- Zeon Acumulado -->
        <div class="col-md-6">
          <label for="zeon-control-accumulated" class="form-label">{{ $t('zeonControl.accumulatedZeon') }}</label>
          <input
            id="zeon-control-accumulated"
            type="number"
            class="form-control"
            v-model.number="gameState.zeona"
            readonly
          >
        </div>

        <!-- Zeon Perdido -->
        <div class="col-md-6">
          <label for="zeon-control-lost" class="form-label">{{ $t('zeonControl.lostZeon') }}</label>
          <div class="input-group">
            <input
              id="zeon-control-lost"
              type="number"
              class="form-control"
              v-model.number="zeonLostAmount"
              min="0"
            >
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useGameStateStore } from '@/stores/gameState'

export default {
  name: 'ZeonControl',
  setup() {
    const gameState = useGameStateStore()

    const rzeonAmount = ref(1)
    const zeonLostAmount = ref(0)
    const maxZeon = ref(gameState.zeon)
    const acuCheckbox = ref(gameState.acu)

    // Sincronizar maxZeon con gameState.zeon
    watch(() => gameState.zeon, (newVal) => {
      maxZeon.value = newVal
    })

    // Sincronizar checkbox con gameState.acu
    watch(() => gameState.acu, (newVal) => {
      acuCheckbox.value = newVal
    })

    const zeonPercentage = computed(() => {
      if (gameState.zeon === 0) return 0
      return Math.min(100, (gameState.rzeon / gameState.zeon) * 100)
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

    const modifyRzeon = async (amount) => {
      if (amount > 0) {
        await gameState.addZeon(amount)
      } else {
        await gameState.spendZeon(Math.abs(amount))
      }
    }

    const updateMaxZeon = async () => {
      if (maxZeon.value >= 0 && maxZeon.value !== gameState.zeon) {
        await gameState.updateCharacteristics({ zeon: maxZeon.value })
      }
    }

    const toggleAccumulation = async () => {
      await gameState.updateCharacteristics({ acu: acuCheckbox.value })
    }

    const addZeonAccumulated = async (type) => {
      const amount = zeonLostAmount.value
      if (amount > 0 && type === 'lost') {
        await gameState.addZeonAccumulated(amount, type)
        zeonLostAmount.value = 0
      }
    }

    // Funciones de turno (integradas desde TurnCounter)
    const nextTurn = async () => {
      await gameState.nextTurn()
    }

    const previousTurn = async () => {
      await gameState.previousTurn()
    }

    const newDay = async () => {
      await gameState.newDay()
    }

    const resetTurn = async () => {
      await gameState.resetTurn()
    }

    return {
      gameState,
      rzeonAmount,
      maxZeon,
      acuCheckbox,
      zeonLostAmount,
      zeonPercentage,
      zeonBarClass,
      availableZeonClass,
      modifyRzeon,
      updateMaxZeon,
      toggleAccumulation,
      addZeonAccumulated,
      nextTurn,
      previousTurn,
      newDay,
      resetTurn
    }
  }
}
</script>

<style scoped>
.turn-display {
  min-width: 100px;
  text-align: center;
}

.turn-display h1 {
  font-size: 3rem;
  font-weight: bold;
  color: var(--bs-primary);
}

.btn i {
  font-size: 1.2rem;
}
</style>

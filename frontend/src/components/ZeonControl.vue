<template>
  <div class="card mb-3">
    <div class="card-header">
      <h5 class="mb-0">Resumen de Zeon</h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <!-- Reserva de Zeon (rzeon) - Barra de progreso -->
        <div class="col-12">
          <label class="form-label">Reserva de Zeon</label>
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

        <!-- Zeon Máximo (zeon) - Editable -->
        <div class="col-12">
          <label for="zeon-control-max-zeon" class="form-label">Zeon Máximo</label>
          <input
            id="zeon-control-max-zeon"
            type="number"
            class="form-control"
            v-model.number="maxZeon"
            @blur="updateMaxZeon"
            @keyup.enter="updateMaxZeon"
            min="0"
          >
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
              Acumular Zeon
            </label>
          </div>
        </div>

        <!-- Zeon Acumulado -->
        <div class="col-md-6">
          <label for="zeon-control-accumulated" class="form-label">Zeon Acumulado</label>
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
          <label for="zeon-control-lost" class="form-label">Zeon Perdido</label>
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
      addZeonAccumulated
    }
  }
}
</script>

<template>
  <div class="card mb-3">
    <div class="card-body text-center">
      <h6 class="text-muted mb-3">Turno</h6>
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

      <div class="mt-3 d-flex gap-2 justify-content-center">
        <button
          class="btn btn-outline-success btn-sm"
          @click="newDay"
        >
          <i class="bi bi-sunrise"></i>
          +1 día
        </button>
        <button
          class="btn btn-outline-warning btn-sm"
          @click="resetTurn"
          title="Reiniciar turno a 0"
        >
          <i class="bi bi-arrow-counterclockwise"></i>
          Reiniciar
        </button>
      </div>
      <div v-if="gameState.rzeoni > 0" class="mt-3 text-muted small">
        <i class="bi bi-arrow-repeat"></i>
        Regeneración: +{{ gameState.rzeoni }} zeon por día
      </div>      
    </div>
  </div>
</template>

<script>
import { useGameStateStore } from '@/stores/gameState'

export default {
  name: 'TurnCounter',
  setup() {
    const gameState = useGameStateStore()

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

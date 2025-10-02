<template>
  <div class="card mb-3">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Características</h5>
      <button
        class="btn btn-sm btn-outline-primary"
        @click="toggleEdit"
      >
        {{ isEditing ? 'Guardar' : 'Editar' }}
      </button>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Zeon Máximo (RZeon)</label>
          <input
            type="number"
            class="form-control"
            v-model.number="localRzeon"
            :disabled="!isEditing"
            min="0"
          >
        </div>

        <div class="col-md-6">
          <label class="form-label">ACT</label>
          <input
            type="number"
            class="form-control"
            v-model.number="localAct"
            :disabled="!isEditing"
            min="0"
          >
        </div>

        <div class="col-md-6">
          <label class="form-label">Regeneración Zeónica</label>
          <input
            type="number"
            class="form-control"
            v-model.number="localRzeoni"
            :disabled="!isEditing"
            min="0"
          >
        </div>

        <div class="col-md-6">
          <label class="form-label">Zeon Actual</label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              :value="gameState.zeon"
              readonly
            >
            <span class="input-group-text">/ {{ gameState.rzeon }}</span>
          </div>
        </div>
      </div>

      <div class="mt-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="text-muted">Zeon Acumulado:</span>
          <span class="badge bg-info">{{ gameState.zeona }}</span>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="text-muted">Zeon Perdido:</span>
          <span class="badge bg-warning">{{ gameState.zeonp }}</span>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-muted">Zeon Disponible:</span>
          <span class="badge bg-success">{{ gameState.availableZeon }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useGameStateStore } from '@/stores/gameState'

export default {
  name: 'CharacterStats',
  setup() {
    const gameState = useGameStateStore()
    const isEditing = ref(false)

    // Variables locales para edición
    const localRzeon = ref(gameState.rzeon)
    const localAct = ref(gameState.act)
    const localRzeoni = ref(gameState.rzeoni)

    // Sincronizar con el store cuando cambian
    const syncWithStore = () => {
      localRzeon.value = gameState.rzeon
      localAct.value = gameState.act
      localRzeoni.value = gameState.rzeoni
    }

    const toggleEdit = async () => {
      if (isEditing.value) {
        // Guardar cambios
        await gameState.updateCharacteristics({
          rzeon: localRzeon.value,
          act: localAct.value,
          rzeoni: localRzeoni.value
        })
      } else {
        // Sincronizar valores antes de editar
        syncWithStore()
      }
      isEditing.value = !isEditing.value
    }

    return {
      gameState,
      isEditing,
      localRzeon,
      localAct,
      localRzeoni,
      toggleEdit
    }
  }
}
</script>

<style scoped>
.form-control:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}
</style>

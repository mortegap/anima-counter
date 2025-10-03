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
        <div class="col-md-12">
          <label for="char-stats-rzeon" class="form-label">Zeon Máximo</label>
          <input
            id="char-stats-rzeon"
            type="number"
            class="form-control"
            v-model.number="localZeon"
            :disabled="!isEditing"
            min="0"
          >
        </div>

        <div class="col-md-12">
          <label for="char-stats-act" class="form-label">ACT</label>
          <input
            id="char-stats-act"
            type="number"
            class="form-control"
            v-model.number="localAct"
            :disabled="!isEditing"
            min="0"
          >
        </div>

        <div class="col-md-12">
          <label for="char-stats-rzeoni" class="form-label">Regeneración Zeónica</label>
          <input
            id="char-stats-rzeoni"
            type="number"
            class="form-control"
            v-model.number="localRzeoni"
            :disabled="!isEditing"
            min="0"
          >
        </div>

        <div class="col-md-12">
          <label for="char-stats-zeon-actual" class="form-label">Reserva de Zeon</label>
          <input
            id="char-stats-zeon-actual"
            type="number"
            class="form-control"
            v-model.number="localRzeon"
            @blur="updateRzeon"
            @keyup.enter="updateRzeon"
            min="0"
          >
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
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
    const localZeon = ref(gameState.zeon)

    // Sincronizar automáticamente cuando cambia rzeon en el store
    watch(() => gameState.rzeon, (newVal) => {
      localRzeon.value = newVal
    })

    // Sincronizar con el store cuando cambian
    const syncWithStore = () => {
      localRzeon.value = gameState.rzeon
      localAct.value = gameState.act
      localRzeoni.value = gameState.rzeoni
      localZeon.value = gameState.zeon
    }

    const toggleEdit = async () => {
      if (isEditing.value) {
        // Guardar cambios
        await gameState.updateCharacteristics({
          zeon: localZeon.value,
          act: localAct.value,
          rzeoni: localRzeoni.value
        })
      } else {
        // Sincronizar valores antes de editar
        syncWithStore()
      }
      isEditing.value = !isEditing.value
    }

    const updateRzeon = async () => {
      if (localRzeon.value >= 0 && localRzeon.value !== gameState.rzeon) {
        await gameState.updateCharacteristics({ rzeon: localRzeon.value })
      }
    }

    return {
      gameState,
      isEditing,
      localRzeon,
      localAct,
      localRzeoni,
      localZeon,
      toggleEdit,
      updateRzeon
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

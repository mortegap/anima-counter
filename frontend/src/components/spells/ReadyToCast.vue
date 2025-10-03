<template>
  <div class="ready-to-cast-container">
    <h3>{{ $t('spells.readyToCast') }}</h3>

    <div class="load-spell-form">
      <div class="form-row">
        <input
          id="ready-to-cast-spell-name"
          type="text"
          v-model="loadSpellName"
          :placeholder="$t('spells.spellName')"
          class="form-control"
        />
        <input
          id="ready-to-cast-spell-zeon"
          type="number"
          v-model.number="loadSpellZeon"
          placeholder="Zeon"
          class="form-control"
        />
        <input
          id="ready-to-cast-spell-mantain"
          type="number"
          v-model.number="loadSpellMantain"
          :placeholder="$t('spells.maintenance')"
          class="form-control"
        />
        <button @click="handleLoadSpell" class="btn btn-success">
          {{ $t('spells.load') }}
        </button>
      </div>
    </div>

    <div v-if="gameState.readyToCast.length === 0" class="empty-state">
      {{ $t('spells.noReadySpells') }}
    </div>
    <div v-else class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('spells.spellName') }}</th>
            <th>Zeon</th>
            <th>{{ $t('spells.maintenance') }}</th>
            <th>{{ $t('spells.maintainSpell') }}</th>
            <th>{{ $t('spells.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="spell in gameState.readyToCast" :key="spell.id">
            <td>{{ spell.spell_name }}</td>
            <td>{{ spell.spell_zeon }}</td>
            <td>{{ spell.spell_mantain || 0 }}</td>
            <td>
              <input
                type="checkbox"
                v-model="spell.spell_mantain_turn"
                :disabled="!spell.spell_mantain || spell.spell_mantain === 0"
              />
            </td>
            <td>
              <button
                @click="handleUnloadSpell(spell.id)"
                class="btn btn-warning btn-sm"
              >
                {{ $t('spells.unload') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="total-zeon">
        <strong>{{ $t('spells.totalZeonToSpend') }}: {{ gameState.zeonToSpend }}</strong>
      </div>

      <button @click="handleCastSpell" class="btn btn-primary btn-cast">
        {{ $t('spells.castSpells') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useGameStateStore } from '@/stores/gameState';

export default {
  name: 'ReadyToCast',
  setup() {
    const gameState = useGameStateStore();

    const loadSpellName = ref('');
    const loadSpellZeon = ref(0);
    const loadSpellMantain = ref(0);

    const handleLoadSpell = async () => {
      if (!loadSpellName.value || !loadSpellZeon.value) {
        return;
      }

      try {
        await gameState.addToReadyToCast({
          spell_id: null,
          spell_name: loadSpellName.value,
          spell_zeon: loadSpellZeon.value,
          spell_mantain: loadSpellMantain.value,
          spell_mantain_turn: false,
          spell_index: gameState.readyToCast.length
        });

        // Limpiar formulario
        loadSpellName.value = '';
        loadSpellZeon.value = 0;
        loadSpellMantain.value = 0;
      } catch (error) {
        console.error('Error cargando hechizo:', error);
      }
    };

    const handleUnloadSpell = async (spellId) => {
      try {
        await gameState.removeFromReadyToCast(spellId);
      } catch (error) {
        console.error('Error descargando hechizo:', error);
      }
    };

    const handleCastSpell = async () => {
      try {
        await gameState.clearAllReadyToCast();
      } catch (error) {
        console.error('Error lanzando hechizos:', error);
      }
    };

    return {
      gameState,
      loadSpellName,
      loadSpellZeon,
      loadSpellMantain,
      handleLoadSpell,
      handleUnloadSpell,
      handleCastSpell
    };
  }
};
</script>

<style scoped>
.ready-to-cast-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.ready-to-cast-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.load-spell-form {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 0.5rem;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-control:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-style: italic;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.table thead {
  background-color: #f8f9fa;
}

.table th,
.table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.table th {
  font-weight: 600;
  color: #495057;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.total-zeon {
  padding: 1rem;
  background-color: #e9ecef;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn-success {
  background-color: #198754;
  color: white;
}

.btn-success:hover {
  background-color: #157347;
}

.btn-warning {
  background-color: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background-color: #ffca2c;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

.btn-cast {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

body.dark-mode .ready-to-cast-container {
  background: #2d2d2d;
}

body.dark-mode .ready-to-cast-container h3 {
  color: #e0e0e0;
}

body.dark-mode .form-control {
  background-color: #1a1a1a;
  border-color: #404040;
  color: #e0e0e0;
}

body.dark-mode .table thead {
  background-color: #1a1a1a;
}

body.dark-mode .table th {
  color: #b0b0b0;
}

body.dark-mode .table td {
  color: #e0e0e0;
  border-bottom-color: #404040;
}

body.dark-mode .table tbody tr:hover {
  background-color: #353535;
}

body.dark-mode .total-zeon {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

body.dark-mode .empty-state {
  color: #666;
}
</style>

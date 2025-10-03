<template>
  <div class="spell-book-container">
    <div class="spell-book-header">
      <h3>Lista de Hechizos</h3>
      <button id="btn-add-new-spell" @click="openSpellForm" class="btn btn-success">
        <i class="bi bi-plus-circle"></i> Añadir hechizo nuevo
      </button>
    </div>

    <div v-if="spellsStore.spellBook.length === 0" class="empty-state">
      No hay hechizos guardados. Añade uno nuevo con el botón de arriba.
    </div>
    <div v-else class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Vía</th>
            <th>Base</th>
            <th>Mant Base</th>
            <th>Inter</th>
            <th>Mant Inter</th>
            <th>Avanz</th>
            <th>Mant Avanz</th>
            <th>Arcano</th>
            <th>Mant Arcano</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="spell in spellsStore.spellBook" :key="spell.id">
            <td>{{ spell.spell_name }}</td>
            <td>{{ spell.spell_via || '-' }}</td>
            <td>
              <button
                @click="handleAddToReadyToCast(spell, 'base')"
                class="btn btn-zeon btn-sm"
                :title="`Preparar ${spell.spell_name} (Base)`"
              >
                {{ spell.spell_base }}
              </button>
            </td>
            <td>{{ spell.spell_base_mantain || '-' }}</td>
            <td>
              <button
                @click="handleAddToReadyToCast(spell, 'inter')"
                class="btn btn-zeon btn-sm"
                :title="`Preparar ${spell.spell_name} (Intermedio)`"
              >
                {{ spell.spell_inter }}
              </button>
            </td>
            <td>{{ spell.spell_inter_mantain || '-' }}</td>
            <td>
              <button
                @click="handleAddToReadyToCast(spell, 'advanced')"
                class="btn btn-zeon btn-sm"
                :title="`Preparar ${spell.spell_name} (Avanzado)`"
              >
                {{ spell.spell_advanced }}
              </button>
            </td>
            <td>{{ spell.spell_advanced_mantain || '-' }}</td>
            <td>
              <button
                @click="handleAddToReadyToCast(spell, 'arcane')"
                class="btn btn-zeon btn-sm"
                :title="`Preparar ${spell.spell_name} (Arcano)`"
              >
                {{ spell.spell_arcane }}
              </button>
            </td>
            <td>{{ spell.spell_arcane_mantain || '-' }}</td>
            <td>
              <button
                @click="handleRemoveSpell(spell.spell_name)"
                class="btn btn-danger btn-sm"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Importar SpellForm como modal -->
    <SpellForm ref="spellFormRef" />
  </div>
</template>

<script>
import { ref } from 'vue';
import { useSpellsStore } from '@/stores/spells';
import { useGameStateStore } from '@/stores/gameState';
import SpellForm from './SpellForm.vue';

export default {
  name: 'SpellBook',
  components: {
    SpellForm
  },
  setup() {
    const spellsStore = useSpellsStore();
    const gameState = useGameStateStore();
    const spellFormRef = ref(null);

    const openSpellForm = () => {
      if (spellFormRef.value) {
        spellFormRef.value.showModal = true;
      }
    };

    const handleAddToReadyToCast = async (spell, level) => {
      try {
        // Determinar el coste de zeon y mantenimiento según el nivel
        let zeonCost = 0;
        let mantainCost = 0;
        let levelName = '';

        console.log('🔍 Hechizo completo:', spell);
        console.log('📊 Nivel seleccionado:', level);

        switch(level) {
          case 'base':
            zeonCost = spell.spell_base;
            mantainCost = spell.spell_base_mantain || 0;
            levelName = 'Base';
            break;
          case 'inter':
            zeonCost = spell.spell_inter;
            mantainCost = spell.spell_inter_mantain || 0;
            levelName = 'Intermedio';
            break;
          case 'advanced':
            zeonCost = spell.spell_advanced;
            mantainCost = spell.spell_advanced_mantain || 0;
            levelName = 'Avanzado';
            break;
          case 'arcane':
            zeonCost = spell.spell_arcane;
            mantainCost = spell.spell_arcane_mantain || 0;
            levelName = 'Arcano';
            break;
        }

        const dataToSend = {
          spell_id: spell.id,
          spell_name: `${spell.spell_name} (${levelName})`,
          spell_zeon: zeonCost,
          spell_mantain: mantainCost,
          spell_mantain_turn: false,
          spell_index: gameState.readyToCast.length
        };

        console.log('📤 Datos a enviar:', dataToSend);

        // Añadir a ready to cast con los campos correctos que espera el backend
        await gameState.addToReadyToCast(dataToSend);

        console.log(`✅ ${spell.spell_name} (${levelName}) añadido a hechizos a lanzar`);
      } catch (error) {
        console.error('❌ Error completo:', error);
        console.error('❌ Respuesta del servidor:', error.response?.data);
      }
    };

    const handleRemoveSpell = async (spellName) => {
      if (confirm(`¿Eliminar el hechizo "${spellName}"?`)) {
        try {
          await spellsStore.removeSpell(spellName);
        } catch (error) {
          console.error('Error eliminando hechizo:', error);
        }
      }
    };

    return {
      spellsStore,
      spellFormRef,
      openSpellForm,
      handleAddToReadyToCast,
      handleRemoveSpell
    };
  }
};
</script>

<style scoped>
.spell-book-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.spell-book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.spell-book-header h3 {
  margin: 0;
  color: #333;
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
  white-space: nowrap;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #bb2d3b;
}

.btn-zeon {
  background-color: #0d6efd;
  color: white;
  min-width: 45px;
}

.btn-zeon:hover {
  background-color: #0b5ed7;
  transform: scale(1.05);
}

.btn-success {
  background-color: #198754;
  color: white;
}

.btn-success:hover {
  background-color: #157347;
}

body.dark-mode .spell-book-container {
  background: #2d2d2d;
}

body.dark-mode .spell-book-header h3 {
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

body.dark-mode .empty-state {
  color: #666;
}
</style>

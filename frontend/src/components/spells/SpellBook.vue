<template>
  <div class="spell-book-container">
    <h3>Lista de Hechizos</h3>
    <div v-if="spellsStore.spellBook.length === 0" class="empty-state">
      No hay hechizos guardados. Añade uno nuevo arriba.
    </div>
    <div v-else class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Vía</th>
            <th>Base</th>
            <th>Inter</th>
            <th>Avanz</th>
            <th>Arcano</th>
            <th>Mant Base</th>
            <th>Mant Inter</th>
            <th>Mant Avanz</th>
            <th>Mant Arcano</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="spell in spellsStore.spellBook" :key="spell.id">
            <td>{{ spell.spell_name }}</td>
            <td>{{ spell.spell_via || '-' }}</td>
            <td>{{ spell.spell_base }}</td>
            <td>{{ spell.spell_inter }}</td>
            <td>{{ spell.spell_advanced }}</td>
            <td>{{ spell.spell_arcane }}</td>
            <td>{{ spell.spell_base_mantain || 0 }}</td>
            <td>{{ spell.spell_inter_mantain || 0 }}</td>
            <td>{{ spell.spell_advanced_mantain || 0 }}</td>
            <td>{{ spell.spell_arcane_mantain || 0 }}</td>
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
  </div>
</template>

<script>
import { useSpellsStore } from '@/stores/spells';

export default {
  name: 'SpellBook',
  setup() {
    const spellsStore = useSpellsStore();

    const handleRemoveSpell = async (spellName) => {
      if (confirm(`¿Eliminar el hechizo "${spellName}"?`)) {
        try {
          await spellsStore.removeSpell(spellName);
        } catch (error) {
          console.error('Error eliminando hechizo:', error);
          alert('Error al eliminar el hechizo');
        }
      }
    };

    return {
      spellsStore,
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

.spell-book-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
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

body.dark-mode .spell-book-container {
  background: #2d2d2d;
}

body.dark-mode .spell-book-container h3 {
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

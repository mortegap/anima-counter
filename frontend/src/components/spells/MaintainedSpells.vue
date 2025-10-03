<template>
  <div class="maintained-spells-container">
    <h3>{{ $t('spells.maintainedSpells') }}</h3>

    <div v-if="gameState.spellMantainList.length === 0" class="empty-state">
      {{ $t('spells.noMaintainedSpells') }}
    </div>
    <div v-else class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('spells.name') }}</th>
            <th>{{ $t('spells.maintenanceCost') }}</th>
            <th>{{ $t('spells.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="spell in gameState.spellMantainList" :key="spell.id">
            <td>{{ spell.spell_name }}</td>
            <td>{{ spell.spell_mantain }}</td>
            <td>
              <button
                @click="handleUnmantainSpell(spell.id)"
                class="btn btn-danger btn-sm"
              >
                {{ $t('common.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="total-mantain">
        <strong>{{ $t('spells.totalMaintenanceZeon') }}: {{ gameState.mantainZeonToSpend }}</strong>
      </div>
    </div>
  </div>
</template>

<script>
import { useGameStateStore } from '@/stores/gameState';
import { useI18n } from 'vue-i18n';

export default {
  name: 'MaintainedSpells',
  setup() {
    const gameState = useGameStateStore();
    const { t } = useI18n();

    const handleUnmantainSpell = async (spellId) => {
      if (confirm(t('spells.stopMaintainingConfirm'))) {
        try {
          await gameState.removeFromMantain(spellId);
        } catch (error) {
          console.error('Error eliminando mantenimiento:', error);
        }
      }
    };

    return {
      gameState,
      handleUnmantainSpell
    };
  }
};
</script>

<style scoped>
.maintained-spells-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.maintained-spells-container h3 {
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

.total-mantain {
  padding: 1rem;
  background-color: #fff3cd;
  border-radius: 4px;
  text-align: center;
  font-size: 1.1rem;
}

.btn {
  padding: 0.375rem 0.75rem;
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

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #bb2d3b;
}

body.dark-mode .maintained-spells-container {
  background: #2d2d2d;
}

body.dark-mode .maintained-spells-container h3 {
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

body.dark-mode .total-mantain {
  background-color: #3d3416;
  color: #e0e0e0;
}

body.dark-mode .empty-state {
  color: #666;
}
</style>

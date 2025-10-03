<template>
  <div>
    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Añadir Hechizo</h3>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="handleAddSpell" class="spell-form">
          <div class="form-row">
            <div class="form-group">
              <label for="spellName">Nombre:</label>
              <input
                type="text"
                id="spellName"
                v-model="formData.spell_name"
                placeholder="Nombre del hechizo"
                required
              />
            </div>
            <div class="form-group">
              <label for="spellVia">Vía:</label>
              <input
                type="text"
                id="spellVia"
                v-model="formData.spell_via"
                placeholder="Vía mágica"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="spellBase">Base:</label>
              <input
                type="number"
                id="spellBase"
                v-model.number="formData.spell_base"
                placeholder="0"
                required
              />
            </div>
            <div class="form-group">
              <label for="spellInter">Intermedio:</label>
              <input
                type="number"
                id="spellInter"
                v-model.number="formData.spell_inter"
                placeholder="0"
                required
              />
            </div>
            <div class="form-group">
              <label for="spellAdvanced">Avanzado:</label>
              <input
                type="number"
                id="spellAdvanced"
                v-model.number="formData.spell_advanced"
                placeholder="0"
                required
              />
            </div>
            <div class="form-group">
              <label for="spellArcane">Arcano:</label>
              <input
                type="number"
                id="spellArcane"
                v-model.number="formData.spell_arcane"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="spellBaseMantain">Mantener Base:</label>
              <input
                type="number"
                id="spellBaseMantain"
                v-model.number="formData.spell_base_mantain"
                placeholder="0"
              />
            </div>
            <div class="form-group">
              <label for="spellInterMantain">Mantener Inter:</label>
              <input
                type="number"
                id="spellInterMantain"
                v-model.number="formData.spell_inter_mantain"
                placeholder="0"
              />
            </div>
            <div class="form-group">
              <label for="spellAdvancedMantain">Mantener Avanzado:</label>
              <input
                type="number"
                id="spellAdvancedMantain"
                v-model.number="formData.spell_advanced_mantain"
                placeholder="0"
              />
            </div>
            <div class="form-group">
              <label for="spellArcaneMantain">Mantener Arcano:</label>
              <input
                type="number"
                id="spellArcaneMantain"
                v-model.number="formData.spell_arcane_mantain"
                placeholder="0"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">Añadir Hechizo</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useSpellsStore } from '@/stores/spells';

export default {
  name: 'SpellForm',
  setup() {
    const spellsStore = useSpellsStore();
    const showModal = ref(false);

    const formData = ref({
      spell_name: '',
      spell_via: '',
      spell_base: 0,
      spell_inter: 0,
      spell_advanced: 0,
      spell_arcane: 0,
      spell_base_mantain: 0,
      spell_inter_mantain: 0,
      spell_advanced_mantain: 0,
      spell_arcane_mantain: 0
    });

    const closeModal = () => {
      showModal.value = false;
    };

    const handleAddSpell = async () => {
      // Validar solo que tenga nombre (los costes pueden ser 0)
      if (!formData.value.spell_name || formData.value.spell_name.trim() === '') {
        return;
      }

      // Validar que los valores numéricos sean números válidos (0 es válido)
      if (typeof formData.value.spell_base !== 'number' ||
          typeof formData.value.spell_inter !== 'number' ||
          typeof formData.value.spell_advanced !== 'number' ||
          typeof formData.value.spell_arcane !== 'number') {
        return;
      }

      try {
        await spellsStore.addSpell(formData.value);

        // Limpiar formulario
        formData.value = {
          spell_name: '',
          spell_via: '',
          spell_base: 0,
          spell_inter: 0,
          spell_advanced: 0,
          spell_arcane: 0,
          spell_base_mantain: 0,
          spell_inter_mantain: 0,
          spell_advanced_mantain: 0,
          spell_arcane_mantain: 0
        };

        // Cerrar modal
        closeModal();
      } catch (error) {
        console.error('Error añadiendo hechizo:', error);
      }
    };

    return {
      formData,
      showModal,
      closeModal,
      handleAddSpell
    };
  }
};
</script>

<style scoped>
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-success {
  background-color: #198754;
  color: white;
}

.btn-success:hover {
  background-color: #157347;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5c636a;
}

.mb-3 {
  margin-bottom: 1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
}

.spell-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #555;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* Dark Mode */
body.dark-mode .modal-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}

body.dark-mode .modal-container {
  background: #2d2d2d;
}

body.dark-mode .modal-header h3 {
  color: #e0e0e0;
}

body.dark-mode .btn-close {
  color: #999;
}

body.dark-mode .btn-close:hover {
  color: #e0e0e0;
}

body.dark-mode .form-group label {
  color: #b0b0b0;
}

body.dark-mode .form-group input {
  background-color: #1a1a1a;
  border-color: #404040;
  color: #e0e0e0;
}

body.dark-mode .form-group input:focus {
  border-color: #0d6efd;
}
</style>

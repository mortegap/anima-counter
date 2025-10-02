<template>
  <div class="spell-form-container">
    <h3>Añadir Hechizo</h3>
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

      <button type="submit" class="btn btn-primary">Añadir Hechizo</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useSpellsStore } from '@/stores/spells';

export default {
  name: 'SpellForm',
  setup() {
    const spellsStore = useSpellsStore();

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

    const handleAddSpell = async () => {
      if (!formData.value.spell_name ||
          formData.value.spell_base === '' ||
          formData.value.spell_inter === '' ||
          formData.value.spell_advanced === '' ||
          formData.value.spell_arcane === '') {
        alert('Rellena todos los campos correctamente.');
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
      } catch (error) {
        console.error('Error añadiendo hechizo:', error);
        alert('Error al añadir el hechizo');
      }
    };

    return {
      formData,
      handleAddSpell
    };
  }
};
</script>

<style scoped>
.spell-form-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.spell-form-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
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

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

body.dark-mode .spell-form-container {
  background: #2d2d2d;
}

body.dark-mode .spell-form-container h3 {
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

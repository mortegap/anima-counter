import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from './auth';
import { useGameStateStore } from './gameState';

export const useSpellsStore = defineStore('spells', () => {
  // State
  const spellBook = ref([]);
  const readyToCast = ref([]);
  const spellMantainList = ref([]);

  // Computed
  const zeonToSpend = computed(() => {
    return readyToCast.value.reduce((total, spell) => {
      return total + parseInt(spell.spellZeon || 0);
    }, 0);
  });

  const mantainZeonToSpend = computed(() => {
    return spellMantainList.value.reduce((total, spell) => {
      return total + parseInt(spell.spellMantain || spell.spell_mantain || 0);
    }, 0);
  });

  // Actions - SpellBook
  async function fetchSpellBook() {
    const authStore = useAuthStore();
    if (!authStore.currentProfileId) return;

    try {
      const response = await axios.get(`/api/spells/${authStore.currentProfileId}`);
      spellBook.value = response.data;
    } catch (error) {
      console.error('Error fetching spell book:', error);
      throw error;
    }
  }

  async function addSpell(spellData) {
    const authStore = useAuthStore();

    if (!authStore.currentProfileId) {
      throw new Error('No hay perfil seleccionado. Por favor, inicia sesión de nuevo.');
    }

    try {
      const response = await axios.post(
        `/api/spells/${authStore.currentProfileId}`,
        spellData
      );
      spellBook.value.push(response.data);
    } catch (error) {
      console.error('Error adding spell:', error);
      throw error;
    }
  }

  async function removeSpell(spellName) {
    const authStore = useAuthStore();
    if (!authStore.currentProfileId) return;

    try {
      const spell = spellBook.value.find(s => s.spell_name === spellName);
      if (spell) {
        await axios.delete(`/api/spells/${authStore.currentProfileId}/${spell.id}`);
        const index = spellBook.value.findIndex(s => s.spell_name === spellName);
        if (index !== -1) {
          spellBook.value.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Error removing spell:', error);
      throw error;
    }
  }

  // Actions - Ready to Cast
  async function fetchReadyToCast() {
    const authStore = useAuthStore();
    if (!authStore.currentProfileId) return;

    try {
      const response = await axios.get(`/api/ready-to-cast/${authStore.currentProfileId}`);
      readyToCast.value = response.data.map((spell, index) => ({
        id: spell.id,
        spellIndex: index,
        spellName: spell.spell_name,
        spellZeon: spell.spell_zeon,
        spellMantain: spell.spell_mantain || 0,
        spellMantainTurn: spell.spell_mantain_turn || false,
        spell_id: spell.spell_id
      }));
    } catch (error) {
      console.error('Error fetching ready to cast:', error);
      throw error;
    }
  }

  async function loadSpell(spellName, spellZeon, spellMantain = 0) {
    const authStore = useAuthStore();
    if (!authStore.currentProfileId) return;

    try {
      const spell = spellBook.value.find(s => s.spell_name === spellName);
      const response = await axios.post(
        `/api/ready-to-cast/${authStore.currentProfileId}`,
        {
          spell_id: spell ? spell.id : null,
          spell_name: spellName,
          spell_zeon: spellZeon,
          spell_mantain: spellMantain || 0,
          spell_index: readyToCast.value.length
        }
      );

      readyToCast.value.push({
        id: response.data.id,
        spellIndex: readyToCast.value.length,
        spellName: spellName,
        spellZeon: spellZeon,
        spellMantain: spellMantain,
        spellMantainTurn: false,
        spell_id: spell ? spell.id : null
      });
    } catch (error) {
      console.error('Error loading spell:', error);
      throw error;
    }
  }

  async function unloadSpell(spellIndex, spellZeon) {
    const authStore = useAuthStore();
    if (!authStore.currentProfileId) return;

    try {
      const spell = readyToCast.value.find(s => s.spellIndex === spellIndex);
      if (spell) {
        await axios.delete(`/api/ready-to-cast/${authStore.currentProfileId}/${spell.id}`);
        const index = readyToCast.value.findIndex(s => s.spellIndex === spellIndex);
        if (index !== -1) {
          readyToCast.value.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Error unloading spell:', error);
      throw error;
    }
  }

  // Actions - Maintained Spells
  async function fetchMaintainedSpells() {
    const authStore = useAuthStore();
    if (!authStore.currentProfileId) return;

    try {
      const response = await axios.get(`/api/spell-mantain/${authStore.currentProfileId}`);
      spellMantainList.value = response.data.map((spell, index) => ({
        id: spell.id,
        spell_index: index,
        spell_name: spell.spell_name,
        spell_mantain: spell.spell_mantain,
        spell_id: spell.spell_id
      }));
    } catch (error) {
      console.error('Error fetching maintained spells:', error);
      throw error;
    }
  }

  async function unmantainSpell(spellIndex) {
    const authStore = useAuthStore();
    if (!authStore.currentProfileId) return;

    try {
      const spell = spellMantainList.value.find(s => s.spell_index === spellIndex);
      if (spell) {
        await axios.delete(`/api/spell-mantain/${authStore.currentProfileId}/${spell.id}`);
        const index = spellMantainList.value.findIndex(s => s.spell_index === spellIndex);
        if (index !== -1) {
          spellMantainList.value.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Error unmantaining spell:', error);
      throw error;
    }
  }

  // Actions - Cast Spell (complex operation)
  async function castSpell() {
    const authStore = useAuthStore();
    const gameStateStore = useGameStateStore();
    if (!authStore.currentProfileId) return;

    try {
      // 1. Mantener hechizos marcados
      const spellsToMantain = readyToCast.value.filter(entry => entry.spellMantainTurn === true);

      for (const spell of spellsToMantain) {
        const response = await axios.post(
          `/api/spell-mantain/${authStore.currentProfileId}`,
          {
            spell_id: spell.spell_id,
            spell_name: spell.spellName,
            spell_mantain: spell.spellMantain,
            spell_index: spellMantainList.value.length
          }
        );

        spellMantainList.value.push({
          id: response.data.id,
          spell_index: spellMantainList.value.length,
          spell_name: spell.spellName,
          spell_mantain: spell.spellMantain,
          spell_id: spell.spell_id
        });
      }

      // 2. Gasto de Zeon
      let zeona = parseInt(gameStateStore.zeona) - parseInt(zeonToSpend.value);
      let rzeon = parseInt(gameStateStore.rzeon);
      let zeonp = parseInt(gameStateStore.zeonp);

      if (zeona >= 10) {
        rzeon = rzeon + (zeona - 10);
        zeonp = zeonp + 10;
        zeona = 0;
      } else {
        rzeon = rzeon + zeona;
        zeona = 0;
      }

      // Actualizar game state
      gameStateStore.zeona = zeona;
      gameStateStore.rzeon = rzeon;
      gameStateStore.zeonp = zeonp;

      // 3. Limpiar ready to cast
      await axios.delete(`/api/ready-to-cast/${authStore.currentProfileId}`);
      readyToCast.value = [];

      // 4. Guardar cambios en game state
      await gameStateStore.saveGameState();
    } catch (error) {
      console.error('Error casting spell:', error);
      throw error;
    }
  }

  // Reset all spell data
  function resetSpellData() {
    spellBook.value = [];
    readyToCast.value = [];
    spellMantainList.value = [];
  }

  return {
    // State
    spellBook,
    readyToCast,
    spellMantainList,
    // Computed
    zeonToSpend,
    mantainZeonToSpend,
    // Actions
    fetchSpellBook,
    addSpell,
    removeSpell,
    fetchReadyToCast,
    loadSpell,
    unloadSpell,
    fetchMaintainedSpells,
    unmantainSpell,
    castSpell,
    resetSpellData
  };
});

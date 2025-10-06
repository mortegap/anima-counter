<template>
  <div class="profile-selector">
    <!-- Dropdown del perfil activo -->
    <div class="dropdown" ref="dropdownRef">
      <button
        class="btn btn-outline-dark dropdown-toggle profile-btn"
        type="button"
        @click="toggleDropdown"
        :disabled="profilesStore.loading"
      >
        <i class="bi bi-person-circle me-2"></i>
        <span>{{ profilesStore.activeProfileName || $t('profiles.selectProfile') }}</span>
      </button>

      <ul
        class="dropdown-menu dropdown-menu-end"
        :class="{ show: isDropdownOpen }"
      >
        <!-- Lista de perfiles -->
        <li v-for="profile in profilesStore.profiles" :key="profile.id">
          <a
            class="dropdown-item d-flex justify-content-between align-items-center"
            :class="{ active: profile.id === profilesStore.activeProfileId }"
            href="#"
            @click.prevent="selectProfile(profile.id)"
          >
            <span>{{ profile.name }}</span>
            <i v-if="profile.id === profilesStore.activeProfileId" class="bi bi-check-circle-fill text-success"></i>
          </a>
        </li>

        <li v-if="profilesStore.profiles.length > 0"><hr class="dropdown-divider"></li>

        <!-- Botón para crear nuevo perfil -->
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="openCreateModal"
            :class="{ disabled: profilesStore.totalProfiles >= 10 }"
          >
            <i class="bi bi-plus-circle me-2"></i>
            {{ $t('profiles.createNew') }}
          </a>
        </li>

        <!-- Botón para gestionar perfiles -->
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="openManageModal"
          >
            <i class="bi bi-gear me-2"></i>
            {{ $t('profiles.manage') }}
          </a>
        </li>
      </ul>
    </div>

    <!-- Modal para crear nuevo perfil -->
    <div
      class="modal fade"
      :class="{ show: showCreateModal, 'd-block': showCreateModal }"
      tabindex="-1"
      v-if="showCreateModal"
      @click.self="closeCreateModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ $t('profiles.createNew') }}</h5>
            <button type="button" class="btn-close" @click="closeCreateModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="newProfileName" class="form-label">{{ $t('profiles.profileName') }}</label>
              <input
                type="text"
                class="form-control"
                id="newProfileName"
                v-model="newProfileName"
                :placeholder="$t('profiles.profileNamePlaceholder')"
                maxlength="50"
                @keyup.enter="createNewProfile"
              >
              <div class="form-text">{{ $t('profiles.nameLength') }}</div>
            </div>
            <div v-if="createError" class="alert alert-danger">{{ createError }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreateModal">
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="createNewProfile"
              :disabled="!newProfileName || newProfileName.length < 3 || profilesStore.loading"
            >
              {{ $t('common.create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para gestionar perfiles -->
    <div
      class="modal fade"
      :class="{ show: showManageModal, 'd-block': showManageModal }"
      tabindex="-1"
      v-if="showManageModal"
      @click.self="closeManageModal"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ $t('profiles.manage') }}</h5>
            <button type="button" class="btn-close" @click="closeManageModal"></button>
          </div>
          <div class="modal-body">
            <div class="list-group">
              <div
                v-for="profile in profilesStore.profiles"
                :key="profile.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <!-- Modo vista -->
                <div v-if="editingProfileId !== profile.id" class="d-flex align-items-center flex-grow-1">
                  <i class="bi bi-person-circle me-3 fs-4"></i>
                  <div>
                    <strong>{{ profile.name }}</strong>
                    <span
                      v-if="profile.id === profilesStore.activeProfileId"
                      class="badge bg-success ms-2"
                    >
                      {{ $t('profiles.active') }}
                    </span>
                  </div>
                </div>

                <!-- Modo edición -->
                <div v-else class="d-flex align-items-center flex-grow-1">
                  <input
                    type="text"
                    class="form-control"
                    v-model="editingProfileName"
                    maxlength="50"
                    @keyup.enter="saveProfileEdit(profile.id)"
                  >
                </div>

                <!-- Botones de acción -->
                <div class="btn-group ms-2">
                  <template v-if="editingProfileId !== profile.id">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="startEdit(profile)"
                      :title="$t('common.edit')"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(profile)"
                      :disabled="profile.id === profilesStore.activeProfileId || profilesStore.totalProfiles <= 1"
                      :title="$t('common.delete')"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </template>
                  <template v-else>
                    <button
                      class="btn btn-sm btn-success"
                      @click="saveProfileEdit(profile.id)"
                      :disabled="!editingProfileName || editingProfileName.length < 3"
                    >
                      <i class="bi bi-check"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-secondary"
                      @click="cancelEdit"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </template>
                </div>
              </div>
            </div>
            <div v-if="manageError" class="alert alert-danger mt-3">{{ manageError }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeManageModal">
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop para los modales -->
    <div
      class="modal-backdrop fade"
      :class="{ show: showCreateModal || showManageModal }"
      v-if="showCreateModal || showManageModal"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useProfilesStore } from '../stores/profiles'
import { useGameStateStore } from '../stores/gameState'

const profilesStore = useProfilesStore()
const gameStateStore = useGameStateStore()

// Referencias
const dropdownRef = ref(null)

// Estado del dropdown
const isDropdownOpen = ref(false)

// Estado para crear nuevo perfil
const showCreateModal = ref(false)
const newProfileName = ref('')
const createError = ref(null)

// Estado para gestionar perfiles
const showManageModal = ref(false)
const editingProfileId = ref(null)
const editingProfileName = ref('')
const manageError = ref(null)

/**
 * Toggle dropdown
 */
function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

/**
 * Cerrar dropdown
 */
function closeDropdown() {
  isDropdownOpen.value = false
}

/**
 * Seleccionar perfil y cerrar dropdown
 */
async function selectProfile(profileId) {
  closeDropdown()
  await handleProfileSwitch(profileId)
}

/**
 * Abrir modal de crear
 */
function openCreateModal() {
  closeDropdown()
  showCreateModal.value = true
  createError.value = null
  newProfileName.value = ''
}

/**
 * Cerrar modal de crear
 */
function closeCreateModal() {
  showCreateModal.value = false
  createError.value = null
  newProfileName.value = ''
}

/**
 * Abrir modal de gestionar
 */
function openManageModal() {
  closeDropdown()
  showManageModal.value = true
  manageError.value = null
}

/**
 * Cerrar modal de gestionar
 */
function closeManageModal() {
  showManageModal.value = false
  manageError.value = null
  cancelEdit()
}

/**
 * Cambiar de perfil
 */
async function handleProfileSwitch(profileId) {
  if (profileId === profilesStore.activeProfileId) {
    return // Ya está activo
  }

  try {
    // Guardar estado actual antes de cambiar
    await gameStateStore.saveGameState()

    // Cambiar perfil
    await profilesStore.activateProfile(profileId)

    // Limpiar estado actual
    gameStateStore.resetState()

    // Cargar datos del nuevo perfil
    await gameStateStore.loadGameData()
  } catch (error) {
    console.error('Error cambiando perfil:', error)
    alert(error.message || 'Error al cambiar de perfil')
  }
}

/**
 * Crear nuevo perfil
 */
async function createNewProfile() {
  createError.value = null

  try {
    const profile = await profilesStore.createProfile(newProfileName.value)
    closeCreateModal()

    // Opcional: cambiar automáticamente al nuevo perfil
    // await handleProfileSwitch(profile.id)
  } catch (error) {
    createError.value = error.message || 'Error al crear el perfil'
  }
}

/**
 * Iniciar edición de un perfil
 */
function startEdit(profile) {
  editingProfileId.value = profile.id
  editingProfileName.value = profile.name
  manageError.value = null
}

/**
 * Cancelar edición
 */
function cancelEdit() {
  editingProfileId.value = null
  editingProfileName.value = ''
  manageError.value = null
}

/**
 * Guardar edición de perfil
 */
async function saveProfileEdit(profileId) {
  manageError.value = null

  try {
    await profilesStore.updateProfile(profileId, editingProfileName.value)
    cancelEdit()
  } catch (error) {
    manageError.value = error.message || 'Error al actualizar el perfil'
  }
}

/**
 * Confirmar eliminación de perfil
 */
async function confirmDelete(profile) {
  if (profile.id === profilesStore.activeProfileId) {
    manageError.value = 'No puedes eliminar el perfil activo'
    return
  }

  if (profilesStore.totalProfiles <= 1) {
    manageError.value = 'No puedes eliminar tu único perfil'
    return
  }

  if (confirm(`¿Estás seguro de que quieres eliminar el perfil "${profile.name}"? Esta acción no se puede deshacer.`)) {
    try {
      await profilesStore.deleteProfile(profile.id)
    } catch (error) {
      manageError.value = error.message || 'Error al eliminar el perfil'
    }
  }
}

/**
 * Cerrar dropdown al hacer clic fuera
 */
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.profile-selector {
  position: relative;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1050;
  display: none;
  min-width: 250px;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
}

.dropdown-menu.show {
  display: block;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop.show {
  opacity: 0.5;
}

.dropdown-item.active {
  background-color: var(--bs-primary);
  color: white;
}

.dropdown-item.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.list-group-item {
  border-left: 3px solid transparent;
}

.list-group-item:hover {
  background-color: var(--bs-light);
}

/* Botón de perfil - modo claro */
.profile-btn {
  color: #212529;
  border-color: #212529;
}

.profile-btn:hover {
  color: #fff;
  background-color: #212529;
  border-color: #212529;
}

/* Dark mode support */
body.dark-mode .profile-btn {
  color: #ffffff;
  border-color: #ffffff;
}

body.dark-mode .profile-btn:hover {
  color: #212529;
  background-color: #ffffff;
  border-color: #ffffff;
}

body.dark-mode .dropdown-menu {
  background-color: #2d2d2d;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.15);
}

body.dark-mode .dropdown-item {
  color: #ffffff;
}

body.dark-mode .dropdown-item:hover {
  background-color: #3d3d3d;
}

body.dark-mode .dropdown-item.active {
  background-color: var(--bs-primary);
}
</style>

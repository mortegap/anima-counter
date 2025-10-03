# 🐛 Bugfix: Sistema de Hechizos No Funcionaba

**Fecha**: Octubre 2025
**Estado**: ✅ RESUELTO

---

## Problema Reportado

Al hacer clic en el botón "Añadir Hechizo", aparecía un popup de éxito pero:
- ❌ El hechizo NO se añadía a la tabla visual
- ❌ El hechizo NO se guardaba en la base de datos
- ❌ No había errores visibles en la interfaz

---

## Investigación

### Síntomas encontrados
1. No había peticiones POST a `/api/spells` en los logs del backend
2. El popup de éxito aparecía incorrectamente
3. La consola mostraba: `👤 ProfileId: undefined`

---

## Causas Raíz Identificadas

### 1. **Falta de configuración de Axios** ❌
- **Archivo**: No existía configuración global
- **Problema**: Las peticiones HTTP no tenían baseURL configurada
- **Impacto**: Las peticiones no llegaban al backend

### 2. **Getter faltante en Auth Store** ❌ (CRÍTICO)
- **Archivo**: `/frontend/src/stores/auth.js`
- **Problema**: No existía el getter `currentProfileId`
- **Código problemático**:
  ```javascript
  // Solo había state, sin getters
  state: () => ({
    profile: null  // Objeto completo
  })
  ```
- **Llamada en Spells Store**:
  ```javascript
  authStore.currentProfileId  // ❌ undefined!
  ```
- **Resultado**: La función retornaba silenciosamente sin ejecutar la petición HTTP

### 3. **Validación de formulario demasiado estricta** ⚠️
- **Archivo**: `/frontend/src/components/spells/SpellForm.vue`
- **Problema**: Comparaba `0 === ''` para campos numéricos
- **Impacto menor**: Campos con valor 0 fallaban validación

### 4. **Manejo de errores silencioso** ⚠️
- **Problema**: `return` sin lanzar error cuando no hay profileId
- **Resultado**: El código continuaba hasta mostrar mensaje de éxito

---

## Soluciones Implementadas

### 1. ✅ Creada configuración global de Axios

**Archivo nuevo**: `/frontend/src/config/axios.js`

```javascript
import axios from 'axios';

// BaseURL vacío para usar proxy de nginx en producción
const baseURL = import.meta.env.VITE_API_URL || '';

if (baseURL) {
  axios.defaults.baseURL = baseURL;
}

axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para incluir token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Interceptor para manejar errores 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Importado en**: `/frontend/src/main.js`

```javascript
import './config/axios' // Antes de crear la app
```

---

### 2. ✅ Añadido getter `currentProfileId`

**Archivo**: `/frontend/src/stores/auth.js`

```javascript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    profile: null,
    isAuthenticated: false
  }),

  // ✅ AÑADIDO
  getters: {
    currentProfileId: (state) => state.profile?.id || null
  },

  actions: {
    // ...
  }
})
```

---

### 3. ✅ Mejorada validación del formulario

**Archivo**: `/frontend/src/components/spells/SpellForm.vue`

**Antes** ❌:
```javascript
if (!formData.value.spell_name ||
    formData.value.spell_base === '' ||
    formData.value.spell_inter === '' ||
    // ... compara números con string vacío
```

**Después** ✅:
```javascript
// Validar solo que tenga nombre (los costes pueden ser 0)
if (!formData.value.spell_name || formData.value.spell_name.trim() === '') {
  alert('El nombre del hechizo es requerido.');
  return;
}

// Validar que sean números válidos (0 es válido)
if (typeof formData.value.spell_base !== 'number' ||
    typeof formData.value.spell_inter !== 'number' ||
    // ...
```

---

### 4. ✅ Lanzar error en lugar de return silencioso

**Archivo**: `/frontend/src/stores/spells.js`

**Antes** ❌:
```javascript
if (!authStore.currentProfileId) {
  return;  // ❌ Continúa sin error
}
```

**Después** ✅:
```javascript
if (!authStore.currentProfileId) {
  throw new Error('No hay perfil seleccionado. Por favor, inicia sesión de nuevo.');
}
```

---

### 5. ✅ Creada carpeta `/frontend/public`

**Problema**: El build de Docker fallaba porque faltaba la carpeta
**Solución**:
```bash
mkdir -p /home/moperez/anima-counter/frontend/public
```

---

## Archivos Modificados/Creados

### Nuevos
1. `/frontend/src/config/axios.js` - Configuración global de Axios
2. `/frontend/public/` - Carpeta para assets públicos
3. `/frontend/public/.gitkeep` - Mantener carpeta en git

### Modificados
1. `/frontend/src/main.js` - Importar configuración de axios
2. `/frontend/src/stores/auth.js` - Añadir getter `currentProfileId`
3. `/frontend/src/stores/spells.js` - Lanzar error en lugar de return
4. `/frontend/src/components/spells/SpellForm.vue` - Mejorar validación

---

## Pruebas Realizadas

### ✅ Antes del fix
- Consola mostraba: `👤 ProfileId: undefined`
- No había POST requests en logs del backend
- Popup de éxito aparecía incorrectamente
- Base de datos: sin registros nuevos

### ✅ Después del fix
- Consola muestra: `👤 ProfileId: c630c7ce-ef7e-44b9-9519-ec0a8bf3d431`
- Backend logs muestran: `POST /api/spells/...`
- Popup solo aparece tras éxito real
- Base de datos: hechizo insertado correctamente
- Tabla se actualiza automáticamente

---

## Flujo Correcto Actual

```
1. Usuario rellena formulario
   ↓
2. Click "Añadir Hechizo"
   ↓
3. Validación del formulario (nombre requerido)
   ↓
4. SpellForm.vue → spellsStore.addSpell(data)
   ↓
5. Store valida currentProfileId
   ↓
6. POST /api/spells/{profileId} ✅
   ↓
7. Backend inserta en DB
   ↓
8. Response con spell creado
   ↓
9. Store añade spell a spellBook.value
   ↓
10. Vue reactivity actualiza la tabla ✅
    ↓
11. Popup de éxito + formulario limpio ✅
```

---

## Lecciones Aprendidas

1. **Siempre definir getters para computed values** en Pinia stores
2. **Lanzar errores explícitos** en lugar de returns silenciosos
3. **Configurar axios globalmente** al inicio de la app
4. **Validar tipos correctamente** (no comparar numbers con strings)
5. **Usar logs de debug** durante desarrollo para identificar problemas

---

## Prevención Futura

### Checklist para nuevas features
- [ ] ¿Está configurado axios correctamente?
- [ ] ¿Los getters necesarios están definidos?
- [ ] ¿Los errores se lanzan explícitamente?
- [ ] ¿La validación maneja todos los tipos correctamente?
- [ ] ¿Hay logs útiles para debugging?

---

**Estado Final**: ✅ Sistema de hechizos funcionando al 100%
**Próximo paso**: Tests automatizados (Fase 4)

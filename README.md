# 🏥 Bocangel Salud - Simulador de Reservas y Turnos Médicos

Aplicación web interactiva desarrollada para la **Entrega Final de JavaScript**. Simula de punta a punta el circuito comercial y operativo de un centro médico especializado: búsqueda y filtrado de profesionales, selección de fechas/horarios, cotización en tiempo real de estudios y servicios complementarios, confirmación con validación y comprobante digital, y persistencia local de turnos agendados.

---

## 🚀 Demostración y Ejecución Local

Para visualizar el proyecto localmente sin problemas con peticiones `fetch()` a archivos locales `.json`:

1. Clona o descarga este repositorio.
2. Abre la carpeta con un servidor local, por ejemplo usando la extensión **Live Server** de Visual Studio Code (click derecho en `index.html` ➔ *Open with Live Server*), o mediante Node.js:
   ```bash
   npx serve .
   ```
3. Navega a la URL local (ej. `http://localhost:3000` o `http://127.0.0.1:5500`).

---

## 📋 Checklist de Cumplimiento de Criterios de Evaluación

### 1. Estructura de Archivos
- [x] **`index.html`** y **`README.md`** son los únicos archivos en la raíz.
- [x] Carpeta `assets/` para recursos multimedia.
- [x] **Exactamente 3 archivos `.js`** modulares en `js/`:
  - `js/storage.js`: CRUD y persistencia en `localStorage`.
  - `js/ui.js`: Renderizado del DOM, notificaciones Toastify y modales SweetAlert2.
  - `js/app.js`: Lógica de negocio, peticiones `fetch`, funciones de orden superior y orquestación.
- [x] Base de datos simulada en `data/especialistas.json`.
- [x] Estilos modernos con Tailwind CSS CDN y ajustes complementarios en `css/styles.css`.

### 2. DOM e Interacción
- [x] **Prohibidos `prompt`, `alert` y `confirm` nativos:** Reemplazados al 100% por **SweetAlert2** y **Toastify JS**.
- [x] Manipulación dinámica del DOM: renderizado de especialistas, badges de disponibilidad, formulario modal interactivo, cotizador en tiempo real y bandeja de citas agendadas.

### 3. Arrays, Objetos y Funciones de Orden Superior (HOF)
- [x] El catálogo médico se encuentra íntegramente en `data/especialistas.json` y se consume asíncronamente con `fetch`.
- [x] Implementación de múltiples funciones de orden superior:
  - `filter()`: Para filtrar especialistas por especialidad y por término de búsqueda, así como para eliminar turnos por ID.
  - `find()`: Para localizar con exactitud el especialista seleccionado al abrir el modal.
  - `reduce()`: Para calcular en vivo el total acumulado entre la tarifa base del profesional y los exámenes/servicios complementarios seleccionados.
  - `map()`: Para transformar listas de horarios, días disponibles y generar etiquetas de resumen.
  - `forEach()`: Para renderizar elementos iterables en el DOM.

### 4. Storage y Sintaxis Avanzada (ES6+)
- [x] **`localStorage` completo**:
  - Guardar nueva cita médica (`StorageManager.guardarTurno`).
  - Modificar registros existentes (`StorageManager.modificarTurno`).
  - Borrar cita individual con confirmación (`StorageManager.eliminarTurno`).
  - Vaciar agenda por completo (`StorageManager.vaciarTurnos`).
- [x] **Sintaxis moderna**:
  - **Operador Ternario** (`condicion ? a : b` para badges, visibilidad de loaders y colores de notificación).
  - **Operador OR / Nullish Coalescing** (`JSON.parse(...) || []`).
  - **Destructuring** (`const { id, nombre, especialidad, tarifaBase } = medico`).

### 5. Asincronismo y Peticiones
- [x] Petición con `fetch()` a `data/especialistas.json`.
- [x] Estructurado con `async / await`.
- [x] Manejo robusto de errores con bloque `try / catch / finally`, informando al usuario en pantalla si la conexión o el archivo fallan.

### 6. Librerías Externas
- [x] **SweetAlert2**: Para confirmaciones críticas antes de agendar o cancelar citas, y para desplegar el comprobante digital final con ID de orden.
- [x] **Toastify JS**: Para notificaciones flotantes al añadir/quitar estudios complementarios y avisos del sistema.

### 7. Circuito del Negocio Completo (End-to-End)
1. **Explorar Directorio**: Filtrar por especialidad o buscar por nombre o estudio.
2. **Selección**: Click en "Reservar Turno" sobre cualquier especialista.
3. **Personalización**: Seleccionar fecha, horario y agregar servicios opcionales (ecocardiograma, biopsia, etc.).
4. **Cotización en Vivo**: Ver el desglose automático del presupuesto según las opciones seleccionadas.
5. **Datos del Paciente**: Completar datos personales y enviar el formulario.
6. **Confirmación**: Modal interactivo con SweetAlert2 para verificar los datos.
7. **Emisión de Comprobante**: Generación de código único de cita (`CSL-XXXXXX`) y resumen detallado.
8. **Gestión de Agenda**: Visualizar la cita en el panel lateral, con opción de cancelar citas individualmente o vaciar la agenda.

---

## 📂 Árbol del Proyecto

```text
proyecto_js/
│
├── index.html                   # Vista principal de la aplicación
├── README.md                    # Documentación y guía de entrega
│
├── css/
│   └── styles.css               # Reglas de estilo y fuentes complementarias
│
├── data/
│   └── especialistas.json       # Base de datos simulada en formato JSON
│
├── js/
│   ├── storage.js               # Persistencia en localStorage (CRUD)
│   ├── ui.js                    # Renderizado DOM y librerías externas
│   └── app.js                   # Orquestación, asincronismo y lógica de negocio
│
└── assets/
    └── img/                     # Recursos visuales del proyecto
```

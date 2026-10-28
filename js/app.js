/**
 * APP.JS
 * Orquestador principal de la aplicación.
 * Responsabilidades:
 * - Carga asíncrona de datos vía fetch() desde data/especialistas.json con async/await y try/catch/finally.
 * - Búsqueda y filtrado dinámico utilizando funciones de orden superior (filter, find).
 * - Cotización y cálculo de totales en tiempo real utilizando la función de orden superior reduce().
 * - Coordinación de eventos del DOM y persistencia en StorageManager.
 * - Sin uso de alert/prompt/confirm nativos.
 */

// Estado global de la aplicación en memoria de ejecución
const AppState = {
  especialistas: [],
  especialistaSeleccionado: null,
  extrasSeleccionados: [],
  filtroEspecialidad: 'todas',
  terminoBusqueda: '',
  cargando: false,
};

// Elementos de la interfaz (DOM)
const DOM = {
  // Catálogo y filtros
  gridEspecialistas: document.getElementById('gridEspecialistas'),
  selectEspecialidad: document.getElementById('selectEspecialidad'),
  inputBuscar: document.getElementById('inputBuscar'),
  badgeContadorResultados: document.getElementById('badgeContadorResultados'),
  loaderEstado: document.getElementById('loaderEstado'),

  // Modal / Drawer de Reserva
  modalReserva: document.getElementById('modalReserva'),
  btnCerrarModal: document.getElementById('btnCerrarModal'),
  formReserva: document.getElementById('formReserva'),
  modalDocAvatar: document.getElementById('modalDocAvatar'),
  modalDocNombre: document.getElementById('modalDocNombre'),
  modalDocEspecialidad: document.getElementById('modalDocEspecialidad'),
  modalDocTarifa: document.getElementById('modalDocTarifa'),
  selectHorarios: document.getElementById('selectHorarios'),
  contenedorServiciosExtra: document.getElementById('contenedorServiciosExtra'),
  inputFecha: document.getElementById('inputFecha'),

  // Desglose de cotización
  resumenSubtotal: document.getElementById('resumenSubtotal'),
  resumenExtras: document.getElementById('resumenExtras'),
  resumenTotal: document.getElementById('resumenTotal'),

  // Bandeja de Turnos Confirmados (Persistencia)
  contenedorListaTurnos: document.getElementById('contenedorListaTurnos'),
  contadorTurnosBadge: document.getElementById('contadorTurnosBadge'),
  btnVaciarAgenda: document.getElementById('btnVaciarAgenda'),
};

/**
 * 1. CONSUMO ASÍNCRONO DE DATOS LOCALES
 * Cumple con: fetch con async/await, bloque try/catch/finally y manejo de errores visible.
 */
async function cargarEspecialistas() {
  AppState.cargando = true;
  mostrarLoader(true);

  try {
    const respuesta = await fetch('data/especialistas.json');

    // Validación de respuesta HTTP
    if (!respuesta.ok) {
      throw new Error(`Error en servidor o archivo no encontrado: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    AppState.especialistas = datos;

    // Llenar dinámicamente las opciones del select de especialidades
    poblarFiltroEspecialidades(datos);

    // Renderizar catálogo inicial
    aplicarFiltrosYRenderizar();
    UIManager.mostrarNotificacion('Directorio médico sincronizado con éxito.', 'exito');
  } catch (error) {
    console.error('Fallo al cargar base de datos:', error);
    UIManager.mostrarNotificacion(
      'No se pudo conectar con el catálogo de especialistas. Intente más tarde.',
      'error'
    );
    DOM.gridEspecialistas.innerHTML = `
      <div class="col-span-full bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-center">
        <h4 class="font-bold text-base mb-1">Error de sincronización médica</h4>
        <p class="text-sm">No fue posible cargar el archivo <code>data/especialistas.json</code>. Verifique su entorno local o servidor.</p>
      </div>
    `;
  } finally {
    AppState.cargando = false;
    mostrarLoader(false);
  }
}

/**
 * Control del estado de carga visual
 */
function mostrarLoader(estaCargando) {
  // Operador ternario para alternar visibilidad
  DOM.loaderEstado.className = estaCargando
    ? 'flex items-center justify-center py-16'
    : 'hidden';
}

/**
 * Llena el selector de especialidades únicas a partir del JSON
 */
function poblarFiltroEspecialidades(especialistas) {
  // Uso de map y Set para obtener categorías sin duplicados
  const especialidadesUnicas = [
    ...new Set(especialistas.map((item) => item.especialidad)),
  ];

  especialidadesUnicas.forEach((esp) => {
    const option = document.createElement('option');
    option.value = esp;
    option.textContent = esp;
    DOM.selectEspecialidad.appendChild(option);
  });
}

/**
 * 2. FUNCIONES DE ORDEN SUPERIOR PARA FILTRADO Y BÚSQUEDA
 * Uso de filter() para discriminación por categoría y búsqueda textual.
 */
function aplicarFiltrosYRenderizar() {
  const { especialistas, filtroEspecialidad, terminoBusqueda } = AppState;

  const especialistasFiltrados = especialistas.filter((medico) => {
    const coincideEspecialidad =
      filtroEspecialidad === 'todas' || medico.especialidad === filtroEspecialidad;

    const coincideTexto =
      medico.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      medico.especialidad.toLowerCase().includes(terminoBusqueda.toLowerCase());

    return coincideEspecialidad && coincideTexto;
  });

  // Operador ternario para actualizar el badge de conteo
  DOM.badgeContadorResultados.textContent = `${especialistasFiltrados.length} disponible${
    especialistasFiltrados.length === 1 ? '' : 's'
  }`;

  UIManager.renderizarEspecialistas(
    DOM.gridEspecialistas,
    especialistasFiltrados,
    abrirModalReserva
  );
}

/**
 * 3. APERTURA DEL PROCESO DE RESERVA Y CONFIGURACIÓN DEL TURNO
 * Uso de find() para localizar al profesional.
 */
function abrirModalReserva(especialistaId) {
  // Función de orden superior find()
  const especialista = AppState.especialistas.find((m) => m.id === especialistaId);

  if (!especialista) {
    UIManager.mostrarNotificacion('Especialista no encontrado', 'error');
    return;
  }

  AppState.especialistaSeleccionado = especialista;
  AppState.extrasSeleccionados = [];

  // Destructuring de datos del especialista seleccionado
  const { nombre, especialidad, tarifaBase, imagen, horarios, serviciosExtra } = especialista;

  DOM.modalDocAvatar.src = imagen;
  DOM.modalDocNombre.textContent = nombre;
  DOM.modalDocEspecialidad.textContent = especialidad;
  DOM.modalDocTarifa.textContent = `$${tarifaBase.toLocaleString('es-AR')}`;

  // Configurar campo fecha mínima (a partir de mañana)
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1);
  const fechaMinima = hoy.toISOString().split('T')[0];
  DOM.inputFecha.min = fechaMinima;
  DOM.inputFecha.value = fechaMinima;

  // Llenar horarios disponibles
  DOM.selectHorarios.innerHTML = '';
  horarios.forEach((hora) => {
    const opt = document.createElement('option');
    opt.value = hora;
    opt.textContent = `${hora} hs`;
    DOM.selectHorarios.appendChild(opt);
  });

  // Renderizar checkboxes de servicios extra y exámenes
  DOM.contenedorServiciosExtra.innerHTML = '';
  serviciosExtra.forEach((extra) => {
    const label = document.createElement('label');
    label.className =
      'flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 cursor-pointer transition-all select-none';

    label.innerHTML = `
      <div class="flex items-center space-x-3">
        <input 
          type="checkbox" 
          value="${extra.id}" 
          class="check-extra-servicio h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" 
        />
        <span class="text-xs font-semibold text-slate-700">${extra.nombre}</span>
      </div>
      <span class="text-xs font-bold text-sky-700">+$${extra.precio.toLocaleString('es-AR')}</span>
    `;

    const checkbox = label.querySelector('.check-extra-servicio');
    checkbox.addEventListener('change', (e) => {
      manejarSeleccionExtra(extra, e.target.checked);
    });

    DOM.contenedorServiciosExtra.appendChild(label);
  });

  actualizarCotizacion();

  // Mostrar modal con animación
  DOM.modalReserva.classList.remove('hidden');
  DOM.modalReserva.classList.add('flex');
}

/**
 * Agrega o quita servicios adicionales al presupuesto
 */
function manejarSeleccionExtra(extra, estaSeleccionado) {
  if (estaSeleccionado) {
    AppState.extrasSeleccionados.push(extra);
    UIManager.mostrarNotificacion(`Añadido: ${extra.nombre}`, 'exito');
  } else {
    // filter() para remover el elemento del array
    AppState.extrasSeleccionados = AppState.extrasSeleccionados.filter(
      (item) => item.id !== extra.id
    );
  }
  actualizarCotizacion();
}

/**
 * 4. CÁLCULO DE TOTALES (COTIZADOR EN TIEMPO REAL)
 * Uso explícito de la función de orden superior reduce().
 */
function actualizarCotizacion() {
  const { especialistaSeleccionado, extrasSeleccionados } = AppState;

  if (!especialistaSeleccionado) return;

  const base = especialistaSeleccionado.tarifaBase;

  // HOF: reduce() para sumar el importe acumulado de todos los servicios extra
  const totalExtras = extrasSeleccionados.reduce(
    (acumulador, servicio) => acumulador + servicio.precio,
    0
  );

  const totalFinal = base + totalExtras;

  DOM.resumenSubtotal.textContent = `$${base.toLocaleString('es-AR')}`;
  DOM.resumenExtras.textContent = `$${totalExtras.toLocaleString('es-AR')}`;
  DOM.resumenTotal.textContent = `$${totalFinal.toLocaleString('es-AR')}`;
}

/**
 * Cierre del modal de reserva y limpieza de formulario
 */
function cerrarModalReserva() {
  DOM.modalReserva.classList.add('hidden');
  DOM.modalReserva.classList.remove('flex');
  DOM.formReserva.reset();
  AppState.especialistaSeleccionado = null;
  AppState.extrasSeleccionados = [];
}

/**
 * 5. CONFIRMACIÓN FINAL Y GUARDADO EN STORAGE
 * Circuito comercial completo de punta a punta.
 */
async function procesarReserva(evento) {
  evento.preventDefault();

  const { especialistaSeleccionado, extrasSeleccionados } = AppState;
  if (!especialistaSeleccionado) return;

  // Obtención y destructuring de los campos del formulario
  const nombreCompleto = document.getElementById('inputNombre').value.trim();
  const dni = document.getElementById('inputDni').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const telefono = document.getElementById('inputTelefono').value.trim();
  const fecha = DOM.inputFecha.value;
  const horario = DOM.selectHorarios.value;

  if (!nombreCompleto || !dni || !email || !telefono || !fecha || !horario) {
    UIManager.mostrarNotificacion('Por favor completa todos los campos del formulario', 'advertencia');
    return;
  }

  // Confirmación mediante SweetAlert2
  const confirmacion = await UIManager.confirmarAccion(
    '¿Confirmar agendamiento?',
    `Se reservará una cita con ${especialistaSeleccionado.nombre} para el día ${fecha} a las ${horario} hs.`
  );

  if (!confirmacion) return;

  // Cálculo del monto total usando reduce()
  const sumaExtras = extrasSeleccionados.reduce((acc, curr) => acc + curr.precio, 0);
  const total = especialistaSeleccionado.tarifaBase + sumaExtras;

  // Generación de código único de cita
  const codigoReserva = `CSL-${Math.floor(100000 + Math.random() * 900000)}`;

  const nuevaCita = {
    id: Date.now().toString(),
    codigo: codigoReserva,
    fechaCreacion: new Date().toISOString(),
    especialistaId: especialistaSeleccionado.id,
    especialista: especialistaSeleccionado.nombre,
    especialidad: especialistaSeleccionado.especialidad,
    fecha,
    horario,
    serviciosExtra: [...extrasSeleccionados],
    total,
    paciente: {
      nombreCompleto,
      dni,
      email,
      telefono,
    },
  };

  // Persistir en localStorage usando StorageManager
  const guardadoExitoso = StorageManager.guardarTurno(nuevaCita);

  if (guardadoExitoso) {
    cerrarModalReserva();
    refrescarBandejaTurnos();
    UIManager.mostrarNotificacion('Cita registrada y confirmada en sistema', 'exito');
    UIManager.mostrarComprobanteFinal(nuevaCita);
  } else {
    UIManager.mostrarNotificacion('No se pudo registrar la cita en el almacenamiento', 'error');
  }
}

/**
 * Actualiza la bandeja de turnos agendados desde Storage
 */
function refrescarBandejaTurnos() {
  const turnos = StorageManager.obtenerTurnos();

  // Contador badge con operador ternario
  DOM.contadorTurnosBadge.textContent = turnos.length;
  DOM.contadorTurnosBadge.className =
    turnos.length > 0
      ? 'inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-sky-600 rounded-full'
      : 'hidden';

  UIManager.renderizarTurnosAgendados(
    DOM.contenedorListaTurnos,
    turnos,
    cancelarTurnoIndividual
  );
}

/**
 * Cancelación de un turno individual con confirmación de SweetAlert2
 */
async function cancelarTurnoIndividual(turnoId) {
  const confirmado = await UIManager.confirmarAccion(
    '¿Cancelar esta cita?',
    'Esta acción liberará el cupo asignado y no se puede deshacer.',
    'Sí, cancelar cita'
  );

  if (confirmado) {
    StorageManager.eliminarTurno(turnoId);
    refrescarBandejaTurnos();
    UIManager.mostrarNotificacion('La cita ha sido cancelada correctamente.', 'advertencia');
  }
}

/**
 * Vaciado completo de agenda en localStorage con SweetAlert2
 */
async function vaciarTodaLaAgenda() {
  const turnosActuales = StorageManager.obtenerTurnos();
  if (turnosActuales.length === 0) {
    UIManager.mostrarNotificacion('No tienes citas pendientes para vaciar', 'advertencia');
    return;
  }

  const confirmado = await UIManager.confirmarAccion(
    '¿Vaciar todas tus citas?',
    'Se eliminarán de tu dispositivo todos los turnos agendados.',
    'Sí, vaciar todo'
  );

  if (confirmado) {
    StorageManager.vaciarTurnos();
    refrescarBandejaTurnos();
    UIManager.mostrarNotificacion('Se han vaciado todas las reservas agendadas.', 'exito');
  }
}

/**
 * 6. INICIALIZACIÓN Y EVENT LISTENERS
 */
document.addEventListener('DOMContentLoaded', () => {
  // Cargar catálogo vía Fetch
  cargarEspecialistas();

  // Cargar citas guardadas previamente en localStorage
  refrescarBandejaTurnos();

  // Filtro por especialidad
  DOM.selectEspecialidad.addEventListener('change', (e) => {
    AppState.filtroEspecialidad = e.target.value;
    aplicarFiltrosYRenderizar();
  });

  // Búsqueda por texto en tiempo real
  DOM.inputBuscar.addEventListener('input', (e) => {
    AppState.terminoBusqueda = e.target.value.trim();
    aplicarFiltrosYRenderizar();
  });

  // Modal eventos
  DOM.btnCerrarModal.addEventListener('click', cerrarModalReserva);

  // Cerrar modal al clickear fuera del contenedor blanco
  DOM.modalReserva.addEventListener('click', (e) => {
    if (e.target === DOM.modalReserva) {
      cerrarModalReserva();
    }
  });

  // Envío del formulario de reserva
  DOM.formReserva.addEventListener('submit', procesarReserva);

  // Vaciar Storage completo
  DOM.btnVaciarAgenda.addEventListener('click', vaciarTodaLaAgenda);
});

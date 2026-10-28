const AppState = {
  especialistas: [],
  especialistaSeleccionado: null,
  extrasSeleccionados: [],
  filtroEspecialidad: 'todas',
  terminoBusqueda: '',
  cargando: false,
};

const DOM = {
  gridEspecialistas: document.getElementById('gridEspecialistas'),
  selectEspecialidad: document.getElementById('selectEspecialidad'),
  inputBuscar: document.getElementById('inputBuscar'),
  badgeContadorResultados: document.getElementById('badgeContadorResultados'),
  loaderEstado: document.getElementById('loaderEstado'),

  modalReserva: document.getElementById('modalReserva'),
  btnCerrarModal: document.getElementById('btnCerrarModal'),
  formReserva: document.getElementById('formReserva'),
  modalDocAvatarBadge: document.getElementById('modalDocAvatarBadge'),
  modalDocNombre: document.getElementById('modalDocNombre'),
  modalDocEspecialidad: document.getElementById('modalDocEspecialidad'),
  modalDocTarifa: document.getElementById('modalDocTarifa'),
  selectHorarios: document.getElementById('selectHorarios'),
  contenedorServiciosExtra: document.getElementById('contenedorServiciosExtra'),
  inputFecha: document.getElementById('inputFecha'),

  resumenSubtotal: document.getElementById('resumenSubtotal'),
  resumenExtras: document.getElementById('resumenExtras'),
  resumenTotal: document.getElementById('resumenTotal'),

  contenedorListaTurnos: document.getElementById('contenedorListaTurnos'),
  contadorTurnosBadge: document.getElementById('contadorTurnosBadge'),
  btnVaciarAgenda: document.getElementById('btnVaciarAgenda'),
};

async function cargarEspecialistas() {
  AppState.cargando = true;
  mostrarLoader(true);

  try {
    const respuesta = await fetch('data/especialistas.json');

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    AppState.especialistas = datos;

    poblarFiltroEspecialidades(datos);
    aplicarFiltrosYRenderizar();
    UIManager.mostrarNotificacion('Directorio médico sincronizado.', 'exito');
  } catch {
    UIManager.mostrarNotificacion('No se pudo conectar con el catálogo de especialistas.', 'error');
    DOM.gridEspecialistas.innerHTML = `
      <div class="col-span-full bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-center">
        <h4 class="font-bold text-base mb-1">Error de sincronización médica</h4>
        <p class="text-sm">No fue posible cargar el catálogo de especialistas.</p>
      </div>
    `;
  } finally {
    AppState.cargando = false;
    mostrarLoader(false);
  }
}

function mostrarLoader(estaCargando) {
  DOM.loaderEstado.className = estaCargando
    ? 'flex items-center justify-center py-16'
    : 'hidden';
}

function poblarFiltroEspecialidades(especialistas) {
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

  DOM.badgeContadorResultados.textContent = `${especialistasFiltrados.length} disponible${
    especialistasFiltrados.length === 1 ? '' : 's'
  }`;

  UIManager.renderizarEspecialistas(
    DOM.gridEspecialistas,
    especialistasFiltrados,
    abrirModalReserva
  );
}

function abrirModalReserva(especialistaId) {
  const especialista = AppState.especialistas.find((m) => m.id === especialistaId);

  if (!especialista) {
    UIManager.mostrarNotificacion('Especialista no encontrado', 'error');
    return;
  }

  AppState.especialistaSeleccionado = especialista;
  AppState.extrasSeleccionados = [];

  const { nombre, especialidad, tarifaBase, iniciales, colorBadge, horarios, serviciosExtra } = especialista;

  DOM.modalDocAvatarBadge.className = `w-16 h-16 rounded-2xl ${colorBadge} flex items-center justify-center font-extrabold text-xl border border-slate-200/80 shadow-inner flex-shrink-0`;
  DOM.modalDocAvatarBadge.textContent = iniciales;

  DOM.modalDocNombre.textContent = nombre;
  DOM.modalDocEspecialidad.textContent = especialidad;
  DOM.modalDocTarifa.textContent = `S/ ${tarifaBase.toFixed(2)}`;

  const hoy = new Date();
  hoy.setDate(hoy.getDate() + 1);
  const fechaMinima = hoy.toISOString().split('T')[0];
  DOM.inputFecha.min = fechaMinima;
  DOM.inputFecha.value = fechaMinima;

  DOM.selectHorarios.innerHTML = '';
  horarios.forEach((hora) => {
    const opt = document.createElement('option');
    opt.value = hora;
    opt.textContent = `${hora} hs`;
    DOM.selectHorarios.appendChild(opt);
  });

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
      <span class="text-xs font-bold text-sky-700">+S/ ${extra.precio.toFixed(2)}</span>
    `;

    const checkbox = label.querySelector('.check-extra-servicio');
    checkbox.addEventListener('change', (e) => {
      manejarSeleccionExtra(extra, e.target.checked);
    });

    DOM.contenedorServiciosExtra.appendChild(label);
  });

  actualizarCotizacion();

  DOM.modalReserva.classList.remove('hidden');
  DOM.modalReserva.classList.add('flex');
}

function manejarSeleccionExtra(extra, estaSeleccionado) {
  if (estaSeleccionado) {
    AppState.extrasSeleccionados.push(extra);
    UIManager.mostrarNotificacion(`Añadido: ${extra.nombre}`, 'exito');
  } else {
    AppState.extrasSeleccionados = AppState.extrasSeleccionados.filter(
      (item) => item.id !== extra.id
    );
  }
  actualizarCotizacion();
}

function actualizarCotizacion() {
  const { especialistaSeleccionado, extrasSeleccionados } = AppState;

  if (!especialistaSeleccionado) return;

  const base = especialistaSeleccionado.tarifaBase;

  const totalExtras = extrasSeleccionados.reduce(
    (acumulador, servicio) => acumulador + servicio.precio,
    0
  );

  const totalFinal = base + totalExtras;

  DOM.resumenSubtotal.textContent = `S/ ${base.toFixed(2)}`;
  DOM.resumenExtras.textContent = `+S/ ${totalExtras.toFixed(2)}`;
  DOM.resumenTotal.textContent = `S/ ${totalFinal.toFixed(2)}`;
}

function cerrarModalReserva() {
  DOM.modalReserva.classList.add('hidden');
  DOM.modalReserva.classList.remove('flex');
  DOM.formReserva.reset();
  AppState.especialistaSeleccionado = null;
  AppState.extrasSeleccionados = [];
}

async function procesarReserva(evento) {
  evento.preventDefault();

  const { especialistaSeleccionado, extrasSeleccionados } = AppState;
  if (!especialistaSeleccionado) return;

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

  const confirmacion = await UIManager.confirmarAccion(
    '¿Confirmar agendamiento?',
    `Se reservará una cita con ${especialistaSeleccionado.nombre} para el día ${fecha} a las ${horario} hs.`
  );

  if (!confirmacion) return;

  const sumaExtras = extrasSeleccionados.reduce((acc, curr) => acc + curr.precio, 0);
  const total = especialistaSeleccionado.tarifaBase + sumaExtras;

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

function refrescarBandejaTurnos() {
  const turnos = StorageManager.obtenerTurnos();

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

document.addEventListener('DOMContentLoaded', () => {
  cargarEspecialistas();
  refrescarBandejaTurnos();

  DOM.selectEspecialidad.addEventListener('change', (e) => {
    AppState.filtroEspecialidad = e.target.value;
    aplicarFiltrosYRenderizar();
  });

  DOM.inputBuscar.addEventListener('input', (e) => {
    AppState.terminoBusqueda = e.target.value.trim();
    aplicarFiltrosYRenderizar();
  });

  DOM.btnCerrarModal.addEventListener('click', cerrarModalReserva);

  DOM.modalReserva.addEventListener('click', (e) => {
    if (e.target === DOM.modalReserva) {
      cerrarModalReserva();
    }
  });

  DOM.formReserva.addEventListener('submit', procesarReserva);
  DOM.btnVaciarAgenda.addEventListener('click', vaciarTodaLaAgenda);
});

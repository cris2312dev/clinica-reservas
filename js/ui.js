const UIManager = {
  mostrarNotificacion(mensaje, tipo = 'exito') {
    const fondo =
      tipo === 'exito'
        ? 'linear-gradient(to right, #0284c7, #0ea5e9)'
        : tipo === 'advertencia'
        ? 'linear-gradient(to right, #f59e0b, #d97706)'
        : 'linear-gradient(to right, #ef4444, #b91c1c)';

    Toastify({
      text: mensaje,
      duration: 3200,
      close: true,
      gravity: 'top',
      position: 'right',
      stopOnFocus: true,
      style: {
        background: fondo,
        borderRadius: '10px',
        fontWeight: '500',
        fontSize: '14px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    }).showToast();
  },

  async confirmarAccion(titulo, texto, confirmText = 'Sí, continuar', cancelText = 'Cancelar') {
    const resultado = await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#64748b',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-5 py-2.5 font-medium',
        cancelButton: 'rounded-xl px-5 py-2.5 font-medium',
      },
    });

    return resultado.isConfirmed;
  },

  mostrarComprobanteFinal(resumenReserva) {
    const { codigo, paciente, especialista, especialidad, fecha, horario, total, serviciosExtra } = resumenReserva;
    const listaExtras = serviciosExtra.length > 0
      ? serviciosExtra.map((s) => `<li class="flex justify-between py-1 text-xs text-slate-600"><span>• ${s.nombre}</span><span class="font-semibold">S/ ${s.precio.toFixed(2)}</span></li>`).join('')
      : '<li class="text-xs text-slate-400 italic">Sin estudios ni servicios adicionales.</li>';

    Swal.fire({
      icon: 'success',
      title: '<span class="text-xl font-bold text-slate-800">¡Cita Médica Confirmada!</span>',
      html: `
        <div class="text-left mt-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
            <span class="text-xs uppercase tracking-wider font-bold text-sky-700">Comprobante Digital</span>
            <span class="font-mono text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">${codigo}</span>
          </div>
          <p class="text-sm text-slate-700 mb-1"><strong class="text-slate-900">Paciente:</strong> ${paciente.nombreCompleto}</p>
          <p class="text-sm text-slate-700 mb-1"><strong class="text-slate-900">DNI:</strong> ${paciente.dni} | <strong class="text-slate-900">Email:</strong> ${paciente.email}</p>
          <p class="text-sm text-slate-700 mb-1"><strong class="text-slate-900">Especialista:</strong> ${especialista} (${especialidad})</p>
          <p class="text-sm text-slate-700 mb-3"><strong class="text-slate-900">Fecha y Hora:</strong> ${fecha} - ${horario} hs</p>
          
          <div class="mt-2 pt-2 border-t border-slate-200">
            <p class="text-xs font-bold text-slate-600 uppercase mb-1">Detalle de conceptos:</p>
            <ul class="mb-2 divide-y divide-slate-100">
              ${listaExtras}
            </ul>
            <div class="flex justify-between items-center pt-2 border-t border-slate-300 text-base font-extrabold text-slate-900">
              <span>Total Abonado:</span>
              <span class="text-sky-700 font-bold">S/ ${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0284c7',
      customClass: {
        popup: 'rounded-2xl max-w-lg',
        confirmButton: 'rounded-xl px-6 py-2.5 font-medium',
      },
    });
  },

  renderizarEspecialistas(contenedor, listaEspecialistas, onAbrirReserva) {
    contenedor.innerHTML = '';

    if (!listaEspecialistas || listaEspecialistas.length === 0) {
      contenedor.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200">
          <svg class="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p class="text-base font-semibold text-slate-700">No se encontraron profesionales con ese criterio.</p>
          <p class="text-xs text-slate-500 mt-1">Intenta con otra especialidad o término de búsqueda.</p>
        </div>
      `;
      return;
    }

    listaEspecialistas.forEach((medico) => {
      const { id, nombre, especialidad, experiencia, tarifaBase, calificacion, iniciales, colorBadge, diasDisponibles } = medico;

      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md card-transition flex flex-col justify-between';

      const diasEtiquetas = diasDisponibles
        .map((dia) => `<span class="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">${dia}</span>`)
        .join(' ');

      card.innerHTML = `
        <div class="p-5">
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-16 h-16 rounded-2xl ${colorBadge} flex items-center justify-center font-extrabold text-xl border border-slate-200/80 shadow-inner flex-shrink-0">
              ${iniciales}
            </div>
            <div>
              <span class="inline-block bg-sky-50 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider mb-1">
                ${especialidad}
              </span>
              <h3 class="text-lg font-bold text-slate-800 leading-snug">${nombre}</h3>
              <p class="text-xs text-slate-500">${experiencia} de trayectoria</p>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-600 my-3 py-2 border-y border-slate-100">
            <div class="flex items-center space-x-1 text-amber-500">
              <span>⭐</span>
              <span class="font-bold text-slate-700">${calificacion}</span>
              <span class="text-slate-400 text-[11px]">(Opiniones)</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block uppercase">Consulta Base</span>
              <span class="text-base font-extrabold text-slate-900">S/ ${tarifaBase.toFixed(2)}</span>
            </div>
          </div>

          <div class="mt-3">
            <span class="text-[11px] font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">Atención Presencial:</span>
            <div class="flex flex-wrap gap-1">
              ${diasEtiquetas}
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-100 mt-2">
          <button 
            type="button" 
            data-id="${id}"
            class="btn-solicitar-turno w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>Reservar Turno</span>
          </button>
        </div>
      `;

      const botonReserva = card.querySelector('.btn-solicitar-turno');
      botonReserva.addEventListener('click', () => onAbrirReserva(id));

      contenedor.appendChild(card);
    });
  },

  renderizarTurnosAgendados(contenedor, listaTurnos, onCancelarTurno) {
    contenedor.innerHTML = '';

    if (!listaTurnos || listaTurnos.length === 0) {
      contenedor.innerHTML = `
        <div class="text-center py-10 px-4">
          <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <p class="text-sm font-semibold text-slate-700">No tienes citas agendadas aún.</p>
          <p class="text-xs text-slate-400 mt-1">Selecciona un especialista del catálogo para iniciar tu reserva.</p>
        </div>
      `;
      return;
    }

    listaTurnos.forEach((turno) => {
      const { id, codigo, paciente, especialista, especialidad, fecha, horario, total, serviciosExtra } = turno;
      const tieneExtras = serviciosExtra && serviciosExtra.length > 0;

      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-sky-300 transition-colors relative';

      const badgesExtras = tieneExtras
        ? serviciosExtra.map((e) => `<span class="inline-block text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium mr-1 mb-1">+ ${e.nombre}</span>`).join('')
        : '<span class="text-[11px] text-slate-400 italic">Solo consulta médica base</span>';

      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <div>
            <span class="font-mono text-[11px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">${codigo}</span>
            <h4 class="text-sm font-bold text-slate-800 mt-1">${especialista}</h4>
            <span class="text-xs text-sky-600 font-medium">${especialidad}</span>
          </div>
          <button 
            type="button" 
            title="Cancelar esta cita" 
            data-id="${id}" 
            class="btn-cancelar-individual text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>

        <div class="text-xs text-slate-600 space-y-1 mb-2">
          <p><strong>Paciente:</strong> ${paciente.nombreCompleto} (DNI ${paciente.dni})</p>
          <p><strong>Fecha/Hora:</strong> ${fecha} a las <span class="text-sky-700 font-semibold">${horario} hs</span></p>
        </div>

        <div class="pt-2 border-t border-slate-100 text-xs">
          <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Prestaciones:</span>
          <div class="mb-2">
            ${badgesExtras}
          </div>
          <div class="flex justify-between items-center pt-1 font-bold">
            <span class="text-slate-600">Total liquidado:</span>
            <span class="text-sm text-slate-900">S/ ${total.toFixed(2)}</span>
          </div>
        </div>
      `;

      const btnCancelar = card.querySelector('.btn-cancelar-individual');
      btnCancelar.addEventListener('click', () => onCancelarTurno(id));

      contenedor.appendChild(card);
    });
  },
};

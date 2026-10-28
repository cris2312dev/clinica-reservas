/**
 * STORAGE.JS
 * Módulo encargado exclusivamente de la persistencia de datos en localStorage.
 * Cumple con operaciones CRUD: Obtener, Guardar, Modificar, Borrar individual y Vaciar.
 * Utiliza operadores avanzados: Nullish Coalescing / OR (||) y Destructuring.
 */

const STORAGE_KEY = 'clinica_san_lucas_turnos';

const StorageManager = {
  /**
   * Obtiene la lista actual de turnos agendados desde localStorage
   * @returns {Array} Lista de citas agendadas
   */
  obtenerTurnos() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    // Operador OR (||) para fallback seguro si es null o vacío
    const lista = JSON.parse(rawData) || [];
    return lista;
  },

  /**
   * Guarda un nuevo turno en el array de localStorage
   * @param {Object} nuevoTurno - Datos de la cita
   * @returns {boolean}
   */
  guardarTurno(nuevoTurno) {
    try {
      const turnos = this.obtenerTurnos();
      // Destructuring para validar campos clave
      const { id, especialistaId, fecha, horario } = nuevoTurno;

      if (!id || !especialistaId || !fecha || !horario) {
        return false;
      }

      turnos.push(nuevoTurno);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
      return true;
    } catch (error) {
      console.error('Error al guardar en storage:', error);
      return false;
    }
  },

  /**
   * Modifica los datos de un turno existente (ej. cambio de fecha, horario o extras)
   * @param {string|number} turnoId - Identificador único de la reserva
   * @param {Object} datosModificados - Campos a actualizar
   * @returns {boolean}
   */
  modificarTurno(turnoId, datosModificados) {
    try {
      const turnos = this.obtenerTurnos();
      const indice = turnos.findIndex((t) => t.id === turnoId);

      // Operador ternario para validar existencia
      if (indice === -1) return false;

      // Fusionamos manteniendo el ID inmutable
      turnos[indice] = {
        ...turnos[indice],
        ...datosModificados,
        id: turnoId,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
      return true;
    } catch (error) {
      console.error('Error al modificar en storage:', error);
      return false;
    }
  },

  /**
   * Elimina un turno específico según su identificador
   * @param {string|number} turnoId
   * @returns {boolean}
   */
  eliminarTurno(turnoId) {
    try {
      const turnos = this.obtenerTurnos();
      // Función de orden superior filter para remover el turno seleccionado
      const filtrados = turnos.filter((t) => t.id !== turnoId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
      return true;
    } catch (error) {
      console.error('Error al eliminar de storage:', error);
      return false;
    }
  },

  /**
   * Vacía por completo las citas agendadas en localStorage
   */
  vaciarTurnos() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

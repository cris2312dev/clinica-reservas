const STORAGE_KEY = 'clinica_san_lucas_turnos';

const StorageManager = {
  obtenerTurnos() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    return JSON.parse(rawData) || [];
  },

  guardarTurno(nuevoTurno) {
    try {
      const turnos = this.obtenerTurnos();
      const { id, especialistaId, fecha, horario } = nuevoTurno;

      if (!id || !especialistaId || !fecha || !horario) {
        return false;
      }

      turnos.push(nuevoTurno);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
      return true;
    } catch {
      return false;
    }
  },

  modificarTurno(turnoId, datosModificados) {
    try {
      const turnos = this.obtenerTurnos();
      const indice = turnos.findIndex((t) => t.id === turnoId);

      if (indice === -1) return false;

      turnos[indice] = {
        ...turnos[indice],
        ...datosModificados,
        id: turnoId,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
      return true;
    } catch {
      return false;
    }
  },

  eliminarTurno(turnoId) {
    try {
      const turnos = this.obtenerTurnos();
      const filtrados = turnos.filter((t) => t.id !== turnoId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
      return true;
    } catch {
      return false;
    }
  },

  vaciarTurnos() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, Calendar, RefreshCw } from 'lucide-react';
import { useAvailability } from '../hooks/useAvailability';
import type { AvailabilitySlot } from '../services/appointmentsService';
import appointmentsService from '../services/appointmentsService';
import { profileToAvailability, availabilityToProfile, validateSchedule } from '../utils/scheduleSync';

interface AvailabilityManagerProps {
  onSync?: (profileData: any) => void; // Callback para sincronizar con el perfil
  profileSchedule?: any; // Datos del perfil para sincronización inicial
}

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Lunes' },
  { key: 'TUESDAY', label: 'Martes' },
  { key: 'WEDNESDAY', label: 'Miércoles' },
  { key: 'THURSDAY', label: 'Jueves' },
  { key: 'FRIDAY', label: 'Viernes' },
  { key: 'SATURDAY', label: 'Sábado' },
  { key: 'SUNDAY', label: 'Domingo' },
] as const;

const AvailabilityManager: React.FC = () => {
  const { availability, loading, error, loadAvailability, updateAvailability, clearError } = useAvailability();
  const [editingSlots, setEditingSlots] = useState<AvailabilitySlot[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  useEffect(() => {
    setEditingSlots(availability);
  }, [availability]);

  const addSlot = () => {
    const newSlot: AvailabilitySlot = {
      day_of_week: 'MONDAY',
      start_time_minutes: 540, // 9:00 AM
      end_time_minutes: 1020,  // 5:00 PM
      is_active: true,
    };
    
    setEditingSlots([...editingSlots, newSlot]);
    setHasChanges(true);
  };

  const removeSlot = (index: number) => {
    const newSlots = editingSlots.filter((_, i) => i !== index);
    setEditingSlots(newSlots);
    setHasChanges(true);
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const newSlots = [...editingSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setEditingSlots(newSlots);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Limpiar los datos antes de enviar - solo los campos que acepta el backend
      const cleanSlots = editingSlots.map(slot => ({
        day_of_week: slot.day_of_week,
        start_time_minutes: slot.start_time_minutes,
        end_time_minutes: slot.end_time_minutes,
        is_active: slot.is_active
      }));
      
      await updateAvailability({ slots: cleanSlots });
      setHasChanges(false);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const resetChanges = () => {
    setEditingSlots(availability);
    setHasChanges(false);
    clearError();
  };

  const getTimeFromMinutes = (minutes: number): string => {
    return appointmentsService.minutesToTime(minutes);
  };

  const getMinutesFromTime = (time: string): number => {
    return appointmentsService.timeToMinutes(time);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">
              <Clock size={20} className="me-2" />
              Gestión de Horarios
            </h5>
            <small className="text-muted">Configura tus horarios de disponibilidad</small>
          </div>
          <div>
            <button
              className="btn btn-outline-primary btn-sm me-2"
              onClick={addSlot}
              disabled={loading}
            >
              <Plus size={16} className="me-1" />
              Agregar Horario
            </button>
            {hasChanges && (
              <>
                <button
                  className="btn btn-outline-secondary btn-sm me-2"
                  onClick={resetChanges}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-1" />
                      Guardar
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card-body">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={clearError}
              aria-label="Cerrar"
            ></button>
          </div>
        )}

        {editingSlots.length === 0 ? (
          <div className="text-center py-4">
            <Calendar size={48} className="text-muted mb-3" />
            <h6 className="text-muted">No hay horarios configurados</h6>
            <p className="text-muted">Agrega tus horarios de disponibilidad para que los pacientes puedan agendar citas</p>
            <button className="btn btn-primary" onClick={addSlot}>
              <Plus size={16} className="me-1" />
              Agregar Primer Horario
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Día</th>
                  <th>Hora Inicio</th>
                  <th>Hora Fin</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editingSlots.map((slot, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={slot.day_of_week}
                        onChange={(e) => updateSlot(index, 'day_of_week', e.target.value)}
                      >
                        {DAYS_OF_WEEK.map(day => (
                          <option key={day.key} value={day.key}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={getTimeFromMinutes(slot.start_time_minutes)}
                        onChange={(e) => updateSlot(index, 'start_time_minutes', getMinutesFromTime(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        value={getTimeFromMinutes(slot.end_time_minutes)}
                        onChange={(e) => updateSlot(index, 'end_time_minutes', getMinutesFromTime(e.target.value))}
                      />
                    </td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={slot.is_active}
                          onChange={(e) => updateSlot(index, 'is_active', e.target.checked)}
                        />
                        <label className="form-check-label">
                          {slot.is_active ? 'Activo' : 'Inactivo'}
                        </label>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeSlot(index)}
                        title="Eliminar horario"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingSlots.length > 0 && (
          <div className="mt-3">
            <small className="text-muted">
              <strong>Resumen:</strong> {editingSlots.filter(s => s.is_active).length} horarios activos de {editingSlots.length} total
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityManager;

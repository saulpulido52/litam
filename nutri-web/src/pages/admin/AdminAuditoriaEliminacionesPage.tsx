import React from 'react';
import AdminAuditoriaEliminaciones from '../../components/Admin/AdminAuditoriaEliminaciones';

const AdminAuditoriaEliminacionesPage: React.FC = () => {
    return (
        <div>
            <h2 className="mb-4">
                <i className="fas fa-trash-alt me-2 text-danger"></i>
                Auditoría de Eliminaciones
            </h2>
            <p className="text-muted mb-4">
                Registro completo de todas las eliminaciones de relaciones paciente-nutriólogo en el sistema.
                Esta información es exclusiva para administradores y ayuda a mantener la trazabilidad de las acciones.
            </p>
            <AdminAuditoriaEliminaciones />
        </div>
    );
};

export default AdminAuditoriaEliminacionesPage; 
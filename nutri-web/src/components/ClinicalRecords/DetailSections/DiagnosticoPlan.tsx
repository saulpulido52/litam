import React from 'react';
import type { ClinicalRecord } from '../../../types';

interface DiagnosticoPlanProps {
    record: ClinicalRecord;
}

const DiagnosticoPlan: React.FC<DiagnosticoPlanProps> = ({ record }) => {
    return (
        <div className="tab-pane fade show active">
            <div className="row">
                <div className="col-md-6">
                    <h6><i className="fas fa-stethoscope me-2"></i>Diagnóstico Nutricional</h6>
                    {record.nutritional_diagnosis ? (
                        <div className="alert alert-info">
                            {record.nutritional_diagnosis}
                        </div>
                    ) : (
                        <p className="text-muted">No especificado</p>
                    )}
                </div>
                <div className="col-md-6">
                    <h6><i className="fas fa-clipboard-check me-2"></i>Plan y Manejo Nutricional</h6>
                    {record.nutritional_plan_and_management ? (
                        <div className="bg-light p-3 rounded">
                            {record.nutritional_plan_and_management}
                        </div>
                    ) : (
                        <p className="text-muted">No especificado</p>
                    )}
                </div>
            </div>

            {record.evolution_and_follow_up_notes && (
                <div className="mt-4">
                    <h6><i className="fas fa-sticky-note me-2"></i>Notas de Evolución y Seguimiento</h6>
                    <div className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                        {record.evolution_and_follow_up_notes}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiagnosticoPlan;

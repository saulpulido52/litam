import React from 'react';
import type { ClinicalRecord } from '../../../types';

interface ProblemasActualesProps {
    record: ClinicalRecord;
}

const ProblemasActuales: React.FC<ProblemasActualesProps> = ({ record }) => {
    const renderProblemsList = (problems: any) => {
        if (!problems) return null;

        const problemLabels = {
            diarrhea: 'Diarrea',
            constipation: 'Estreñimiento',
            gastritis: 'Gastritis',
            ulcer: 'Úlcera',
            nausea: 'Náuseas',
            pyrosis: 'Pirosis',
            vomiting: 'Vómito',
            colitis: 'Colitis'
        };

        const activeProblems = Object.entries(problems)
            .filter(([key, value]) => value === true && problemLabels[key as keyof typeof problemLabels])
            .map(([key]) => problemLabels[key as keyof typeof problemLabels]);

        if (activeProblems.length === 0) return <span className="text-muted">Ninguno reportado</span>;

        return (
            <div className="d-flex flex-wrap gap-1">
                {activeProblems.map(problem => (
                    <span key={problem} className="badge bg-warning text-dark">{problem}</span>
                ))}
            </div>
        );
    };

    return (
        <div className="tab-pane fade show active">
            <h6><i className="fas fa-exclamation-triangle me-2"></i>Problemas Actuales</h6>

            {record.current_problems && (
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-primary">Problemas Gastrointestinales</h6>
                        {renderProblemsList(record.current_problems)}

                        {record.current_problems.mouth_mechanics && (
                            <div className="mt-3">
                                <strong>Mecánicos de la Boca:</strong>
                                <p className="text-muted">{record.current_problems.mouth_mechanics}</p>
                                <small className="text-muted">Ej: Dificultad para masticar, problemas dentales...</small>
                            </div>
                        )}
                    </div>
                    <div className="col-md-6">
                        {record.current_problems.other_problems && (
                            <div className="mb-3">
                                <strong>Otros Problemas:</strong>
                                <p className="text-muted">{record.current_problems.other_problems}</p>
                                <small className="text-muted">Describe otros problemas...</small>
                            </div>
                        )}

                        {record.current_problems.observations && (
                            <div>
                                <strong>Observaciones:</strong>
                                <p className="text-muted">{record.current_problems.observations}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemasActuales;

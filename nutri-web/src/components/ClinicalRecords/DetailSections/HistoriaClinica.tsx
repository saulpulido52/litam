import React from 'react';
import type { ClinicalRecord } from '../../../types';

interface HistoriaClinicaProps {
    record: ClinicalRecord;
}

const HistoriaClinica: React.FC<HistoriaClinicaProps> = ({ record }) => {
    return (
        <div className="tab-pane fade show active">
            <h6><i className="fas fa-heartbeat me-2"></i>Enfermedades Diagnosticadas</h6>

            {record.diagnosed_diseases && (
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-primary">Enfermedades Actuales</h6>
                        <table className="table table-sm">
                            <tbody>
                                <tr>
                                    <td><strong>¿Padece alguna enfermedad?</strong></td>
                                    <td>
                                        {record.diagnosed_diseases.has_disease ? (
                                            <span className="badge bg-warning">Sí</span>
                                        ) : (
                                            <span className="badge bg-success">No</span>
                                        )}
                                    </td>
                                </tr>
                                {record.diagnosed_diseases.has_disease && (
                                    <>
                                        {record.diagnosed_diseases.disease_name && (
                                            <tr>
                                                <td><strong>Enfermedad:</strong></td>
                                                <td>{record.diagnosed_diseases.disease_name}</td>
                                            </tr>
                                        )}
                                        {record.diagnosed_diseases.since_when && (
                                            <tr>
                                                <td><strong>¿Desde cuándo?</strong></td>
                                                <td>{record.diagnosed_diseases.since_when}</td>
                                            </tr>
                                        )}
                                    </>
                                )}
                                <tr>
                                    <td><strong>¿Toma medicamentos?</strong></td>
                                    <td>
                                        {record.diagnosed_diseases.takes_medication ? (
                                            <span className="badge bg-info">Sí</span>
                                        ) : (
                                            <span className="badge bg-secondary">No</span>
                                        )}
                                    </td>
                                </tr>
                                {record.diagnosed_diseases.takes_medication && record.diagnosed_diseases.medications_list && (
                                    <tr>
                                        <td><strong>Medicamentos:</strong></td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                {record.diagnosed_diseases.medications_list.map((med, index) => (
                                                    <span key={index} className="badge bg-light text-dark">
                                                        {med}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-primary">Historial Médico</h6>
                        <table className="table table-sm">
                            <tbody>
                                <tr>
                                    <td><strong>¿Enfermedad importante previa?</strong></td>
                                    <td>
                                        {record.diagnosed_diseases.has_important_disease ? (
                                            <span className="badge bg-warning">Sí</span>
                                        ) : (
                                            <span className="badge bg-success">No</span>
                                        )}
                                    </td>
                                </tr>
                                {record.diagnosed_diseases.has_important_disease && record.diagnosed_diseases.important_disease_name && (
                                    <tr>
                                        <td><strong>Enfermedad importante:</strong></td>
                                        <td>{record.diagnosed_diseases.important_disease_name}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td><strong>¿Tratamiento especial?</strong></td>
                                    <td>
                                        {record.diagnosed_diseases.takes_special_treatment ? (
                                            <span className="badge bg-info">Sí</span>
                                        ) : (
                                            <span className="badge bg-secondary">No</span>
                                        )}
                                    </td>
                                </tr>
                                {record.diagnosed_diseases.takes_special_treatment && record.diagnosed_diseases.special_treatment_details && (
                                    <tr>
                                        <td><strong>Detalles del tratamiento:</strong></td>
                                        <td>{record.diagnosed_diseases.special_treatment_details}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td><strong>¿Ha tenido cirugías?</strong></td>
                                    <td>
                                        {record.diagnosed_diseases.has_surgery ? (
                                            <span className="badge bg-warning">Sí</span>
                                        ) : (
                                            <span className="badge bg-success">No</span>
                                        )}
                                    </td>
                                </tr>
                                {record.diagnosed_diseases.has_surgery && record.diagnosed_diseases.surgery_details && (
                                    <tr>
                                        <td><strong>Detalles de cirugías:</strong></td>
                                        <td>{record.diagnosed_diseases.surgery_details}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Historia Familiar */}
            {record.family_medical_history && (
                <div className="mt-4">
                    <h6 className="text-primary">Antecedentes Familiares</h6>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="d-flex flex-wrap gap-2">
                                {record.family_medical_history.obesity && <span className="badge bg-warning">Obesidad</span>}
                                {record.family_medical_history.diabetes && <span className="badge bg-danger">Diabetes</span>}
                                {record.family_medical_history.hta && <span className="badge bg-info">Hipertensión</span>}
                                {record.family_medical_history.cancer && <span className="badge bg-dark">Cáncer</span>}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex flex-wrap gap-2">
                                {record.family_medical_history.hypo_hyperthyroidism && <span className="badge bg-primary">Tiroides</span>}
                                {record.family_medical_history.dyslipidemia && <span className="badge bg-secondary">Dislipidemia</span>}
                            </div>
                            {record.family_medical_history.other_history && (
                                <div className="mt-2">
                                    <strong>Otros:</strong> {record.family_medical_history.other_history}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoriaClinica;

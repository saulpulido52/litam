import React from 'react';
import type { ClinicalRecord } from '../../../types';

interface InfoGeneralProps {
    record: ClinicalRecord;
}

const InfoGeneral: React.FC<InfoGeneralProps> = ({ record }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="tab-pane fade show active">
            <div className="row">
                <div className="col-md-6">
                    <h6><i className="fas fa-calendar me-2"></i>Información General</h6>
                    <table className="table table-sm">
                        <tbody>
                            <tr>
                                <td><strong>Fecha del Registro:</strong></td>
                                <td>{formatDate(record.record_date)}</td>
                            </tr>
                            <tr>
                                <td><strong>Número de Expediente:</strong></td>
                                <td>{record.expedient_number || 'No asignado'}</td>
                            </tr>
                            <tr>
                                <td><strong>Motivo de Consulta:</strong></td>
                                <td>{record.consultation_reason || 'No especificado'}</td>
                            </tr>
                            {record.general_appearance && (
                                <tr>
                                    <td><strong>Apariencia General:</strong></td>
                                    <td>{record.general_appearance}</td>
                                </tr>
                            )}
                            {record.gynecological_aspects && (
                                <tr>
                                    <td><strong>Aspectos Ginecológicos:</strong></td>
                                    <td>{record.gynecological_aspects}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="col-md-6">
                    <h6><i className="fas fa-clock me-2"></i>Información Temporal</h6>
                    <table className="table table-sm">
                        <tbody>
                            <tr>
                                <td><strong>Creado:</strong></td>
                                <td>{formatDateTime(record.created_at)}</td>
                            </tr>
                            <tr>
                                <td><strong>Última Actualización:</strong></td>
                                <td>{formatDateTime(record.updated_at)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {record.daily_activities && (
                        <div className="mt-3">
                            <h6><i className="fas fa-calendar-day me-2"></i>Actividades Diarias</h6>
                            <div className="bg-light p-2 rounded">
                                {record.daily_activities.wake_up && <p><strong>Despertar:</strong> {record.daily_activities.wake_up}</p>}
                                {record.daily_activities.breakfast && <p><strong>Desayuno:</strong> {record.daily_activities.breakfast}</p>}
                                {record.daily_activities.lunch && <p><strong>Comida:</strong> {record.daily_activities.lunch}</p>}
                                {record.daily_activities.dinner && <p><strong>Cena:</strong> {record.daily_activities.dinner}</p>}
                                {record.daily_activities.sleep && <p><strong>Dormir:</strong> {record.daily_activities.sleep}</p>}
                                {record.daily_activities.other_hours && record.daily_activities.other_hours.length > 0 && (
                                    <div>
                                        <strong>Otras actividades:</strong>
                                        <ul>
                                            {record.daily_activities.other_hours.map((activity, index) => (
                                                <li key={index}>{activity.hour}: {activity.activity}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfoGeneral;

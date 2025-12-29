import React from 'react';
import type { ClinicalRecord } from '../../../types';

interface HistoriaDieteticaProps {
    record: ClinicalRecord;
}

const HistoriaDietetica: React.FC<HistoriaDieteticaProps> = ({ record }) => {
    const renderFoodList = (foods: string[] | undefined) => {
        if (!foods || foods.length === 0) return <span className="text-muted">No especificado</span>;
        return foods.join(', ');
    };

    return (
        <div className="tab-pane fade show active">
            <h6><i className="fas fa-utensils me-2"></i>Historia Dietética</h6>

            {record.dietary_history && (
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-primary">Orientación Nutricional</h6>
                        <table className="table table-sm">
                            <tbody>
                                <tr>
                                    <td><strong>Ha recibido orientación:</strong></td>
                                    <td>
                                        {record.dietary_history.received_nutritional_guidance ? (
                                            <span className="badge bg-success">Sí</span>
                                        ) : (
                                            <span className="badge bg-secondary">No</span>
                                        )}
                                    </td>
                                </tr>
                                {record.dietary_history.received_nutritional_guidance && (
                                    <tr>
                                        <td><strong>Cuándo:</strong></td>
                                        <td>{record.dietary_history.when_received}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td><strong>Nivel de Adherencia:</strong></td>
                                    <td>{record.dietary_history.adherence_level || 'No especificado'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-primary">Suplementos</h6>
                        <table className="table table-sm">
                            <tbody>
                                <tr>
                                    <td><strong>Toma suplementos:</strong></td>
                                    <td>
                                        {record.dietary_history.takes_supplements ? (
                                            <span className="badge bg-success">Sí</span>
                                        ) : (
                                            <span className="badge bg-secondary">No</span>
                                        )}
                                    </td>
                                </tr>
                                {record.dietary_history.takes_supplements && (
                                    <tr>
                                        <td><strong>Detalles:</strong></td>
                                        <td>{record.dietary_history.supplement_details}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="row mt-4">
                <div className="col-md-4">
                    <h6 className="text-primary">Alimentos Preferidos</h6>
                    <p className="text-muted">{renderFoodList(record.dietary_history?.preferred_foods)}</p>
                </div>
                <div className="col-md-4">
                    <h6 className="text-primary">Alimentos que No Le Gustan</h6>
                    <p className="text-muted">{renderFoodList(record.dietary_history?.disliked_foods)}</p>
                </div>
                <div className="col-md-4">
                    <h6 className="text-primary">Alimentos que Causan Malestar</h6>
                    <p className="text-muted">{renderFoodList(record.dietary_history?.malestar_alergia_foods)}</p>
                </div>
            </div>
        </div>
    );
};

export default HistoriaDietetica;

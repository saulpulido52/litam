import React from 'react';
import type { ClinicalRecord } from '../../../types';

interface AntropometriaProps {
    record: ClinicalRecord;
}

const Antropometria: React.FC<AntropometriaProps> = ({ record }) => {
    const calculateBMI = (weight?: number, height?: number) => {
        if (!weight || !height || height === 0) return null;
        const bmi = weight / (height * height);
        return bmi.toFixed(1);
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return 'Bajo peso';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Sobrepeso';
        return 'Obesidad';
    };

    return (
        <div className="tab-pane fade show active">
            <h6><i className="fas fa-ruler me-2"></i>Mediciones Antropométricas</h6>

            {record.anthropometric_measurements && (
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-primary">Peso y Estatura</h6>
                        <table className="table table-sm">
                            <tbody>
                                <tr>
                                    <td><strong>Peso Actual:</strong></td>
                                    <td>{record.anthropometric_measurements.current_weight_kg} kg</td>
                                </tr>
                                <tr>
                                    <td><strong>Peso Habitual:</strong></td>
                                    <td>{record.anthropometric_measurements.habitual_weight_kg} kg</td>
                                </tr>
                                <tr>
                                    <td><strong>Estatura:</strong></td>
                                    <td>{record.anthropometric_measurements.height_m} m</td>
                                </tr>
                                <tr>
                                    <td><strong>IMC:</strong></td>
                                    <td>
                                        {(() => {
                                            const bmi = calculateBMI(
                                                record.anthropometric_measurements.current_weight_kg,
                                                record.anthropometric_measurements.height_m
                                            );
                                            if (bmi) {
                                                const category = getBMICategory(parseFloat(bmi));
                                                return (
                                                    <span>
                                                        {bmi} - <span className="badge bg-info">{category}</span>
                                                    </span>
                                                );
                                            }
                                            return 'No calculable';
                                        })()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-primary">Circunferencias</h6>
                        <table className="table table-sm">
                            <tbody>
                                {record.anthropometric_measurements.waist_circ_cm && (
                                    <tr>
                                        <td><strong>Cintura:</strong></td>
                                        <td>{record.anthropometric_measurements.waist_circ_cm} cm</td>
                                    </tr>
                                )}
                                {record.anthropometric_measurements.hip_circ_cm && (
                                    <tr>
                                        <td><strong>Cadera:</strong></td>
                                        <td>{record.anthropometric_measurements.hip_circ_cm} cm</td>
                                    </tr>
                                )}
                                {record.anthropometric_measurements.abdominal_circ_cm && (
                                    <tr>
                                        <td><strong>Abdominal:</strong></td>
                                        <td>{record.anthropometric_measurements.abdominal_circ_cm} cm</td>
                                    </tr>
                                )}
                                {record.anthropometric_measurements.arm_circ_cm && (
                                    <tr>
                                        <td><strong>Brazo:</strong></td>
                                        <td>{record.anthropometric_measurements.arm_circ_cm} cm</td>
                                    </tr>
                                )}
                                {record.anthropometric_measurements.calf_circ_cm && (
                                    <tr>
                                        <td><strong>Pantorrilla:</strong></td>
                                        <td>{record.anthropometric_measurements.calf_circ_cm} cm</td>
                                    </tr>
                                )}
                                {record.anthropometric_measurements.waist_circ_cm && record.anthropometric_measurements.hip_circ_cm && (
                                    <tr>
                                        <td><strong>Relación Cintura/Cadera:</strong></td>
                                        <td>
                                            {(record.anthropometric_measurements.waist_circ_cm / record.anthropometric_measurements.hip_circ_cm).toFixed(2)}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Evaluaciones Antropométricas */}
            {record.anthropometric_evaluations && (
                <div className="row mt-4">
                    <div className="col-md-6">
                        <h6 className="text-primary">Análisis de Composición Corporal</h6>
                        <table className="table table-sm">
                            <tbody>
                                {record.anthropometric_evaluations.total_muscle_mass_kg && (
                                    <tr>
                                        <td><strong>Masa Muscular Total:</strong></td>
                                        <td>{record.anthropometric_evaluations.total_muscle_mass_kg} kg</td>
                                    </tr>
                                )}
                                {record.anthropometric_evaluations.body_fat_percentage && (
                                    <tr>
                                        <td><strong>Grasa Corporal:</strong></td>
                                        <td>{record.anthropometric_evaluations.body_fat_percentage}%</td>
                                    </tr>
                                )}
                                {record.anthropometric_evaluations.total_body_fat_kg && (
                                    <tr>
                                        <td><strong>Grasa Corporal Total:</strong></td>
                                        <td>{record.anthropometric_evaluations.total_body_fat_kg} kg</td>
                                    </tr>
                                )}
                                {record.anthropometric_evaluations.fat_free_mass_kg && (
                                    <tr>
                                        <td><strong>Masa Libre de Grasa:</strong></td>
                                        <td>{record.anthropometric_evaluations.fat_free_mass_kg} kg</td>
                                    </tr>
                                )}
                                {record.anthropometric_evaluations.ideal_weight_kg && (
                                    <tr>
                                        <td><strong>Peso Ideal:</strong></td>
                                        <td>{record.anthropometric_evaluations.ideal_weight_kg} kg</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-primary">Evaluaciones Adicionales</h6>
                        <table className="table table-sm">
                            <tbody>
                                {record.anthropometric_evaluations.total_body_water_liters && (
                                    <tr>
                                        <td><strong>Agua Corporal Total:</strong></td>
                                        <td>{record.anthropometric_evaluations.total_body_water_liters} litros</td>
                                    </tr>
                                )}
                                {record.anthropometric_evaluations.imc_kg_t2 && (
                                    <tr>
                                        <td><strong>IMC:</strong></td>
                                        <td>{record.anthropometric_evaluations.imc_kg_t2} kg/m²</td>
                                    </tr>
                                )}
                                {record.anthropometric_evaluations.waist_hip_ratio_cm && (
                                    <tr>
                                        <td><strong>Relación Cintura/Cadera:</strong></td>
                                        <td>{record.anthropometric_evaluations.waist_hip_ratio_cm}</td>
                                    </tr>
                                )}
                                {record.anthropometric_evaluations.arm_muscle_area_cm2 && (
                                    <tr>
                                        <td><strong>Área Muscular del Brazo:</strong></td>
                                        <td>{record.anthropometric_evaluations.arm_muscle_area_cm2} cm²</td>
                                    </tr>
                                )}
                                {record.anthropometric_evaluations.complexion && (
                                    <tr>
                                        <td><strong>Complexión:</strong></td>
                                        <td>{record.anthropometric_evaluations.complexion}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {record.blood_pressure && (
                <div className="mt-4">
                    <h6 className="text-primary">Presión Arterial</h6>
                    <div className="row">
                        <div className="col-md-6">
                            <table className="table table-sm">
                                <tbody>
                                    <tr>
                                        <td><strong>Conoce su presión arterial:</strong></td>
                                        <td>
                                            {record.blood_pressure.knows_bp ? (
                                                <span className="badge bg-success">Sí</span>
                                            ) : (
                                                <span className="badge bg-secondary">No</span>
                                            )}
                                        </td>
                                    </tr>
                                    {record.blood_pressure.knows_bp && (
                                        <>
                                            <tr>
                                                <td><strong>Sistólica:</strong></td>
                                                <td>{record.blood_pressure.systolic} mmHg</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Diastólica:</strong></td>
                                                <td>{record.blood_pressure.diastolic} mmHg</td>
                                            </tr>
                                            {record.blood_pressure.systolic !== undefined && record.blood_pressure.diastolic !== undefined && (
                                                <tr>
                                                    <td><strong>Presión Arterial:</strong></td>
                                                    <td>
                                                        <span className={`badge ${record.blood_pressure.systolic >= 140 || record.blood_pressure.diastolic >= 90
                                                            ? 'bg-danger'
                                                            : record.blood_pressure.systolic >= 120 || record.blood_pressure.diastolic >= 80
                                                                ? 'bg-warning'
                                                                : 'bg-success'
                                                            }`}>
                                                            {record.blood_pressure.systolic}/{record.blood_pressure.diastolic} mmHg
                                                        </span>
                                                    </td>
                                                </tr>
                                            )}
                                            {record.blood_pressure.habitual_bp && (
                                                <tr>
                                                    <td><strong>Presión Habitual:</strong></td>
                                                    <td>{record.blood_pressure.habitual_bp}</td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            {record.nutritional_diagnosis && (
                                <div>
                                    <h6 className="text-primary">Diagnóstico Nutricional</h6>
                                    <div className="bg-light p-3 rounded">
                                        <p className="mb-0">{record.nutritional_diagnosis}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Antropometria;

import React from 'react';
import type { ClinicalRecord } from '../../../types';

interface EstiloVidaProps {
    record: ClinicalRecord;
}

const EstiloVida: React.FC<EstiloVidaProps> = ({ record }) => {
    return (
        <div className="tab-pane fade show active">
            <h6><i className="fas fa-running me-2"></i>Estilo de Vida</h6>

            <div className="row">
                <div className="col-md-6">
                    {/* Ejercicio Físico */}
                    {record.physical_exercise && (
                        <div className="mb-4">
                            <h6 className="text-primary">Ejercicio Físico</h6>
                            <table className="table table-sm">
                                <tbody>
                                    <tr>
                                        <td><strong>¿Realiza ejercicio?</strong></td>
                                        <td>
                                            {record.physical_exercise.performs_exercise ? (
                                                <span className="badge bg-success">Sí</span>
                                            ) : (
                                                <span className="badge bg-secondary">No</span>
                                            )}
                                        </td>
                                    </tr>
                                    {record.physical_exercise.performs_exercise && (
                                        <>
                                            {record.physical_exercise.type && (
                                                <tr>
                                                    <td><strong>Tipo de ejercicio:</strong></td>
                                                    <td>{record.physical_exercise.type}</td>
                                                </tr>
                                            )}
                                            {record.physical_exercise.frequency && (
                                                <tr>
                                                    <td><strong>Frecuencia:</strong></td>
                                                    <td>{record.physical_exercise.frequency}</td>
                                                </tr>
                                            )}
                                            {record.physical_exercise.duration && (
                                                <tr>
                                                    <td><strong>Duración:</strong></td>
                                                    <td>{record.physical_exercise.duration}</td>
                                                </tr>
                                            )}
                                            {record.physical_exercise.since_when && (
                                                <tr>
                                                    <td><strong>¿Desde cuándo?</strong></td>
                                                    <td>{record.physical_exercise.since_when}</td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Nivel de Actividad */}
                    {record.activity_level_description && (
                        <div className="mb-3">
                            <h6 className="text-primary">Nivel de Actividad</h6>
                            <div className="bg-light p-3 rounded">
                                <p className="mb-0">{record.activity_level_description}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    {/* Hábitos de Consumo */}
                    {record.consumption_habits && (
                        <div className="mb-4">
                            <h6 className="text-primary">Hábitos de Consumo</h6>
                            <table className="table table-sm">
                                <tbody>
                                    {record.consumption_habits.alcohol && (
                                        <tr>
                                            <td><strong>Alcohol:</strong></td>
                                            <td>{record.consumption_habits.alcohol}</td>
                                        </tr>
                                    )}
                                    {record.consumption_habits.tobacco && (
                                        <tr>
                                            <td><strong>Tabaco:</strong></td>
                                            <td>{record.consumption_habits.tobacco}</td>
                                        </tr>
                                    )}
                                    {record.consumption_habits.coffee && (
                                        <tr>
                                            <td><strong>Café:</strong></td>
                                            <td>{record.consumption_habits.coffee}</td>
                                        </tr>
                                    )}
                                    {record.consumption_habits.other_substances && (
                                        <tr>
                                            <td><strong>Otras sustancias:</strong></td>
                                            <td>{record.consumption_habits.other_substances}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Consumo de agua */}
                    {record.water_consumption_liters && (
                        <div className="mb-3">
                            <h6 className="text-primary">Hidratación</h6>
                            <div className="bg-light p-3 rounded">
                                <p className="mb-0">
                                    <strong>Consumo de agua:</strong> {record.water_consumption_liters} litros/día
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Frecuencia de Consumo de Grupos de Alimentos */}
            {record.food_group_consumption_frequency && (
                <div className="mt-4">
                    <h6 className="text-primary">Frecuencia de Consumo de Grupos de Alimentos (Semanal)</h6>
                    <div className="row">
                        <div className="col-md-6">
                            <table className="table table-sm">
                                <tbody>
                                    {record.food_group_consumption_frequency.vegetables && (
                                        <tr>
                                            <td><strong>Vegetales:</strong></td>
                                            <td>{record.food_group_consumption_frequency.vegetables} veces/semana</td>
                                        </tr>
                                    )}
                                    {record.food_group_consumption_frequency.fruits && (
                                        <tr>
                                            <td><strong>Frutas:</strong></td>
                                            <td>{record.food_group_consumption_frequency.fruits} veces/semana</td>
                                        </tr>
                                    )}
                                    {record.food_group_consumption_frequency.cereals && (
                                        <tr>
                                            <td><strong>Cereales:</strong></td>
                                            <td>{record.food_group_consumption_frequency.cereals} veces/semana</td>
                                        </tr>
                                    )}
                                    {record.food_group_consumption_frequency.legumes && (
                                        <tr>
                                            <td><strong>Leguminosas:</strong></td>
                                            <td>{record.food_group_consumption_frequency.legumes} veces/semana</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <table className="table table-sm">
                                <tbody>
                                    {record.food_group_consumption_frequency.animal_products && (
                                        <tr>
                                            <td><strong>Productos Animales:</strong></td>
                                            <td>{record.food_group_consumption_frequency.animal_products} veces/semana</td>
                                        </tr>
                                    )}
                                    {record.food_group_consumption_frequency.milk_products && (
                                        <tr>
                                            <td><strong>Lácteos:</strong></td>
                                            <td>{record.food_group_consumption_frequency.milk_products} veces/semana</td>
                                        </tr>
                                    )}
                                    {record.food_group_consumption_frequency.fats && (
                                        <tr>
                                            <td><strong>Grasas:</strong></td>
                                            <td>{record.food_group_consumption_frequency.fats} veces/semana</td>
                                        </tr>
                                    )}
                                    {record.food_group_consumption_frequency.sugars && (
                                        <tr>
                                            <td><strong>Azúcares:</strong></td>
                                            <td>{record.food_group_consumption_frequency.sugars} veces/semana</td>
                                        </tr>
                                    )}
                                    {record.food_group_consumption_frequency.alcohol && (
                                        <tr>
                                            <td><strong>Alcohol:</strong></td>
                                            <td>{record.food_group_consumption_frequency.alcohol} veces/semana</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {record.food_group_consumption_frequency.other_frequency && record.food_group_consumption_frequency.other_frequency.length > 0 && (
                        <div className="mt-3">
                            <h6 className="text-primary">Otros Grupos de Alimentos</h6>
                            <div className="bg-light p-3 rounded">
                                {record.food_group_consumption_frequency.other_frequency.map((item, index) => (
                                    <p key={index} className="mb-1">
                                        <strong>{item.group}:</strong> {item.frequency} veces/semana
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Registro Dietético Diario */}
            {record.daily_diet_record && (
                <div className="mt-4">
                    <h6 className="text-primary">Recordatorio de 24 Horas</h6>
                    {record.daily_diet_record.time_intervals && record.daily_diet_record.time_intervals.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Hora</th>
                                        <th>Alimentos</th>
                                        <th>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {record.daily_diet_record.time_intervals.map((interval, index) => (
                                        <tr key={index}>
                                            <td>{interval.time}</td>
                                            <td>{interval.foods}</td>
                                            <td>{interval.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {record.daily_diet_record.estimated_kcal && (
                        <div className="mt-2">
                            <span className="badge bg-primary">
                                Calorías estimadas: {record.daily_diet_record.estimated_kcal} kcal
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EstiloVida;

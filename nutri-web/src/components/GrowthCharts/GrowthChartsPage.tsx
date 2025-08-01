// nutri-web/src/components/GrowthCharts/GrowthChartsPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Baby, Calculator, Settings, Download, ArrowLeft, FileText, TrendingUp, Users } from 'lucide-react';
import GrowthChart from './GrowthChart';
import api from '../../services/api';
import { getPediatricInfo, getAgeDescription } from '../../utils/pediatricHelpers';

interface PatientData {
    id: string;
    name: string;
    birthDate: string;
    gender: 'male' | 'female';
    measurements: {
        date: string;
        ageMonths: number;
        weight: number;
        height: number;
    }[];
}

const GrowthChartsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const patientIdFromUrl = searchParams.get('patientId');
    
    const [activeTab, setActiveTab] = useState('charts');
    const [selectedMetric, setSelectedMetric] = useState<'weight_for_age' | 'height_for_age' | 'bmi_for_age' | 'weight_for_height' | 'head_circumference'>('weight_for_age');
    const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
    const [selectedSource, setSelectedSource] = useState<'WHO' | 'CDC'>('WHO');
    const [ageRange, setAgeRange] = useState<[number, number]>([0, 60]); // 0-5 años por defecto
    const [selectedPatient, setSelectedPatient] = useState<string>(patientIdFromUrl || '');
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPatientInfo, setCurrentPatientInfo] = useState<any>(null);

    // Datos de cálculo individual
    const [calculationData, setCalculationData] = useState({
        ageMonths: '',
        value: '',
        gender: 'male' as 'male' | 'female',
        metricType: 'weight_for_age' as any,
        source: 'WHO' as 'WHO' | 'CDC'
    });
    const [calculationResult, setCalculationResult] = useState<any>(null);

    // Cargar pacientes pediátricos
    useEffect(() => {
        const fetchPediatricPatients = async () => {
            try {
                setLoading(true);
                
                // Si hay un patientId específico, cargar solo ese paciente
                if (patientIdFromUrl) {
                    const result = await api.get(`/patients/${patientIdFromUrl}`);
                    if (result.status === 'success' && result.data) {
                        const patient = result.data as any;
                        const pediatricInfo = getPediatricInfo(patient.user?.birth_date || patient.birth_date);
                        
                        if (pediatricInfo.isPediatric) {
                            setCurrentPatientInfo(patient);
                            setSelectedGender(patient.gender || 'male');
                            
                            // Ajustar la fuente de datos según la edad
                            if (pediatricInfo.growthChartsAvailable.CDC && !pediatricInfo.growthChartsAvailable.WHO) {
                                setSelectedSource('CDC');
                            }
                            
                            // Cargar mediciones del paciente si existen
                            const clinicalRecordsResult = await api.get(`/patients/${patientIdFromUrl}/clinical-records`);
                            if (clinicalRecordsResult.status === 'success' && clinicalRecordsResult.data) {
                                const measurements = extractMeasurementsFromRecords(clinicalRecordsResult.data as any[], patient.user?.birth_date || patient.birth_date);
                                
                                const patientData: PatientData = {
                                    id: patient.id,
                                    name: `${patient.first_name} ${patient.last_name}`,
                                    birthDate: patient.user?.birth_date || patient.birth_date || '',
                                    gender: patient.gender || 'male',
                                    measurements
                                };
                                setPatients([patientData]);
                            }
                        }
                    }
                } else {
                    // Cargar todos los pacientes pediátricos
                    const result = await api.get('/patients/my-patients');
                    console.log('🔍 Respuesta completa de pacientes:', result);
                    console.log('🔍 result.data:', result.data);
                    console.log('🔍 typeof result.data:', typeof result.data);
                    console.log('🔍 Array.isArray(result.data):', Array.isArray(result.data));
                    
                    if (result.status === 'success' && result.data) {
                        // Manejar diferentes estructuras de respuesta
                        let patientsArray: any[] = [];
                        
                        const responseData = result.data as any;
                        
                        if (Array.isArray(responseData)) {
                            // Si result.data es directamente un array
                            patientsArray = responseData;
                            console.log('✅ Usando result.data directamente (es array)');
                        } else if (responseData.data && Array.isArray(responseData.data)) {
                            // Si los datos están en result.data.data
                            patientsArray = responseData.data;
                            console.log('✅ Usando result.data.data (estructura anidada)');
                        } else if (responseData.patients && Array.isArray(responseData.patients)) {
                            // Si los datos están en result.data.patients
                            patientsArray = responseData.patients;
                            console.log('✅ Usando result.data.patients');
                        } else {
                            console.warn('⚠️ Estructura de respuesta no reconocida:', Object.keys(responseData || {}));
                            patientsArray = [];
                        }
                        
                        console.log(`📊 Array de pacientes encontrado: ${patientsArray.length} pacientes`);
                        
                        const pediatricPatients = patientsArray.filter((patient: any) => {
                            // La fecha de nacimiento puede estar en diferentes ubicaciones
                            const birthDate = patient.user?.birth_date || patient.birth_date || patient.user?.birthDate;
                            console.log(`🔍 Paciente ${patient.id}:`, {
                                name: `${patient.user?.first_name || patient.first_name} ${patient.user?.last_name || patient.last_name}`,
                                birthDate,
                                hasBirthDate: !!birthDate
                            });
                            
                            if (!birthDate) {
                                console.log(`⚠️ Paciente sin fecha de nacimiento: ${patient.id}`);
                                return false;
                            }
                            
                            const info = getPediatricInfo(birthDate);
                            console.log(`📊 Info pediátrica:`, info);
                            return info.isPediatric;
                        });
                        
                        console.log(`👶 Pacientes pediátricos filtrados: ${pediatricPatients.length} de ${patientsArray.length}`);
                        
                        // Transformar a formato PatientData simplificado
                        const transformedPatients: PatientData[] = pediatricPatients.map((patient: any) => ({
                            id: patient.id,
                            name: `${patient.user?.first_name || patient.first_name || 'Sin nombre'} ${patient.user?.last_name || patient.last_name || ''}`.trim(),
                            birthDate: patient.user?.birth_date || patient.birth_date || patient.user?.birthDate || '',
                            gender: patient.user?.gender || patient.gender || 'male',
                            measurements: [] // Se cargarán cuando se seleccione el paciente
                        }));
                        
                        setPatients(transformedPatients);
                    }
                }
            } catch (error) {
                console.error('Error cargando pacientes pediátricos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPediatricPatients();
    }, [patientIdFromUrl]);
    
    // Función auxiliar para extraer mediciones de los expedientes clínicos
    const extractMeasurementsFromRecords = (records: any[], birthDate: string): any[] => {
        const measurements: any[] = [];
        
        records.forEach(record => {
            if (record.anthropometric_measurements && record.created_at && birthDate) {
                const measurementDate = new Date(record.created_at);
                const birth = new Date(birthDate);
                
                // Calcular edad en meses en el momento de la medición
                const yearsDiff = measurementDate.getFullYear() - birth.getFullYear();
                const monthsDiff = measurementDate.getMonth() - birth.getMonth();
                const daysDiff = measurementDate.getDate() - birth.getDate();
                
                let ageInMonths = yearsDiff * 12 + monthsDiff;
                if (daysDiff < 0) {
                    ageInMonths--;
                }
                
                const measurement: any = {
                    date: record.created_at,
                    ageMonths: Math.max(0, ageInMonths)
                };
                
                if (record.anthropometric_measurements.current_weight_kg) {
                    measurement.weight = record.anthropometric_measurements.current_weight_kg;
                }
                
                if (record.anthropometric_measurements.height_m) {
                    measurement.height = record.anthropometric_measurements.height_m * 100; // Convertir a cm
                }
                
                if (measurement.weight || measurement.height) {
                    measurements.push(measurement);
                }
            }
        });
        
        // Ordenar por fecha
        return measurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    // Calcular percentil individual
    const calculatePercentile = async () => {
        try {
            setLoading(true);
            
            const result = await api.post('/growth-charts/calculate-percentile', {
                ageMonths: Number(calculationData.ageMonths),
                value: Number(calculationData.value),
                gender: calculationData.gender,
                metricType: calculationData.metricType,
                source: calculationData.source
            });

            if (result.status === 'success') {
                setCalculationResult((result as any).data);
            }
        } catch (error) {
            console.error('Error calculando percentil:', error);
        } finally {
            setLoading(false);
        }
    };

    // Obtener datos del paciente para el gráfico
    const getPatientChartData = () => {
        if (!selectedPatient) return [];
        
        const patient = patients.find(p => p.id === selectedPatient);
        if (!patient) return [];

        return patient.measurements
            .filter(m => {
                // Filtrar mediciones que no tienen los datos necesarios para la métrica seleccionada
                if (selectedMetric === 'weight_for_age' && !m.weight) return false;
                if (selectedMetric === 'height_for_age' && !m.height) return false;
                if (selectedMetric === 'bmi_for_age' && (!m.weight || !m.height)) return false;
                if (selectedMetric === 'weight_for_height' && (!m.weight || !m.height)) return false;
                return true;
            })
            .map(m => ({
                ageMonths: m.ageMonths,
                value: selectedMetric === 'weight_for_age' ? m.weight :
                       selectedMetric === 'height_for_age' ? m.height :
                       selectedMetric === 'bmi_for_age' ? (m.weight / Math.pow(m.height / 100, 2)) :
                       selectedMetric === 'weight_for_height' ? m.weight :
                       m.weight, // Valor por defecto
                date: m.date
            }))
            .filter(point => typeof point.value === 'number' && !isNaN(point.value));
    };

    // Formatear edad en años y meses
    const formatAge = (ageMonths: number) => {
        const years = Math.floor(ageMonths / 12);
        const months = ageMonths % 12;
        return years > 0 ? `${years}a ${months}m` : `${months}m`;
    };

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Baby size={32} className="text-primary me-3" />
                            <div>
                                <h2 className="mb-0">Curvas de Crecimiento Pediátrico</h2>
                                <p className="text-muted mb-0">
                                    {currentPatientInfo ? 
                                        `Paciente: ${currentPatientInfo.first_name} ${currentPatientInfo.last_name} - ${getAgeDescription(getPediatricInfo(currentPatientInfo.user?.birth_date || currentPatientInfo.birth_date).ageInMonths)}` :
                                        'Análisis basado en referencias OMS y CDC'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            {patientIdFromUrl && (
                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigate('/patients')}
                                >
                                    <ArrowLeft size={16} className="me-1" />
                                    Volver a Pacientes
                                </button>
                            )}
                            <button className="btn btn-outline-primary">
                                <Download size={16} className="me-1" />
                                Exportar
                            </button>
                            <button className="btn btn-outline-secondary">
                                <FileText size={16} className="me-1" />
                                Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegación por pestañas */}
            <div className="row mb-4">
                <div className="col-12">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'charts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('charts')}
                            >
                                <TrendingUp size={16} className="me-1" />
                                Curvas de Crecimiento
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
                                onClick={() => setActiveTab('calculator')}
                            >
                                <Calculator size={16} className="me-1" />
                                Calculadora de Percentiles
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
                                onClick={() => setActiveTab('patients')}
                            >
                                <Users size={16} className="me-1" />
                                Análisis de Pacientes
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Contenido de las pestañas */}
            {activeTab === 'charts' && (
                <div className="row">
                    {/* Panel de configuración */}
                    <div className="col-lg-3">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">
                                    <Settings size={16} className="me-1" />
                                    Configuración
                                </h6>
                            </div>
                            <div className="card-body">
                                {/* Tipo de métrica */}
                                <div className="mb-3">
                                    <label className="form-label">Métrica</label>
                                    <select
                                        className="form-select"
                                        value={selectedMetric}
                                        onChange={(e) => setSelectedMetric(e.target.value as any)}
                                    >
                                        <option value="weight_for_age">Peso para Edad</option>
                                        <option value="height_for_age">Talla para Edad</option>
                                        <option value="bmi_for_age">IMC para Edad</option>
                                        <option value="weight_for_height">Peso para Talla</option>
                                        <option value="head_circumference">Perímetro Cefálico</option>
                                    </select>
                                </div>

                                {/* Género */}
                                <div className="mb-3">
                                    <label className="form-label">Género</label>
                                    <div className="btn-group w-100" role="group">
                                        <button
                                            className={`btn ${selectedGender === 'male' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setSelectedGender('male')}
                                        >
                                            Niños
                                        </button>
                                        <button
                                            className={`btn ${selectedGender === 'female' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setSelectedGender('female')}
                                        >
                                            Niñas
                                        </button>
                                    </div>
                                </div>

                                {/* Fuente de referencia */}
                                <div className="mb-3">
                                    <label className="form-label">Referencia</label>
                                    <div className="btn-group w-100" role="group">
                                        <button
                                            className={`btn ${selectedSource === 'WHO' ? 'btn-success' : 'btn-outline-success'}`}
                                            onClick={() => setSelectedSource('WHO')}
                                        >
                                            OMS
                                        </button>
                                        <button
                                            className={`btn ${selectedSource === 'CDC' ? 'btn-success' : 'btn-outline-success'}`}
                                            onClick={() => setSelectedSource('CDC')}
                                        >
                                            CDC
                                        </button>
                                    </div>
                                </div>

                                {/* Rango de edad */}
                                <div className="mb-3">
                                    <label className="form-label">Rango de Edad (meses)</label>
                                    <div className="row">
                                        <div className="col-6">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Desde"
                                                value={ageRange[0]}
                                                onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Hasta"
                                                value={ageRange[1]}
                                                onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
                                            />
                                        </div>
                                    </div>
                                    <small className="text-muted">
                                        Actualmente: {formatAge(ageRange[0])} - {formatAge(ageRange[1])}
                                    </small>
                                </div>

                                {/* Paciente (opcional) */}
                                <div className="mb-3">
                                    <label className="form-label">Paciente (Opcional)</label>
                                    <select
                                        className="form-select"
                                        value={selectedPatient}
                                        onChange={(e) => setSelectedPatient(e.target.value)}
                                    >
                                        <option value="">Sin paciente</option>
                                        {patients.map(patient => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico principal */}
                    <div className="col-lg-9">
                        <GrowthChart
                            metricType={selectedMetric}
                            gender={selectedGender}
                            source={selectedSource}
                            ageRange={ageRange}
                            patientData={getPatientChartData()}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'calculator' && (
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <Calculator size={20} className="me-2" />
                                    Calculadora de Percentiles
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={(e) => { e.preventDefault(); calculatePercentile(); }}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Edad (meses)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={calculationData.ageMonths}
                                                onChange={(e) => setCalculationData({
                                                    ...calculationData,
                                                    ageMonths: e.target.value
                                                })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Valor</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="form-control"
                                                value={calculationData.value}
                                                onChange={(e) => setCalculationData({
                                                    ...calculationData,
                                                    value: e.target.value
                                                })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Género</label>
                                            <select
                                                className="form-select"
                                                value={calculationData.gender}
                                                onChange={(e) => setCalculationData({
                                                    ...calculationData,
                                                    gender: e.target.value as 'male' | 'female'
                                                })}
                                            >
                                                <option value="male">Masculino</option>
                                                <option value="female">Femenino</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Métrica</label>
                                            <select
                                                className="form-select"
                                                value={calculationData.metricType}
                                                onChange={(e) => setCalculationData({
                                                    ...calculationData,
                                                    metricType: e.target.value as any
                                                })}
                                            >
                                                <option value="weight_for_age">Peso para Edad</option>
                                                <option value="height_for_age">Talla para Edad</option>
                                                <option value="bmi_for_age">IMC para Edad</option>
                                                <option value="weight_for_height">Peso para Talla</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Referencia</label>
                                            <select
                                                className="form-select"
                                                value={calculationData.source}
                                                onChange={(e) => setCalculationData({
                                                    ...calculationData,
                                                    source: e.target.value as 'WHO' | 'CDC'
                                                })}
                                            >
                                                <option value="WHO">OMS</option>
                                                <option value="CDC">CDC</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Calculando...' : 'Calcular Percentil'}
                                    </button>
                                </form>

                                {calculationResult && (
                                    <div className="mt-4">
                                        <h6>Resultado:</h6>
                                        <div className="alert alert-info">
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <strong>Percentil:</strong> P{calculationResult.percentile.toFixed(1)}
                                                </div>
                                                <div className="col-md-4">
                                                    <strong>Z-Score:</strong> {calculationResult.zScore.toFixed(2)}
                                                </div>
                                                <div className="col-md-4">
                                                    <strong>Interpretación:</strong> {calculationResult.interpretation}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'patients' && (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <Users size={20} className="me-2" />
                                    Pacientes Pediátricos
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Paciente</th>
                                                <th>Género</th>
                                                <th>Edad Actual</th>
                                                <th>Última Medición</th>
                                                <th>Mediciones</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patients.map(patient => {
                                                const latestMeasurement = patient.measurements[patient.measurements.length - 1];
                                                const currentAge = Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                                                
                                                return (
                                                    <tr key={patient.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <Baby size={16} className="me-2 text-primary" />
                                                                {patient.name}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${patient.gender === 'male' ? 'bg-primary' : 'bg-pink'}`}>
                                                                {patient.gender === 'male' ? 'Masculino' : 'Femenino'}
                                                            </span>
                                                        </td>
                                                        <td>{formatAge(currentAge)}</td>
                                                        <td>
                                                            {latestMeasurement ? (
                                                                <small>
                                                                    {latestMeasurement.weight}kg, {latestMeasurement.height}cm
                                                                    <br />
                                                                    <span className="text-muted">{new Date(latestMeasurement.date).toLocaleDateString()}</span>
                                                                </small>
                                                            ) : 'Sin mediciones'}
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-secondary">
                                                                {patient.measurements.length} registros
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary me-1"
                                                                onClick={() => {
                                                                    setSelectedPatient(patient.id);
                                                                    setActiveTab('charts');
                                                                }}
                                                            >
                                                                Ver Curvas
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrowthChartsPage; 
import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { BarChart3, TrendingUp, Users, Calendar, FileText, Download, Eye, Target, DollarSign } from 'lucide-react';
=======
import { BarChart3, Calendar, Download, Target, DollarSign, Users, TrendingUp, Eye, FileText } from 'lucide-react';
>>>>>>> nutri/main

interface ReportData {
  month: string;
  newPatients: number;
  appointments: number;
  completedPlans: number;
  revenue: number;
}

interface PatientSummary {
  id: number;
  name: string;
  startDate: string;
  initialWeight: number;
  currentWeight: number;
  targetWeight: number;
  progress: number;
  status: 'on-track' | 'behind' | 'completed';
}

const ReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [patientSummaries, setPatientSummaries] = useState<PatientSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'financial'>('overview');

  useEffect(() => {
    // Datos de ejemplo para reportes
    const mockReportData: ReportData[] = [
      { month: 'Octubre', newPatients: 12, appointments: 145, completedPlans: 8, revenue: 24500 },
      { month: 'Noviembre', newPatients: 15, appointments: 168, completedPlans: 12, revenue: 28900 },
      { month: 'Diciembre', newPatients: 18, appointments: 189, completedPlans: 15, revenue: 32100 }
    ];

    const mockPatientSummaries: PatientSummary[] = [
      {
        id: 1,
        name: 'María González',
        startDate: '2024-09-01',
        initialWeight: 75,
        currentWeight: 68,
        targetWeight: 65,
        progress: 70,
        status: 'on-track'
      },
      {
        id: 2,
        name: 'Carlos Ruiz',
        startDate: '2024-10-15',
        initialWeight: 90,
        currentWeight: 85,
        targetWeight: 80,
        progress: 50,
        status: 'on-track'
      },
      {
        id: 3,
        name: 'Ana López',
        startDate: '2024-08-01',
        initialWeight: 58,
        currentWeight: 62,
        targetWeight: 62,
        progress: 100,
        status: 'completed'
      },
      {
        id: 4,
        name: 'José Martín',
        startDate: '2024-11-01',
        initialWeight: 95,
        currentWeight: 93,
        targetWeight: 85,
        progress: 20,
        status: 'behind'
      }
    ];

    setReportData(mockReportData);
    setPatientSummaries(mockPatientSummaries);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'on-track': { class: 'bg-success text-white', text: 'En progreso' },
      'behind': { class: 'bg-warning text-dark', text: 'Retrasado' },
      'completed': { class: 'bg-primary text-white', text: 'Completado' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['on-track'];
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const calculateTotalRevenue = () => reportData.reduce((total, data) => total + data.revenue, 0);
  const calculateTotalPatients = () => reportData.reduce((total, data) => total + data.newPatients, 0);
  const calculateTotalAppointments = () => reportData.reduce((total, data) => total + data.appointments, 0);
  const calculateCompletionRate = () => {
    const completed = patientSummaries.filter(p => p.status === 'completed').length;
    return ((completed / patientSummaries.length) * 100).toFixed(1);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 mb-1">Reportes y Analíticas</h1>
          <p className="text-muted">Analiza el rendimiento de tu práctica y el progreso de tus pacientes</p>
        </div>
        <div className="col-md-4 text-end">
          <div className="btn-group me-2">
            <button 
              className={`btn btn-outline-primary ${selectedPeriod === 'month' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              Mensual
            </button>
            <button 
              className={`btn btn-outline-primary ${selectedPeriod === 'quarter' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('quarter')}
            >
              Trimestral
            </button>
            <button 
              className={`btn btn-outline-primary ${selectedPeriod === 'year' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('year')}
            >
              Anual
            </button>
          </div>
          <button className="btn btn-success">
            <Download size={18} className="me-2" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{calculateTotalPatients()}</h5>
                  <small className="text-muted">Nuevos pacientes</small>
                  <div className="text-success small">
                    <TrendingUp size={12} className="me-1" />
                    +15% vs mes anterior
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-3 p-3 me-3">
                  <Calendar className="text-success" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{calculateTotalAppointments()}</h5>
                  <small className="text-muted">Citas realizadas</small>
                  <div className="text-success small">
                    <TrendingUp size={12} className="me-1" />
                    +8% vs mes anterior
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 rounded-3 p-3 me-3">
                  <Target className="text-info" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">{calculateCompletionRate()}%</h5>
                  <small className="text-muted">Tasa de éxito</small>
                  <div className="text-success small">
                    <TrendingUp size={12} className="me-1" />
                    +5% vs mes anterior
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-3 p-3 me-3">
                  <DollarSign className="text-warning" size={24} />
                </div>
                <div>
                  <h5 className="mb-0">${calculateTotalRevenue().toLocaleString()}</h5>
                  <small className="text-muted">Ingresos totales</small>
                  <div className="text-success small">
                    <TrendingUp size={12} className="me-1" />
                    +12% vs mes anterior
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} className="me-2" />
            Resumen General
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <Users size={18} className="me-2" />
            Progreso de Pacientes
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            <DollarSign size={18} className="me-2" />
            Análisis Financiero
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Tendencias Mensuales</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Nuevos Pacientes</th>
                        <th>Citas</th>
                        <th>Planes Completados</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((data, index) => (
                        <tr key={index}>
                          <td className="fw-medium">{data.month}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{data.newPatients}</span>
                              <div className="progress flex-grow-1" style={{ height: '4px' }}>
                                <div 
                                  className="progress-bar bg-primary" 
                                  style={{ width: `${(data.newPatients / 20) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{data.appointments}</span>
                              <div className="progress flex-grow-1" style={{ height: '4px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ width: `${(data.appointments / 200) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info">{data.completedPlans}</span>
                          </td>
                          <td className="text-success fw-medium">
                            ${data.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h6 className="card-title mb-0">Distribución de Citas</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Consultas Iniciales</span>
                    <strong>35%</strong>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-primary" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Seguimientos</span>
                    <strong>45%</strong>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-success" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Control de Peso</span>
                    <strong>20%</strong>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-warning" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h6 className="card-title mb-0">Horarios Más Solicitados</h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>9:00 - 11:00 AM</span>
                  <span className="badge bg-success">Alto</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>2:00 - 4:00 PM</span>
                  <span className="badge bg-success">Alto</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>4:00 - 6:00 PM</span>
                  <span className="badge bg-warning">Medio</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>6:00 - 8:00 PM</span>
                  <span className="badge bg-secondary">Bajo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Progreso de Pacientes</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Paciente</th>
                    <th>Fecha de Inicio</th>
                    <th>Peso Inicial</th>
                    <th>Peso Actual</th>
                    <th>Peso Meta</th>
                    <th>Progreso</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {patientSummaries.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                            <Users size={16} className="text-primary" />
                          </div>
                          <span className="fw-medium">{patient.name}</span>
                        </div>
                      </td>
                      <td>{new Date(patient.startDate).toLocaleDateString('es-ES')}</td>
                      <td className="fw-medium">{patient.initialWeight} kg</td>
                      <td className="fw-medium">{patient.currentWeight} kg</td>
                      <td className="fw-medium">{patient.targetWeight} kg</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '100px', height: '8px' }}>
                            <div 
                              className={`progress-bar ${patient.status === 'completed' ? 'bg-success' : patient.status === 'on-track' ? 'bg-primary' : 'bg-warning'}`}
                              style={{ width: `${patient.progress}%` }}
                            ></div>
                          </div>
                          <span className="small">{patient.progress}%</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(patient.status)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-info">
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-outline-primary">
                            <FileText size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="row">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Ingresos por Tipo de Servicio</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Consultas Individuales</span>
                    <strong>$18,500</strong>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-primary" style={{ width: '60%' }}></div>
                  </div>
                  <small className="text-muted">60% del total</small>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Planes Nutricionales</span>
                    <strong>$9,200</strong>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-success" style={{ width: '30%' }}></div>
                  </div>
                  <small className="text-muted">30% del total</small>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Seguimientos</span>
                    <strong>$3,100</strong>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-info" style={{ width: '10%' }}></div>
                  </div>
                  <small className="text-muted">10% del total</small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Proyección de Ingresos</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h3 className="text-success">$38,500</h3>
                  <small className="text-muted">Proyección para el próximo mes</small>
                </div>
                <div className="mb-3">
                  <span className="badge bg-success me-2">↗ +20%</span>
                  <span>Tendencia positiva basada en nuevos pacientes</span>
                </div>
                <div className="mb-3">
                  <span className="badge bg-info me-2">📊</span>
                  <span>Promedio de ingresos mensuales: $28,900</span>
                </div>
                <div className="mb-3">
                  <span className="badge bg-warning me-2">⚡</span>
                  <span>Oportunidad de crecimiento en seguimientos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage; 
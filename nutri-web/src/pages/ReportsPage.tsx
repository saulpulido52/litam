import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, Target, DollarSign, Users } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import type { FinancialStats, PatientProgress } from '../services/reportsService';
import { toast } from 'react-toastify';

const ReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [reportData, setReportData] = useState<FinancialStats[]>([]);
  const [patientSummaries, setPatientSummaries] = useState<PatientProgress[]>([]);
  const [serviceStats, setServiceStats] = useState<any>(null); // Simplified for now
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'financial'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [financial, progress, services] = await Promise.all([
          reportsService.getFinancialStats(),
          reportsService.getPatientProgress(),
          reportsService.getServiceStats()
        ]);
        setReportData(financial);
        setPatientSummaries(progress);
        setServiceStats(services);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod]); // TODO: Pass period to service

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
    if (patientSummaries.length === 0) return 0;
    const completed = patientSummaries.filter(p => p.status === 'completed').length;
    return ((completed / patientSummaries.length) * 100).toFixed(1);
  };

  if (loading) {
    return <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }

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
            >
              Trimestral
            </button>
            <button
              className={`btn btn-outline-primary ${selectedPeriod === 'year' ? 'active' : ''}`}
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
                  <small className="text-muted">Nuevos pacientes (año)</small>
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
                  <small className="text-muted">Citas (año)</small>
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
                  <small className="text-muted">Ingresos est. (año)</small>
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
                        <th>Ingresos Est.</th>
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
                                  style={{ width: `${Math.min(100, (data.newPatients / 5) * 100)}%` }}
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
                                  style={{ width: `${Math.min(100, (data.appointments / 20) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
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
            {/* Service Stats Summary */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h6 className="card-title mb-0">Distribución de Servicios</h6>
              </div>
              <div className="card-body">
                {serviceStats && (
                  <>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Citas</span>
                        <strong>{serviceStats.appointments?.count || 0}</strong>
                      </div>
                      <div className="progress mt-1">
                        <div className="progress-bar bg-primary" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Planes</span>
                        <strong>{serviceStats.dietPlans?.count || 0}</strong>
                      </div>
                      <div className="progress mt-1">
                        <div className="progress-bar bg-success" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </>
                )}
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
                    <th>Peso Meta (Est)</th>
                    <th>Progreso</th>
                    <th>Estado</th>
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
                    </tr>
                  ))}
                  {patientSummaries.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-4">No hay datos de progreso de pacientes aún.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && serviceStats && (
        <div className="row">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Ingresos por Tipo de Servicio</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Consultas</span>
                    <strong>${serviceStats.appointments.revenue.toLocaleString()}</strong>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-primary" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Planes Nutricionales</span>
                    <strong>${serviceStats.dietPlans.revenue.toLocaleString()}</strong>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-success" style={{ width: '30%' }}></div>
                  </div>
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
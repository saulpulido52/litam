import React, { useState } from 'react';
import { Toast } from 'react-bootstrap';

import api from '../../services/api';

interface GrowthChartsPDFExportProps {
  patientId: string;
  patientName: string;
  nutritionistId?: string;
}

interface ExportOptions {
  includeGrowthCharts: boolean;
  includeAlerts: boolean;
  includeProgressHistory: boolean;
  includeClinicalData: boolean;
  includeRecommendations: boolean;
  chartSource: 'WHO' | 'CDC';
  metricTypes: string[];
  ageRangeMonths?: [number, number];
}

const GrowthChartsPDFExport: React.FC<GrowthChartsPDFExportProps> = ({
  patientId,
  patientName,
  nutritionistId
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeGrowthCharts: true,
    includeAlerts: true,
    includeProgressHistory: true,
    includeClinicalData: true,
    includeRecommendations: true,
    chartSource: 'WHO',
    metricTypes: ['weight_for_age', 'height_for_age', 'bmi_for_age'],
    ageRangeMonths: undefined
  });

  const metricTypeOptions = [
    { value: 'weight_for_age', label: 'Peso para Edad' },
    { value: 'height_for_age', label: 'Talla para Edad' },
    { value: 'bmi_for_age', label: 'IMC para Edad' },
    { value: 'head_circumference', label: 'Perímetro Cefálico' },
    { value: 'weight_for_height', label: 'Peso para Talla' }
  ];

  const handleOptionChange = (option: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleMetricTypeChange = (metricType: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      metricTypes: checked
        ? [...prev.metricTypes, metricType]
        : prev.metricTypes.filter(type => type !== metricType)
    }));
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const generatePediatricReport = async () => {
    setIsExporting(true);
    try {
      const result = await api.post('/growth-charts/export/pediatric-report', {
        patientId,
        nutritionistId,
        ...exportOptions
      });

      if (result.status !== 'success') {
        throw new Error(result.message || 'Error al generar reporte pediátrico');
      }

      const data = result as any;

      // Descargar el archivo
      if (data.data.downloadUrl) {
        window.open(data.data.downloadUrl, '_blank');
        showNotification('Reporte pediátrico generado exitosamente', 'success');
      }

    } catch (error: any) {
      console.error('Error generando reporte pediátrico:', error);
      showNotification(error.message || 'Error al generar reporte pediátrico', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const generateGrowthChartsReport = async () => {
    setIsExporting(true);
    try {
      const result = await api.post('/growth-charts/export/growth-charts', {
        patientId,
        metricTypes: exportOptions.metricTypes,
        source: exportOptions.chartSource,
        ageRangeMonths: exportOptions.ageRangeMonths
      });

      if (result.status !== 'success') {
        throw new Error(result.message || 'Error al generar reporte de curvas');
      }

      const data = result as any;

      // Descargar el archivo
      if (data.data.downloadUrl) {
        window.open(data.data.downloadUrl, '_blank');
        showNotification('Reporte de curvas generado exitosamente', 'success');
      }

    } catch (error: any) {
      console.error('Error generando reporte de curvas:', error);
      showNotification(error.message || 'Error al generar reporte de curvas', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Dashboard de Resumen - Métricas Actuales */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-info">
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Análisis de Crecimiento Pediátrico</strong>
            </div>
            <p className="mb-0 small">
              Esta sección permite generar reportes de crecimiento basados en las mediciones
              antropométricas del paciente <strong>{patientName}</strong>.
              Configura las opciones y genera reportes en PDF con curvas WHO o CDC.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">
            <i className="fas fa-file-pdf me-2"></i>
            Exportar Gráficos de Crecimiento - {patientName}
          </h5>
        </div>
        <div className="card-body">
          {/* Opciones de Exportación */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h6 className="mb-3">
                <i className="fas fa-cog me-2"></i>
                Opciones del Reporte
              </h6>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="includeGrowthCharts"
                  checked={exportOptions.includeGrowthCharts}
                  onChange={(e) => handleOptionChange('includeGrowthCharts', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeGrowthCharts">
                  Incluir Gráficos de Crecimiento
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="includeAlerts"
                  checked={exportOptions.includeAlerts}
                  onChange={(e) => handleOptionChange('includeAlerts', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeAlerts">
                  Incluir Alertas Activas
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="includeProgressHistory"
                  checked={exportOptions.includeProgressHistory}
                  onChange={(e) => handleOptionChange('includeProgressHistory', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeProgressHistory">
                  Incluir Historial de Progreso
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="includeClinicalData"
                  checked={exportOptions.includeClinicalData}
                  onChange={(e) => handleOptionChange('includeClinicalData', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeClinicalData">
                  Incluir Datos Clínicos Pediátricos
                </label>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="includeRecommendations"
                  checked={exportOptions.includeRecommendations}
                  onChange={(e) => handleOptionChange('includeRecommendations', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeRecommendations">
                  Incluir Recomendaciones
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <h6 className="mb-3">
                <i className="fas fa-chart-line me-2"></i>
                Configuración de Curvas
              </h6>

              {/* Fuente de datos */}
              <div className="mb-3">
                <label className="form-label">Fuente de Referencia:</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="chartSource"
                    id="sourceWHO"
                    value="WHO"
                    checked={exportOptions.chartSource === 'WHO'}
                    onChange={(e) => handleOptionChange('chartSource', e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="sourceWHO">
                    OMS (Organización Mundial de la Salud)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="chartSource"
                    id="sourceCDC"
                    value="CDC"
                    checked={exportOptions.chartSource === 'CDC'}
                    onChange={(e) => handleOptionChange('chartSource', e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="sourceCDC">
                    CDC (Centers for Disease Control)
                  </label>
                </div>
              </div>

              {/* Tipos de métricas */}
              <div className="mb-3">
                <label className="form-label">Métricas a Incluir:</label>
                {metricTypeOptions.map(option => (
                  <div key={option.value} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`metric-${option.value}`}
                      checked={exportOptions.metricTypes.includes(option.value)}
                      onChange={(e) => handleMetricTypeChange(option.value, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`metric-${option.value}`}>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de Exportación */}
          <div className="row">
            <div className="col-12">
              <h6 className="mb-3 text-center">
                <i className="fas fa-download me-2"></i>
                Generar Reportes
              </h6>
            </div>
          </div>

          <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={generatePediatricReport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Generando...
                </>
              ) : (
                <>
                  <i className="fas fa-file-medical-alt me-2"></i>
                  Reporte Pediátrico Completo
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-primary btn-lg"
              onClick={generateGrowthChartsReport}
              disabled={isExporting || exportOptions.metricTypes.length === 0}
            >
              {isExporting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Generando...
                </>
              ) : (
                <>
                  <i className="fas fa-chart-line me-2"></i>
                  Solo Curvas de Crecimiento
                </>
              )}
            </button>
          </div>

          {exportOptions.metricTypes.length === 0 && (
            <div className="alert alert-warning mt-3" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Selecciona al menos una métrica para generar el reporte de curvas.
            </div>
          )}
        </div>
      </div>

      {/* Toast de notificaciones */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 11 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          bg={toastType === 'success' ? 'success' : 'danger'}
        >
          <Toast.Body className="text-white">
            <i className={`fas ${toastType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default GrowthChartsPDFExport;
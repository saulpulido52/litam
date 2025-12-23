import api from './api';

interface CalculatePercentileParams {
  ageMonths: number;
  value: number;
  gender: 'male' | 'female';
  metricType: string;
  source?: 'WHO' | 'CDC';
}

interface ChartDataParams {
  [key: string]: string;
}

export const growthChartsService = {
  // Obtener datos de las curvas de crecimiento
  async getChartData(params: ChartDataParams) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/growth-charts/chart-data?${queryString}`);
  },

  // Calcular percentil y z-score
  async calculatePercentile(data: CalculatePercentileParams) {
    return api.post('/growth-charts/calculate-percentile', data);
  },

  // Generar reporte pediátrico PDF
  async generatePediatricReport(data: any) {
    return api.post('/growth-charts/pdf/generate', data);
  },

  // Generar reporte de curvas PDF
  async generateGrowthChartsReport(data: any) {
    return api.post('/growth-charts/pdf/generate-charts', data);
  },

  // Descargar PDF
  async downloadPDF(filename: string) {
    const response = await api.get(`/growth-charts/pdf/download/${filename}`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default growthChartsService; 
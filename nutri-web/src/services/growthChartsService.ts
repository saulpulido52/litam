import apiService from './api';

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
    return apiService.get(`/growth-charts/chart-data?${queryString}`);
  },

  // Calcular percentil y z-score
  async calculatePercentile(data: CalculatePercentileParams) {
    return apiService.post('/growth-charts/calculate-percentile', data);
  },

  // Generar reporte pediátrico PDF
  async generatePediatricReport(data: any): Promise<Blob> {
    const response: any = await apiService.post(
      '/growth-charts/export/pediatric-report',
      data,
      { responseType: 'blob' }
    );

    // Handle blob response similar to laboratory documents
    let blob: Blob;
    if (response.data && response.data instanceof Blob) {
      blob = response.data;
    } else if (response instanceof Blob) {
      blob = response;
    } else if (response.data) {
      blob = new Blob([response.data], { type: 'application/pdf' });
    } else {
      blob = new Blob([response], { type: 'application/pdf' });
    }

    return blob;
  },

  // Generar reporte de curvas PDF
  async generateGrowthChartsReport(data: any): Promise<Blob> {
    const response: any = await apiService.post(
      '/growth-charts/export/growth-charts',
      data,
      { responseType: 'blob' }
    );

    // Handle blob response similar to laboratory documents
    let blob: Blob;
    if (response.data && response.data instanceof Blob) {
      blob = response.data;
    } else if (response instanceof Blob) {
      blob = response;
    } else if (response.data) {
      blob = new Blob([response.data], { type: 'application/pdf' });
    } else {
      blob = new Blob([response], { type: 'application/pdf' });
    }

    return blob;
  },

  // Descargar PDF
  downloadPDF(blob: Blob, filename: string) {
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
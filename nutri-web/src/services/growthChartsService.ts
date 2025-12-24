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
    try {
      // Use axios directly for blob response
      const response = await apiService['api'].post(
        '/growth-charts/export/pediatric-report',
        data,
        { responseType: 'blob' }
      );

      // Handle blob response - response.data should be the blob
      if (response.data instanceof Blob) {
        return response.data;
      }

      // Fallback: create blob from response data
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error generating pediatric report:', error);
      throw error;
    }
  },

  // Generar reporte de curvas PDF
  async generateGrowthChartsReport(data: any): Promise<Blob> {
    try {
      // Use axios directly for blob response
      const response = await apiService['api'].post(
        '/growth-charts/export/growth-charts',
        data,
        { responseType: 'blob' }
      );

      // Handle blob response - response.data should be the blob
      if (response.data instanceof Blob) {
        return response.data;
      }

      // Fallback: create blob from response data
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error generating growth charts report:', error);
      throw error;
    }
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
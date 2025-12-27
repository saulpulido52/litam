import { apiService } from './api';

export interface FinancialStats {
    month: string;
    appointments: number;
    revenue: number;
    newPatients: number;
}

export interface PatientProgress {
    id: string;
    name: string;
    startDate: string;
    initialWeight: number;
    currentWeight: number;
    targetWeight: number;
    progress: number;
    status: 'on-track' | 'behind' | 'completed';
}

export interface ServiceStats {
    appointments: { count: number; revenue: number };
    dietPlans: { count: number; revenue: number };
    followUps: { count: number; revenue: number };
}

export const reportsService = {
    async getFinancialStats(): Promise<FinancialStats[]> {
        const response = await apiService.get<{ data: FinancialStats[] }>('/reports/financial');
        return response.data;
    },

    async getPatientProgress(): Promise<PatientProgress[]> {
        const response = await apiService.get<{ data: PatientProgress[] }>('/reports/patient-progress');
        return response.data;
    },

    async getServiceStats(): Promise<ServiceStats> {
        const response = await apiService.get<{ data: ServiceStats }>('/reports/services');
        return response.data;
    }
};

import axios from 'axios';

const API_URL = '/api/monetization';

export const getNutritionistTiers = async () => {
  const res = await axios.get(`${API_URL}/nutritionist-tiers`);
  return res.data.data.tiers;
};

export const getPatientTiers = async () => {
  const res = await axios.get(`${API_URL}/patient-tiers`);
  return res.data.data.tiers;
};

export const getNutritionistTierStats = async () => {
  const res = await axios.get(`${API_URL}/stats/nutritionist-tiers`);
  return res.data.data.stats;
};

export const getPatientTierStats = async () => {
  const res = await axios.get(`${API_URL}/stats/patient-tiers`);
  return res.data.data.stats;
};

export const assignNutritionistTier = async (userId: string, tierId: string) => {
  const res = await axios.post(`${API_URL}/assign/nutritionist-tier`, { userId, tierId });
  return res.data.data.user;
};

export const assignPatientTier = async (userId: string, tierId: string) => {
  const res = await axios.post(`${API_URL}/assign/patient-tier`, { userId, tierId });
  return res.data.data.user;
};

// ==================== REPORTES ====================

export const getRevenueReport = async (startDate?: string, endDate?: string) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(`${API_URL}/reports/revenue?${params}`);
    return response.data.data.report;
  } catch (error) {
    console.error('Error getting revenue report:', error);
    throw error;
  }
};

export const getUsageReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports/usage`);
    return response.data.data.report;
  } catch (error) {
    console.error('Error getting usage report:', error);
    throw error;
  }
};

export const getConversionReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports/conversion`);
    return response.data.data.report;
  } catch (error) {
    console.error('Error getting conversion report:', error);
    throw error;
  }
}; 
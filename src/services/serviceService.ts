import api from '../config/api';
import type { Service, ServiceResponse } from '../types/service';

export const getServices = async (): Promise<Service[]> => {
  const response = await api.get<ServiceResponse>('/services');
  return Array.isArray(response.data.data) ? response.data.data : [];
};

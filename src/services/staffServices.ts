import api from '../config/api';
import type { Staff, StaffResponse } from '../types/staff';

export const getStaffs = async (): Promise<Staff[]> => {
  const response = await api.get<StaffResponse>('/staff');
  return Array.isArray(response.data.data) ? response.data.data : [];
};

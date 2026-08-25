export interface Staff {
  id: number | string;
  name: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffResponse {
  success: boolean;
  message: string;
  data: Staff[];
}

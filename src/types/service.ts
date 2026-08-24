export interface Service {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data: Service[];
}

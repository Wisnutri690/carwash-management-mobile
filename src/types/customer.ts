import type { Vehicle } from "./vehicle";

export interface Customer {
    id: string | number;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    vehicles?: Vehicle[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCustomerPayload {
    name: string;
    phone: string;
    email?: string;
    address?: string;
}

export interface UpdateCustomerPayload {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface CustomerResponse {
    success: boolean;
    message: string;
    data: Customer[];
}

export interface SingleCustomerResponse {
    success: boolean;
    message: string;
    data: Customer;
}

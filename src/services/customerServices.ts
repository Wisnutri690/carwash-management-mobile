import api from '../config/api';
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload, CustomerResponse, SingleCustomerResponse } from '../types/customer'

export const getCustomer = async (): Promise<Customer[]> => {
    const respone = await api.get<CustomerResponse>('/customers');

    return Array.isArray(respone.data.data) ? respone.data.data : [];
};

export const getCustomerById = async (id: string | number): Promise<Customer> => {
    const respone = await api.get<SingleCustomerResponse>(`/customers/${id}`);

    return respone.data.data as Customer;
};

export const createCustomer = async (payLoad: CreateCustomerPayload): Promise<Customer> => {
    const response = await api.post<SingleCustomerResponse>('/customers', payLoad);

    return response.data.data as Customer
};

export const updateCustomer = async (id: string, payLoad: UpdateCustomerPayload): Promise<Customer> => {
    const response = await api.put<SingleCustomerResponse>(`/customers/${id}`, payLoad);

    return response.data.data as Customer
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await api.delete<SingleCustomerResponse>(`/customers/${id}`);
};

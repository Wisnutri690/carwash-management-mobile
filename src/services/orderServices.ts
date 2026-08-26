import api from '../config/api';
import type { Order, OrderResponse, OrderStatus, PaymentMethod, PaymentStatus } from '../types/order';
import type { Invoice, InvoiceResponse } from '../types/invoice';


export interface CreateOrderInput {
    serviceId: string | number;
    quantity: number;
}

export interface CreateOrderPayload {
    customerId: string | number;
    vehicleId: string | number;
    staffId?: string | number;
    items?: CreateOrderInput[];
    services?: number[] | CreateOrderInput[];
}

export interface UpdatePaymentPayload {
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
}

export const getOrders = async (): Promise<Order[]> => {
    
    const response = await api.get<OrderResponse>('/orders');

    return Array.isArray(response.data.data) ? response.data.data : [];
};

export const createOrder = async (payLoad: CreateOrderPayload): Promise<Order> => {
    
    const response = await api.post<{ success: boolean; message: string; data: Order }>('/orders', payLoad);

    return response.data.data;
};

export const updateOrderStatus = async (id: string | number, status: OrderStatus): Promise<Order> => {
    const response = await api.put<{ success: boolean; message: string; data: Order }>(`/orders/${id}`, { status });
    return response.data.data;
};

export const updatePaymentStatus = async ( id: string | number, payload: UpdatePaymentPayload ): Promise<Order> => {
    const response = await api.post<{ success: boolean; message: string; data: Order }>(`/orders/${id}/payment`, payload);
    return response.data.data;
};

export const deleteOrder = async (id: string | number): Promise<void> => {
    await api.delete(`/orders/${id}`);
};

export const getOrderInvoice = async (orderId: string | number): Promise<Invoice> => {
    const response = await api.get<InvoiceResponse>(`/orders/${orderId}/invoice`);
    return response.data.data;
};



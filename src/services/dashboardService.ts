import api from "../config/api";
import type { CustomerResponse, Customer } from "../types/customer";
import type { VehicleResponse, Vehicle } from "../types/vehicle";
import type { OrderResponse, Order } from "../types/order";

export const getDashboardOrders = async (): Promise<Order[]> => {
    const res = await api.get<OrderResponse>("/orders");
    return Array.isArray(res.data.data) ? res.data.data : [];
};

export const getDashboardCustomers = async (): Promise<Customer[]> => {
    const res = await api.get<CustomerResponse>("/customers");
    return Array.isArray(res.data.data) ? res.data.data : [];
};

export const getDashboardVehicles = async (): Promise<Vehicle[]> => {
    const res = await api.get<VehicleResponse>("/vehicles");
    return Array.isArray(res.data.data) ? res.data.data : [];
};

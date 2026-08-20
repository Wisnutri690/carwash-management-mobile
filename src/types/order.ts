import type { Customer } from "./customer";
import type { Vehicle } from "./vehicle";

export type OrderStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID";
export type PaymentMethod = "CASH" | "QRIS" | "TRANSFER";

export interface OrderItem {
    id: string | number;
    serviceId: string | number;
    quantity: number;
    price: number;
    subtotal: number;
    service?: {
        name: string;
        price: number;
    };
}

export interface Order {
    id: string | number;
    customerId: string | number;
    customer?: Customer;
    vehicleId: string | number;
    vehicle?: Vehicle;
    staffId?: string | number;
    staff?: {
        name: string;
    };
    orderItems?: OrderItem[];
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    totalPrice: number;
    createdAt?: string;
}

export interface OrderResponse {
    success: boolean;
    message: string;
    data: Order[];
}

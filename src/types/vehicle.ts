import type { Customer } from "./customer";

export interface Vehicle {
    id: string | number;
    plateNumber: string;
    brand: string;
    model: string;
    color?: string;
    year?: number;
    customerId: string | number;
    customer?: Customer;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateVehiclePayload {
    plateNumber: string;
    brand: string;
    model: string;
    color?: string;
    year?: number;
    customerId: string | number;
}

export interface UpdateVehiclePayload {
    plateNumber?: string;
    brand?: string;
    model?: string;
    color?: string;
    year?: number;
    customerId?: string | number;
}

export interface VehicleResponse {
    success: boolean;
    message: string;
    data: Vehicle[];
}

export interface SingleVehicleResponse {
    success: boolean;
    message: string;
    data: Vehicle;
}

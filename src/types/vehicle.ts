export interface Vehicle {
    id: string | number;
    plateNumber: string;
    brand: string;
    model: string;
    color?: string;
    customerId: string | number;
}

export interface VehicleResponse {
    success: boolean;
    message: string;
    data: Vehicle[];
}

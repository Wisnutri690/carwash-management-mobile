import type { Vehicle } from "./vehicle";

export interface Customer {
    id: string | number;
    name: string;
    phone: string;
    vehicles?: Vehicle[];
}

export interface CustomerResponse {
    success: boolean;
    message: string;
    data: Customer[];
}

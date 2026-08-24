import api from '../config/api';
import type { Vehicle, CreateVehiclePayload, UpdateVehiclePayload, VehicleResponse, SingleVehicleResponse } from '../types/vehicle';

export const getVehicle = async (): Promise<Vehicle[]> => {

    const respone = await api.get<VehicleResponse>('/vehicles');

    return Array.isArray(respone.data.data) ? respone.data.data : [];
};

export const getVehicleById = async (id: string | number): Promise<Vehicle> => {

    const response = await api.get<SingleVehicleResponse>(`/vehicles/${id}`);

    return response.data.data as Vehicle
};

export const createVehicle = async (payload: CreateVehiclePayload): Promise<Vehicle> => {

    const response = await api.post<SingleVehicleResponse>(`/vehicles`, payload);

    return response.data.data as Vehicle
};

export const updateVehicle = async (id: string, payLoad: UpdateVehiclePayload): Promise<Vehicle> => {

    const response = await api.put<SingleVehicleResponse>(`/vehicles/${id}`, payLoad);

    return response.data.data as Vehicle
};

export const deleteVehicle = async (id: string): Promise<void> => {

    await api.delete<SingleVehicleResponse>(`/vehicles/${id}`);
};

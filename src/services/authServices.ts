import api from '../config/api';
import type { ApiResponse } from '../types/api';
import type { LoginRequest, AuthData } from '../types/auth';

export const login = async (payload: LoginRequest): Promise<ApiResponse<AuthData>> => {

    const response = await api.post<ApiResponse<AuthData>>('/auth/login', payload);

    return response.data;
};
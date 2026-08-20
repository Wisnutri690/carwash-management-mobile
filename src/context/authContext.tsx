import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Admin, LoginRequest } from "../types/auth";
import * as authService from '../services/authServices';

interface AuthContextType {
    admin: Admin | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (payload: LoginRequest) => Promise<void>;
    logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const savedToken = await AsyncStorage.getItem('token');
                const savedAdmin = await AsyncStorage.getItem('admin');

                if (savedToken && savedAdmin) {
                    setToken(savedToken);
                    setAdmin(JSON.parse(savedAdmin));
                }

            } catch (error) {
                console.error('Gagal membaca data auth dari AsyncStorage:', error);
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('admin');
            } finally {
                setIsLoading(false);
            }
        };

        loadStorageData();
    }, []);

    const login = async (payload: LoginRequest): Promise<void> => {
        const response = await authService.login(payload);

        if (response.success && response.data) {
            const { admin: loggedInAdmin, token: receivedToken } = response.data;

            setAdmin(loggedInAdmin);
            setToken(receivedToken);

            await AsyncStorage.setItem('token', receivedToken);
            await AsyncStorage.setItem('admin', JSON.stringify(loggedInAdmin));
        } else {
            throw new Error(response.message || 'Login gagal');
        }
    };

    const logOut = async () => {
        setAdmin(null);
        setToken(null);

        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('admin');
    };

    return (
        <AuthContext.Provider
            value={{ admin, token, isAuthenticated: !!token, isLoading, login, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider');
    }

    return context;
};

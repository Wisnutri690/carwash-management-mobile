import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { deleteCustomer } from "../../services/customerServices";
import { deleteVehicle } from "../../services/vehicleServices";
import type { Customer } from "../../types/customer";
import type { Vehicle } from "../../types/vehicle";

interface DeleteCustomerVehicleProps {
    visible: boolean;
    mode: 'CUSTOMER' | 'VEHICLE';
    customerData?: Customer | null;
    vehicleData?: Vehicle | null;
    onClose: () => void;
    onSuccess: () => void;
}


export const DeleteCustomerVehicle = ({ visible, mode, customerData, vehicleData, onClose, onSuccess }: DeleteCustomerVehicleProps) => {

    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleDelete = async () => {
        if (mode === 'CUSTOMER') {
            if (!customerData)
                return;

            try {
                setIsDeleting(true);
                await deleteCustomer(String(customerData.id));
                Alert.alert('Berhasil', `Data pelanggan "${customerData.name}" berhasil dihapus!`);
                onSuccess();
                onClose()
            } catch (error: any) {
                console.log('Delete Customer Error', error);
                const errMsg = error?.response?.data?.message || error.message || 'Gagal menghapus data Customer.';
                Alert.alert('Gagal', errMsg);
            } finally {
                setIsDeleting(false);
            }
        } else {
            if (!vehicleData)
                return;

            try {
                setIsDeleting(true);
                await deleteVehicle(String(vehicleData.id));
                Alert.alert('Berhasil', `Vehicle"${vehicleData.plateNumber}" berhasil dihapus`);
                onSuccess();
                onClose();
            } catch (error: any) {
                console.log('Delete Vehicle Error', error);
                const errMSg = error?.response?.data?.message || error.message || 'Gagal menghapus data Vehicle';
                Alert.alert('Gagal', errMSg);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const targetName = mode === 'CUSTOMER' ? customerData?.name || 'Customer ini' : vehicleData?.plateNumber || 'Vehicle ini';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose} >
            <View className="flex-1 justify-center items-center bg-black/80 px-5">
                <View className="w-full bg-darkSurface rounded-3xl p-6 border border-darkBorder">
                    <View className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 items-center justify-center mb-4">
                        <Text className="text-red-500 text-xl font-bold">🗑️</Text>
                    </View>
                    <Text className="text-lg font-bold text-white mb-2">
                        {mode === 'CUSTOMER' ? 'Hapus Data Pelanggan?' : 'Hapus Unit Kendaraan?'}
                    </Text>
                    <Text className="text-xs text-neutral-400 leading-5 mb-6">
                        Apakah Anda yakin ingin menghapus{' '}
                        <Text className="text-white font-bold">{targetName}</Text>? Data yang
                        dihapus tidak dapat dikembalikan lagi.
                    </Text>
                    <View className="flex-row justify-end space-x-3">
                        <TouchableOpacity
                            className="px-5 py-3 rounded-xl bg-darkBg border border-darkBorder mr-2"
                            onPress={onClose}
                            disabled={isDeleting}
                            activeOpacity={0.7} >
                            <Text className="text-neutral-400 font-bold text-xs">Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`px-5 py-3 rounded-xl ${isDeleting ? 'bg-red-800' : 'bg-red-600'}`}
                            onPress={handleDelete}
                            disabled={isDeleting}
                            activeOpacity={0.8} >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white font-bold text-xs tracking-wide">
                                    Ya, Hapus
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}
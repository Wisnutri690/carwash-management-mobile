import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { updateCustomer } from '../../services/customerServices';
import { updateVehicle } from '../../services/vehicleServices';
import type { Customer } from '../../types/customer';
import type { Vehicle } from '../../types/vehicle';

interface UpdateCustomerVehicleProps {
    visible: boolean;
    mode: 'CUSTOMER' | 'VEHICLE';
    customerData?: Customer | null;
    vehicleData?: Vehicle | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const UpdateCustomerVehicle = ({ visible, mode, customerData, vehicleData, onClose, onSuccess }: UpdateCustomerVehicleProps) => {
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [address, setAddress] = useState<string>('');

    const [plateNumber, setPlateNumber] = useState<string>('');
    const [brand, setBrand] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [color, setColor] = useState<string>('');

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (mode === 'CUSTOMER' && customerData) {
            setName(customerData.name || '');
            setPhone(customerData.phone || '');
            setAddress(customerData.address || '');
        } else if (mode === 'VEHICLE' && vehicleData) {
            setPlateNumber(vehicleData.plateNumber || '');
            setBrand(vehicleData.brand || '');
            setModel(vehicleData.model || '');
            setColor(vehicleData.color || '');
        }
    }, [visible, mode, customerData, vehicleData]);

    const handleSubmit = async () => {
        if (mode === 'CUSTOMER') {
            if (!customerData) return;

            if (!name.trim() || !phone.trim()) {
                Alert.alert('Perhatian', 'Nama dan Nomor Telepon wajib diisi!');
                return;
            }

            try {
                setIsSubmitting(true);
                await updateCustomer(String(customerData.id), {
                    name: name.trim(),
                    phone: phone.trim(),
                    address: address.trim() || undefined,
                });

                Alert.alert('Berhasil', 'Data Pelanggan berhasil diperbarui!');
                onSuccess();
                onClose();
            } catch (error: any) {
                console.log('Update Customer Error:', error);
                const errorMsg =
                    error?.response?.data?.message ||
                    error.message ||
                    'Gagal memperbarui data pelanggan.';
                Alert.alert('Gagal', errorMsg);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            if (!vehicleData) return;

            if (!plateNumber.trim() || !brand.trim() || !model.trim()) {
                Alert.alert('Perhatian', 'Plat nomor, Merk, dan Model kendaraan wajib diisi!');
                return;
            }

            try {
                setIsSubmitting(true);
                await updateVehicle(String(vehicleData.id), {
                    plateNumber: plateNumber.trim().toUpperCase(),
                    brand: brand.trim(),
                    model: model.trim(),
                    color: color.trim() || undefined,
                });

                Alert.alert('Berhasil', 'Data Kendaraan berhasil diperbarui!');
                onSuccess();
                onClose();
            } catch (error: any) {
                console.log('Update Vehicle error:', error);
                const errorMsg =
                    error?.response?.data?.message ||
                    error.message ||
                    'Gagal memperbarui data kendaraan.';
                Alert.alert('Gagal', errorMsg);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose} >
            <KeyboardAvoidingView
                className="flex-1 justify-end bg-black/40"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
                <View className="bg-white rounded-t-3xl border-t border-neutral-200 max-h-[88%] p-6">
                    <View className="flex-row justify-between items-center pb-4 border-b border-neutral-100 mb-4">
                        <View>
                            <Text className="text-lg font-black text-black">
                                {mode === 'CUSTOMER' ? 'Edit Pelanggan' : 'Edit Kendaraan'}
                            </Text>
                            <Text className="text-xs text-neutral-400 font-mono mt-0.5 uppercase">
                                Perbarui Informasi
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.7} >
                            <Text className="text-neutral-400 text-sm font-mono uppercase">Tutup</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                        {mode === 'CUSTOMER' ? (
                            <View className="space-y-4">
                                <View className="mb-3">
                                    <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Nama Lengkap *
                                    </Text>
                                    <TextInput
                                        className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                                        placeholder="Nama Lengkap"
                                        placeholderTextColor="#a3a3a3"
                                        value={name}
                                        onChangeText={setName} />
                                </View>
                                <View className="mb-3">
                                    <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Nomor Telepon *
                                    </Text>
                                    <TextInput
                                        className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                                        placeholder="Nomor Telepon"
                                        placeholderTextColor="#a3a3a3"
                                        keyboardType="phone-pad"
                                        value={phone}
                                        onChangeText={setPhone} />
                                </View>
                                <View className="mb-3">
                                    <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Alamat
                                    </Text>
                                    <TextInput
                                        className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                                        placeholder="Alamat Pelanggan"
                                        placeholderTextColor="#a3a3a3"
                                        value={address}
                                        onChangeText={setAddress} />
                                </View>
                            </View>
                        ) : (
                            <View className="space-y-4">
                                <View className="mb-3">
                                    <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Plat Nomor *
                                    </Text>
                                    <TextInput
                                        className="h-10 border-b border-neutral-200 text-black text-sm font-mono uppercase px-0"
                                        placeholder="Plat Nomor"
                                        placeholderTextColor="#a3a3a3"
                                        autoCapitalize="characters"
                                        value={plateNumber}
                                        onChangeText={setPlateNumber} />
                                </View>
                                <View className="flex-row gap-4 mb-3">
                                    <View className="flex-1">
                                        <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                            Merk *
                                        </Text>
                                        <TextInput
                                            className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                                            placeholder="Merk"
                                            placeholderTextColor="#a3a3a3"
                                            value={brand}
                                            onChangeText={setBrand} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                            Model *
                                        </Text>
                                        <TextInput
                                            className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                                            placeholder="Model"
                                            placeholderTextColor="#a3a3a3"
                                            value={model}
                                            onChangeText={setModel} />
                                    </View>
                                </View>
                                <View className="mb-3">
                                    <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                                        Warna
                                    </Text>
                                    <TextInput
                                        className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                                        placeholder="Warna"
                                        placeholderTextColor="#a3a3a3"
                                        value={color}
                                        onChangeText={setColor} />
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <View className="pt-3 border-t border-neutral-100 flex-row justify-end items-center gap-3">
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={isSubmitting}
                            className="py-2.5 px-4"
                            activeOpacity={0.7} >
                            <Text className="text-neutral-400 font-mono text-xs uppercase">Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-black py-2.5 px-6 rounded-full"
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            activeOpacity={0.85} >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white font-bold text-xs">
                                    Simpan Perubahan
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default UpdateCustomerVehicle;

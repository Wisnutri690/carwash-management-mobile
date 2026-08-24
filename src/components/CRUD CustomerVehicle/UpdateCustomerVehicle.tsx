import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView, Alert, } from 'react-native';
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
                className="flex-1 justify-end bg-black/80"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
                <View className="bg-darkSurface rounded-t-3xl border-t border-darkBorder max-h-[88%] p-5">
                    <View className="flex-row justify-between items-center pb-3 border-b border-darkBorder mb-3">
                        <View>
                            <Text className="text-lg font-bold text-white">
                                {mode === 'CUSTOMER' ? 'Edit Data Pelanggan' : 'Edit Data Kendaraan'}
                            </Text>
                            <Text className="text-xs text-neutral-400 mt-0.5">
                                Perbarui informasi data yang tersimpan
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="w-8 h-8 rounded-full bg-darkBg border border-darkBorder items-center justify-center"
                            onPress={onClose}
                            activeOpacity={0.7} >
                            <Text className="text-neutral-400 font-bold text-sm">✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                        {mode === 'CUSTOMER' ? (
                            <>
                                <View className="mb-3">
                                    <Text className="text-xs font-semibold text-neutral-300 mb-1">
                                        Nama Lengkap *
                                    </Text>
                                    <TextInput
                                        className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                                        placeholder="Nama Lengkap"
                                        placeholderTextColor="#737373"
                                        value={name}
                                        onChangeText={setName} />
                                </View>
                                <View className="mb-3">
                                    <Text className="text-xs font-semibold text-neutral-300 mb-1">
                                        No. WhatsApp / HP *
                                    </Text>
                                    <TextInput
                                        className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                                        placeholder="Nomor Telepon"
                                        placeholderTextColor="#737373"
                                        keyboardType="phone-pad"
                                        value={phone}
                                        onChangeText={setPhone} />
                                </View>
                                <View className="mb-4">
                                    <Text className="text-xs font-semibold text-neutral-300 mb-1">
                                        Alamat (Opsional)
                                    </Text>
                                    <TextInput
                                        className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                                        placeholder="Alamat Pelanggan"
                                        placeholderTextColor="#737373"
                                        value={address}
                                        onChangeText={setAddress} />
                                </View>
                            </>
                        ) : (
                            <>
                                <View className="mb-3">
                                    <Text className="text-xs font-semibold text-neutral-300 mb-1">
                                        Plat Nomor *
                                    </Text>
                                    <TextInput
                                        className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm font-mono uppercase"
                                        placeholder="Plat Nomor"
                                        placeholderTextColor="#737373"
                                        autoCapitalize="characters"
                                        value={plateNumber}
                                        onChangeText={setPlateNumber} />
                                </View>
                                <View className="flex-row space-x-3 mb-3">
                                    <View className="flex-1 mr-2">
                                        <Text className="text-xs font-semibold text-neutral-300 mb-1">
                                            Merk / Brand *
                                        </Text>
                                        <TextInput
                                            className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                                            placeholder="Merk"
                                            placeholderTextColor="#737373"
                                            value={brand}
                                            onChangeText={setBrand} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs font-semibold text-neutral-300 mb-1">
                                            Tipe / Model *
                                        </Text>
                                        <TextInput
                                            className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                                            placeholder="Model"
                                            placeholderTextColor="#737373"
                                            value={model}
                                            onChangeText={setModel} />
                                    </View>
                                </View>
                                <View className="mb-4">
                                    <Text className="text-xs font-semibold text-neutral-300 mb-1">
                                        Warna Kendaraan (Opsional)
                                    </Text>
                                    <TextInput
                                        className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                                        placeholder="Warna"
                                        placeholderTextColor="#737373"
                                        value={color}
                                        onChangeText={setColor} />
                                </View>
                            </>
                        )}
                    </ScrollView>

                    <View className="flex-row justify-end space-x-3 pt-2 border-t border-darkBorder">
                        <TouchableOpacity
                            className="px-5 py-3 rounded-xl bg-darkBg border border-darkBorder mr-2"
                            onPress={onClose}
                            disabled={isSubmitting}
                            activeOpacity={0.7} >
                            <Text className="text-neutral-400 font-bold text-xs px-2 text-center">Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="px-6 py-3 rounded-xl bg-neonPurple"
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            activeOpacity={0.8} >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white font-bold text-xs px-2 text-center">
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

import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { createCustomer } from "../../services/customerServices";
import { createVehicle } from "../../services/vehicleServices";

interface createCustomerVehicleProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateCustomerVehicle = ({ visible, onClose, onSuccess }: createCustomerVehicleProps) => {
    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [address, setAddress] = useState<string>('');

    const [plateNumber, setPlateNumber] = useState<string>('');
    const [brand, setBrand] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [color, setColor] = useState<string>('');

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const resetForm = () => {
        setName('');
        setPhone('');
        setAddress('');
        setPlateNumber('');
        setBrand('');
        setModel('');
        setColor('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert('Nama dan Nomor Telepon Customer wajib diisi!');

            return;
        }

        if (!plateNumber.trim() || !brand.trim() || !model.trim()) {
            Alert.alert('Plat, Merk, dan Model kendaraan wajib diisi!');

            return;
        }

        try {
            setIsSubmitting(true);

            const newCust = await createCustomer({
                name: name.trim(),
                phone: phone.trim(),
                address: address.trim() || undefined,
            });
            await createVehicle({
                plateNumber: plateNumber.trim().toLocaleUpperCase(),
                brand: brand.trim(),
                model: model.trim(),
                color: color.trim() || undefined,
                customerId: newCust.id,
            });
            Alert.alert('Berhasil', 'Data Customer & Kendaraan berhasil didaftarkan!');
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            console.log('Create Customer Vehicle Error', error);
            const errormsg = error?.response?.data?.message || error.message || 'Gagal mendaftarkan Customer dan Kendaraan';
            Alert.alert('Gagal', errormsg)
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose} >
            <KeyboardAvoidingView
                className="flex-1 justify-end bg-black/80"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
                <View className="bg-darkSurface rounded-t-3xl border-t border-darkBorder max-h-[88%] p-5">
                    <View className="flex-row justify-between items-center pb-3 border-b border-darkBorder mb-3">
                        <View>
                            <Text className="text-lg font-bold text-white">
                                Tambah Pelanggan & Unit
                            </Text>
                            <Text className="text-xs text-neutral-400 mt-0.5">
                                Daftarkan pemilik dan unit kendaraan baru
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="w-8 h-8 rounded-full bg-darkBg border border-darkBorder items-center justify-center"
                            onPress={handleClose}
                            activeOpacity={0.7} >
                            <Text className="text-neutral-400 font-bold text-sm">✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                        <Text className="text-xs font-bold text-neonPurple uppercase tracking-wider mb-2">
                            1. Data Pemilik (Customer)
                        </Text>
                        <View className="mb-3">
                            <Text className="text-xs font-semibold text-neutral-300 mb-1">
                                Nama Lengkap *
                            </Text>
                            <TextInput
                                className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                                placeholder="Contoh: Wisnu TriANdika"
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
                                placeholder="Contoh: 08123456789"
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
                                placeholder="Contoh: Jl. Sawangan, Depok"
                                placeholderTextColor="#737373"
                                value={address}
                                onChangeText={setAddress} />
                        </View>
                        <View className="h-[1px] bg-darkBorder my-2" />
                        <Text className="text-xs font-bold text-neonPurple uppercase tracking-wider my-2">
                            2. Data Kendaraan (Vehicle)
                        </Text>
                        <View className="mb-3">
                            <Text className="text-xs font-semibold text-neutral-300 mb-1">
                                Plat Nomor *
                            </Text>
                            <TextInput
                                className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm font-mono uppercase"
                                placeholder="Contoh: B 1234 ABC"
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
                                    placeholder="Contoh: Toyota"
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
                                    placeholder="Contoh: Avanza "
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
                                placeholder="Contoh: Hitam Metalik"
                                placeholderTextColor="#737373"
                                value={color}
                                onChangeText={setColor} />
                        </View>
                    </ScrollView>
                    <View className="flex-row justify-end space-x-3 pt-2 border-t border-darkBorder">
                        <TouchableOpacity
                            className="px-5 py-3 rounded-xl bg-darkBg border border-darkBorder mr-2"
                            onPress={handleClose}
                            disabled={isSubmitting}
                            activeOpacity={0.7} >
                            <Text className="text-neutral-400 font-bold text-xs">Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`px-6 py-3 rounded-xl ${isSubmitting ? 'bg-neonPurple/50' : 'bg-neonPurple'}`}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            activeOpacity={0.8}>
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white font-bold text-xs tracking-wide">
                                    Simpan Data
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
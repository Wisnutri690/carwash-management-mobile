import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { createCustomer } from "../../services/customerServices";
import { createVehicle } from "../../services/vehicleServices";
import type { Customer } from "../../types/customer";

interface createCustomerVehicleProps {
  visible: boolean;
  customer: Customer[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCustomerVehicle = ({
  visible,
  customer,
  onClose,
  onSuccess,
}: createCustomerVehicleProps) => {
  const [registrationMode, setRegistrationMode] = useState<
    "NEW_CUSTOMER" | "EXISTING_CUSTOMER"
  >("NEW_CUSTOMER");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const [plateNumber, setPlateNumber] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [color, setColor] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const resetForm = () => {
    setRegistrationMode("NEW_CUSTOMER");
    setSelectedCustomer(null);
    setCustomerSearch("");
    setName("");
    setPhone("");
    setAddress("");
    setPlateNumber("");
    setBrand("");
    setModel("");
    setColor("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!plateNumber.trim() || !brand.trim() || !model.trim()) {
      Alert.alert("Perhatian", "Plat, Merk, dan Model kendaraan wajib diisi!");
      return;
    }

    if (registrationMode === "NEW_CUSTOMER") {
      if (!name.trim() || !phone.trim()) {
        Alert.alert(
          "Perhatian",
          "Nama dan Nomor Telepon Customer wajib diisi!",
        );
        return;
      }
    } else {
      if (!selectedCustomer) {
        Alert.alert(
          "Perhatian",
          "Silakan pilih Customer pemilik kendaraan dari daftar!",
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      let targetCustomerId: string | number;

      if (registrationMode === "NEW_CUSTOMER") {
        const newCust = await createCustomer({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim() || undefined,
        });
        targetCustomerId = newCust.id;
      } else {
        targetCustomerId = selectedCustomer!.id;
      }
      await createVehicle({
        plateNumber: plateNumber.trim().toLocaleUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        color: color.trim() || undefined,
        customerId: targetCustomerId,
      });

      Alert.alert(
        "Berhasil",
        registrationMode === "NEW_CUSTOMER"
          ? "Data Customer & Kendaraan berhasil didaftarkan!"
          : `Kendaraan berhasil ditambahkan untuk ${selectedCustomer?.name}!`,
      );
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.log("Create Customer Vehicle Error", error);
      const errormsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal mendaftarkan Customer dan Kendaraan";
      Alert.alert("Gagal", errormsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = (customer || []).filter((cust) => {
    const query = customerSearch.toLowerCase();
    return (
      cust.name.toLowerCase().includes(query) ||
      cust.phone.toLowerCase().includes(query)
    );
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/80"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
              activeOpacity={0.7}
            >
              <Text className="text-neutral-400 font-bold text-sm">✕</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row bg-darkBg p-1 rounded-xl border border-darkBorder mb-3">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg items-center ${
                registrationMode === "NEW_CUSTOMER"
                  ? "bg-neonPurple"
                  : "bg-transparent"
              }`}
              onPress={() => {
                setRegistrationMode("NEW_CUSTOMER");
                setSelectedCustomer(null);
              }}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-bold ${
                  registrationMode === "NEW_CUSTOMER"
                    ? "text-white"
                    : "text-neutral-400"
                }`}
              >
                + Pelanggan Baru
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg items-center ${
                registrationMode === "EXISTING_CUSTOMER"
                  ? "bg-neonPurple"
                  : "bg-transparent"
              }`}
              onPress={() => setRegistrationMode("EXISTING_CUSTOMER")}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-bold ${
                  registrationMode === "EXISTING_CUSTOMER"
                    ? "text-white"
                    : "text-neutral-400"
                }`}
              >
                Relasi Vehicle
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            {registrationMode === "NEW_CUSTOMER" ? (
              <View>
                <Text className="text-xs font-bold text-neonPurple uppercase tracking-wider mb-2">
                  1. Data Pemilik (Customer Baru)
                </Text>
                <View className="mb-3">
                  <Text className="text-xs font-semibold text-neutral-300 mb-1">
                    Nama Lengkap *
                  </Text>
                  <TextInput
                    className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                    placeholder="Contoh: Wisnu TriAndika"
                    placeholderTextColor="#737373"
                    value={name}
                    onChangeText={setName}
                  />
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
                    onChangeText={setPhone}
                  />
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
                    onChangeText={setAddress}
                  />
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-xs font-bold text-neonPurple uppercase tracking-wider mb-2">
                  1. Pilih Pemilik (Customer Terdaftar)
                </Text>

                <TextInput
                  className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm mb-3"
                  placeholder="Cari nama atau no. telepon..."
                  placeholderTextColor="#737373"
                  value={customerSearch}
                  onChangeText={setCustomerSearch}
                />

                <View className="max-h-48 border border-darkBorder rounded-xl bg-darkBg p-2 mb-3">
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                  >
                    {filteredCustomers.length === 0 ? (
                      <Text className="text-xs text-neutral-500 text-center py-4">
                        Data customer tidak ditemukan.
                      </Text>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const isSelected = selectedCustomer?.id === cust.id;
                        return (
                          <TouchableOpacity
                            key={cust.id}
                            className={`p-3 rounded-xl border mb-2 flex-row justify-between items-center ${
                              isSelected
                                ? "bg-neonPurple/20 border-neonPurple"
                                : "bg-darkSurface border-darkBorder"
                            }`}
                            onPress={() => setSelectedCustomer(cust)}
                            activeOpacity={0.7}
                          >
                            <View>
                              <Text className="text-sm font-bold text-white">
                                {cust.name}
                              </Text>
                              <Text className="text-xs text-neutral-400 mt-0.5">
                                {cust.phone}
                              </Text>
                            </View>
                            {isSelected && (
                              <View className="bg-neonPurple px-2.5 py-1 rounded-lg">
                                <Text className="text-[10px] font-bold text-white">
                                  ✓ Terpilih
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </View>
            )}

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
                onChangeText={setPlateNumber}
              />
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
                  onChangeText={setBrand}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-neutral-300 mb-1">
                  Tipe / Model *
                </Text>
                <TextInput
                  className="h-11 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                  placeholder="Contoh: Avanza"
                  placeholderTextColor="#737373"
                  value={model}
                  onChangeText={setModel}
                />
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
                onChangeText={setColor}
              />
            </View>
          </ScrollView>
          <View className="flex-row justify-end space-x-3 pt-2 border-t border-darkBorder">
            <TouchableOpacity
              className="px-5 py-3 rounded-xl bg-darkBg border border-darkBorder mr-2"
              onPress={handleClose}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text className="text-neutral-400 font-bold text-xs px-2 text-center">
                Batal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-6 py-3 rounded-xl ${isSubmitting ? "bg-neonPurple/50" : "bg-neonPurple"}`}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs px-2 text-center">
                  Simpan Data
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

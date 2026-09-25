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
        className="flex-1 justify-end bg-black/40"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="bg-white rounded-t-3xl border-t border-neutral-200 max-h-[88%] p-6">
          <View className="flex-row justify-between items-center pb-4 border-b border-neutral-100 mb-4">
            <View>
              <Text className="text-lg font-black text-black">
                Tambah Data
              </Text>
              <Text className="text-xs text-neutral-400 font-mono mt-0.5 uppercase">
                Customer & Unit
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text className="text-neutral-400 text-sm font-mono uppercase">Tutup</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row border-b border-neutral-100 mb-4">
            <TouchableOpacity
              className={`pb-2.5 mr-6 ${
                registrationMode === "NEW_CUSTOMER"
                  ? "border-b-2 border-black"
                  : "opacity-40"
              }`}
              onPress={() => {
                setRegistrationMode("NEW_CUSTOMER");
                setSelectedCustomer(null);
              }}
              activeOpacity={0.8}
            >
              <Text className="text-xs font-bold text-black uppercase tracking-wider">
                Pelanggan Baru
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`pb-2.5 ${
                registrationMode === "EXISTING_CUSTOMER"
                  ? "border-b-2 border-black"
                  : "opacity-40"
              }`}
              onPress={() => setRegistrationMode("EXISTING_CUSTOMER")}
              activeOpacity={0.8}
            >
              <Text className="text-xs font-bold text-black uppercase tracking-wider">
                Pilih Pelanggan
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            {registrationMode === "NEW_CUSTOMER" ? (
              <View className="space-y-4 mb-4">
                <View className="mb-3">
                  <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                    Nama Lengkap *
                  </Text>
                  <TextInput
                    className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                    placeholder="Nama Lengkap"
                    placeholderTextColor="#a3a3a3"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <View className="mb-3">
                  <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                    Nomor Telepon *
                  </Text>
                  <TextInput
                    className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                    placeholder="08123456789"
                    placeholderTextColor="#a3a3a3"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
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
                    onChangeText={setAddress}
                  />
                </View>
              </View>
            ) : (
              <View className="mb-4">
                <TextInput
                  className="h-10 border-b border-neutral-200 text-black text-sm px-0 mb-3"
                  placeholder="Cari nama atau telepon..."
                  placeholderTextColor="#a3a3a3"
                  value={customerSearch}
                  onChangeText={setCustomerSearch}
                />

                <View className="max-h-40 border border-neutral-100 rounded-xl p-2 mb-3">
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                    {filteredCustomers.length === 0 ? (
                      <Text className="text-xs text-neutral-400 font-mono text-center py-4">
                        Tidak ditemukan.
                      </Text>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const isSelected = selectedCustomer?.id === cust.id;
                        return (
                          <TouchableOpacity
                            key={cust.id}
                            className={`p-2.5 border-b border-neutral-100 flex-row justify-between items-center ${
                              isSelected ? "bg-neutral-100" : ""
                            }`}
                            onPress={() => setSelectedCustomer(cust)}
                            activeOpacity={0.7}
                          >
                            <View>
                              <Text className="text-xs font-bold text-black">
                                {cust.name}
                              </Text>
                              <Text className="text-[11px] text-neutral-400 font-mono">
                                {cust.phone}
                              </Text>
                            </View>
                            {isSelected && (
                              <Text className="text-xs font-mono font-bold text-black">
                                ✓
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </View>
            )}

            <View className="pt-2 mb-4">
              <Text className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-3">
                Data Unit Kendaraan
              </Text>
              
              <View className="mb-3">
                <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Plat Nomor *
                </Text>
                <TextInput
                  className="h-10 border-b border-neutral-200 text-black text-sm font-mono uppercase px-0"
                  placeholder="B 1234 ABC"
                  placeholderTextColor="#a3a3a3"
                  autoCapitalize="characters"
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                />
              </View>

              <View className="flex-row gap-4 mb-3">
                <View className="flex-1">
                  <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                    Merk *
                  </Text>
                  <TextInput
                    className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                    placeholder="Toyota"
                    placeholderTextColor="#a3a3a3"
                    value={brand}
                    onChangeText={setBrand}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                    Model *
                  </Text>
                  <TextInput
                    className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                    placeholder="Avanza"
                    placeholderTextColor="#a3a3a3"
                    value={model}
                    onChangeText={setModel}
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Warna
                </Text>
                <TextInput
                  className="h-10 border-b border-neutral-200 text-black text-sm px-0"
                  placeholder="Hitam"
                  placeholderTextColor="#a3a3a3"
                  value={color}
                  onChangeText={setColor}
                />
              </View>
            </View>
          </ScrollView>

          <View className="pt-3 border-t border-neutral-100 flex-row justify-end items-center gap-3">
            <TouchableOpacity
              onPress={handleClose}
              disabled={isSubmitting}
              className="py-2.5 px-4"
              activeOpacity={0.7}
            >
              <Text className="text-neutral-400 font-mono text-xs uppercase">Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-black py-2.5 px-6 rounded-full"
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">
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

export default CreateCustomerVehicle;

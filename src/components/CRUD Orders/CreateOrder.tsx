import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getCustomer } from "../../services/customerServices";
import { getVehicle } from "../../services/vehicleServices";
import { createOrder } from "../../services/orderServices";
import { getServices } from "../../services/serviceService";
import type { Customer } from "../../types/customer";
import type { Vehicle } from "../../types/vehicle";
import type { Service } from "../../types/service";
import { getStaffs } from "../../services/staffServices";
import type { Staff } from "../../types/staff";

interface CreateOrderProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOrder = ({
  visible,
  onClose,
  onSuccess,
}: CreateOrderProps) => {
  const [customer, setCustomer] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number>(
    "",
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | number>(
    "",
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string | number>("");
  const [selectedItems, setSelectedItems] = useState<
    { serviceId: string | number; quantity: number }[]
  >([]);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchOptions = async () => {
    try {
      setIsLoadingData(true);
      const [customerList, vehicleList, serviceList, staffList] =
        await Promise.all([
          getCustomer(),
          getVehicle(),
          getServices(),
          getStaffs(),
        ]);
      setCustomer(customerList);
      setVehicles(vehicleList);
      setServices(serviceList);
      setStaffs(staffList);

      if (customerList.length > 0) {
        setSelectedCustomerId(customerList[0].id);
      }
      if (serviceList.length > 0) {
        setSelectedItems([{ serviceId: serviceList[0].id, quantity: 1 }]);
      }
      if (staffList.length > 0) {
        setSelectedStaffId(staffList[0].id);
      }
    } catch (error) {
      console.log("Error fetch options for CreateOrder:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOptions();
    }
  }, [visible]);

  const availableVehicles = vehicles.filter(
    (v) => String(v.customerId) === String(selectedCustomerId),
  );

  useEffect(() => {
    if (availableVehicles.length > 0) {
      setSelectedVehicleId(availableVehicles[0].id);
    } else {
      setSelectedVehicleId("");
    }
  }, [selectedCustomerId, vehicles]);

  const handleToggleService = (serviceId: string | number) => {
    setSelectedItems((prev) => {
      const exists = prev.find(
        (i) => String(i.serviceId) === String(serviceId),
      );
      if (exists) {
        return prev.filter((i) => String(i.serviceId) !== String(serviceId));
      } else {
        return [...prev, { serviceId, quantity: 1 }];
      }
    });
  };

  const calculatedTotalPrice = services.reduce((sum, srv) => {
    const item = selectedItems.find(
      (i) => String(i.serviceId) === String(srv.id),
    );
    return sum + (item ? Number(srv.price) : 0);
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleClose = () => {
    setSelectedCustomerId("");
    setSelectedVehicleId("");
    setSelectedItems([]);
    setSelectedStaffId("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      Alert.alert("Peringatan", "Silakan pilih pelanggan terlebih dahulu.");
      return;
    }
    if (!selectedVehicleId) {
      Alert.alert(
        "Peringatan",
        "Pelanggan ini belum memiliki kendaraan terdaftar. Daftarkan kendaraan terlebih dahulu.",
      );
      return;
    }
    if (selectedItems.length === 0) {
      Alert.alert("Peringatan", "Pilih minimal 1 paket layanan cuci.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createOrder({
        customerId: Number(selectedCustomerId),
        vehicleId: Number(selectedVehicleId),
        staffId: selectedStaffId ? Number(selectedStaffId) : undefined,
        services: selectedItems.map((item) => ({
          serviceId: Number(item.serviceId),
          quantity: item.quantity || 1,
        })),
        items: selectedItems.map((item) => ({
          serviceId: Number(item.serviceId),
          quantity: item.quantity || 1,
        })),
      } as any);
      Alert.alert("Berhasil", "Transaksi order baru berhasil disimpan.");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.log("Create Order Error:", error?.response?.data || error);
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal membuat transaksi order baru.";
      Alert.alert("Gagal", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-white border-t border-neutral-200 rounded-t-3xl p-6 max-h-[88%]">
          <View className="flex-row justify-between items-center pb-4 border-b border-neutral-100 mb-4">
            <View>
              <Text className="text-lg font-black text-black">
                Tambah Order
              </Text>
              <Text className="text-xs text-neutral-400 font-mono mt-0.5 uppercase">
                Transaksi Baru
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <Text className="text-neutral-400 text-sm font-mono uppercase">Tutup</Text>
            </TouchableOpacity>
          </View>

          {isLoadingData ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="small" color="#000000" />
              <Text className="mt-3 text-xs text-neutral-400 font-mono">
                MEMUAT DATA...
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  1. Pilih Pelanggan *
                </Text>
                {customer.length === 0 ? (
                  <Text className="text-xs text-neutral-400 font-mono py-2">
                    Belum ada data pelanggan.
                  </Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {customer.map((cust) => {
                        const isSelected = selectedCustomerId === cust.id;
                        return (
                          <TouchableOpacity
                            key={cust.id}
                            className={`px-3.5 py-2.5 rounded-xl border ${
                              isSelected
                                ? "bg-black border-black"
                                : "border-neutral-200"
                            }`}
                            onPress={() => setSelectedCustomerId(cust.id)}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? "text-white" : "text-black"
                              }`}
                            >
                              {cust.name}
                            </Text>
                            <Text
                              className={`text-[10px] font-mono mt-0.5 ${
                                isSelected ? "text-neutral-300" : "text-neutral-400"
                              }`}
                            >
                              {cust.phone}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  2. Pilih Unit Kendaraan *
                </Text>
                {availableVehicles.length === 0 ? (
                  <View className="py-3 px-4 border border-dashed border-neutral-200 rounded-xl">
                    <Text className="text-xs text-neutral-400 font-mono text-center">
                      Pelanggan ini belum memiliki kendaraan terdaftar.
                    </Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {availableVehicles.map((veh) => {
                        const isSelected = selectedVehicleId === veh.id;
                        return (
                          <TouchableOpacity
                            key={veh.id}
                            className={`px-3.5 py-2.5 rounded-xl border ${
                              isSelected
                                ? "bg-black border-black"
                                : "border-neutral-200"
                            }`}
                            onPress={() => setSelectedVehicleId(veh.id)}
                          >
                            <Text
                              className={`text-xs font-bold font-mono ${
                                isSelected ? "text-white" : "text-black"
                              }`}
                            >
                              {veh.plateNumber}
                            </Text>
                            <Text
                              className={`text-[10px] mt-0.5 ${
                                isSelected ? "text-neutral-300" : "text-neutral-400"
                              }`}
                            >
                              {veh.brand} {veh.model}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  3. Paket Layanan Cuci *
                </Text>
                {services.length === 0 ? (
                  <Text className="text-xs text-neutral-400 font-mono py-2">
                    Belum ada layanan tersedia.
                  </Text>
                ) : (
                  <View className="border-t border-neutral-100">
                    {services.map((service) => {
                      const selectedItem = selectedItems.find(
                        (i) => String(i.serviceId) === String(service.id),
                      );
                      const isSelected = !!selectedItem;

                      return (
                        <TouchableOpacity
                          key={service.id}
                          className="py-3 border-b border-neutral-100 flex-row justify-between items-center"
                          onPress={() => handleToggleService(service.id)}
                          activeOpacity={0.7}
                        >
                          <View className="flex-row items-center flex-1">
                            <Text
                              className={`font-mono text-sm mr-3 ${
                                isSelected ? "text-black font-bold" : "text-neutral-300"
                              }`}
                            >
                              {isSelected ? "✓" : "○"}
                            </Text>
                            <View className="flex-1">
                              <Text
                                className={`text-xs ${
                                  isSelected ? "font-black text-black" : "font-medium text-neutral-700"
                                }`}
                              >
                                {service.name}
                              </Text>
                              <Text className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                {formatCurrency(Number(service.price))}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  4. Petugas Cuci (Opsional)
                </Text>
                {staffs.length === 0 ? (
                  <Text className="text-xs text-neutral-400 font-mono py-2">
                    Belum ada data staff.
                  </Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {staffs.map((staff) => {
                        const isSelected = String(selectedStaffId) === String(staff.id);
                        return (
                          <TouchableOpacity
                            key={staff.id}
                            className={`px-3 py-1.5 rounded-xl border ${
                              isSelected
                                ? "bg-black border-black"
                                : "border-neutral-200"
                            }`}
                            onPress={() => setSelectedStaffId(staff.id)}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? "text-white" : "text-black"
                              }`}
                            >
                              {staff.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                )}
              </View>

              <View className="py-3 border-t border-neutral-200 flex-row justify-between items-center mb-6">
                <Text className="text-xs font-mono uppercase text-neutral-400">
                  Total Biaya
                </Text>
                <Text className="text-lg font-black text-black font-mono">
                  {formatCurrency(calculatedTotalPrice)}
                </Text>
              </View>

              <View className="pt-2 border-t border-neutral-100 flex-row justify-end items-center gap-3 mb-4">
                <TouchableOpacity
                  onPress={handleClose}
                  className="py-2.5 px-4"
                  activeOpacity={0.7}
                >
                  <Text className="text-neutral-400 font-mono text-xs uppercase">Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-black py-2.5 px-6 rounded-full"
                  onPress={handleSubmit}
                  disabled={isSubmitting || !selectedCustomerId || !selectedVehicleId || selectedItems.length === 0}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-xs">
                      Simpan Order
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateOrder;

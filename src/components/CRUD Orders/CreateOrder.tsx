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
      Alert.alert("Peringatan", "Silakan pilih pelanggan terlebih dahulu!");
      return;
    }
    if (!selectedVehicleId) {
      Alert.alert(
        "Peringatan",
        "Pelanggan ini belum memiliki kendaraan terdaftar! Daftarkan kendaraan terlebih dahulu di menu Pelanggan & Unit.",
      );
      return;
    }
    if (selectedItems.length === 0) {
      Alert.alert("Peringatan", "Silakan pilih minimal 1 paket layanan cuci!");
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
      Alert.alert("Berhasil", "Transaksi order pencucian berhasil dibuat!");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.log("Create Order Error:", error?.response?.data || error);

      const serverErrors = error?.response?.data?.errors;
      const errorDetail = Array.isArray(serverErrors)
        ? serverErrors.map((e: any) => `${e.path?.join(".")}: ${e.message}`).join("\n")
        : "";

      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal membuat transaksi order baru.";

      Alert.alert("Gagal", errorDetail ? `${errorMsg}\n\n${errorDetail}` : errorMsg);
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="bg-darkSurface border-t border-darkBorder rounded-t-3xl p-5 max-h-[90%]">
          <View className="items-center mb-4">
            <View className="w-10 h-1 bg-neutral-700 rounded-full mb-3" />
            <Text className="w-full text-center text-base font-bold text-white">
              Tambah Order Pencucian
            </Text>
            <Text className="w-full text-center text-xs text-neutral-400 mt-0.5">
              Pilih pelanggan, unit kendaraan, dan paket cuci
            </Text>
          </View>

          {isLoadingData ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="large" color="#a855f7" />
              <Text className="mt-3 text-xs text-neutral-400">
                Memuat data pelanggan & kendaraan...
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-xs font-bold text-neutral-300 uppercase mb-2">
                  1. Pilih Pelanggan *
                </Text>
                {customer.length === 0 ? (
                  <View className="bg-darkBg p-3 rounded-xl border border-darkBorder">
                    <Text className="text-xs text-neutral-500">
                      Belum ada data pelanggan. Tambahkan pelanggan terlebih
                      dahulu.
                    </Text>
                  </View>
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
                                ? "bg-neonPurple/20 border-neonPurple"
                                : "bg-darkBg border-darkBorder"
                            }`}
                            onPress={() => setSelectedCustomerId(cust.id)}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? "text-neonPurple" : "text-white"
                              }`}
                            >
                              {cust.name}
                            </Text>
                            <Text className="text-[10px] text-neutral-400 mt-0.5">
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
                <Text className="text-xs font-bold text-neutral-300 uppercase mb-2">
                  2. Pilih Unit Kendaraan *
                </Text>
                {availableVehicles.length === 0 ? (
                  <View className="bg-darkBg p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10">
                    <Text className="text-xs text-amber-400">
                      Pelanggan ini belum memiliki unit kendaraan terdaftar.
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
                                ? "bg-neonPurple/20 border-neonPurple"
                                : "bg-darkBg border-darkBorder"
                            }`}
                            onPress={() => setSelectedVehicleId(veh.id)}
                          >
                            <Text
                              className={`text-xs font-bold font-mono ${
                                isSelected ? "text-neonPurple" : "text-white"
                              }`}
                            >
                              {veh.plateNumber}
                            </Text>
                            <Text className="text-[10px] text-neutral-400 mt-0.5">
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
                <Text className="text-xs font-bold text-neutral-300 uppercase mb-2">
                  3. Staff yang Bertugas *
                </Text>
                {staffs.length === 0 ? (
                  <View className="bg-darkBg p-3 rounded-xl border border-darkBorder">
                    <Text className="text-xs text-neutral-500">
                      Belum ada data staff di database.
                    </Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {staffs.map((staff) => {
                        const isSelected =
                          String(selectedStaffId) === String(staff.id);
                        return (
                          <TouchableOpacity
                            key={staff.id}
                            className={`px-3.5 py-2.5 rounded-xl border ${
                              isSelected
                                ? "bg-neonPurple/20 border-neonPurple"
                                : "bg-darkBg border-darkBorder"
                            }`}
                            onPress={() => setSelectedStaffId(staff.id)}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? "text-neonPurple" : "text-white"
                              }`}
                            >
                              {staff.name}
                            </Text>
                            <Text className="text-[10px] text-neutral-400 mt-0.5">
                              {staff.phone || "Staff"}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-xs font-bold text-neutral-300 uppercase mb-2">
                  4. Layanan Cuci (Bisa Pilih Lebih Dari 1) *
                </Text>
                {services.length === 0 ? (
                  <View className="bg-darkBg p-3 rounded-xl border border-darkBorder">
                    <Text className="text-xs text-neutral-500">
                      Belum ada paket layanan cuci di database.
                    </Text>
                  </View>
                ) : (
                  <View className="gap-2">
                    {services.map((service) => {
                      const selectedItem = selectedItems.find(
                        (i) => String(i.serviceId) === String(service.id),
                      );
                      const isSelected = !!selectedItem;

                      return (
                        <TouchableOpacity
                          key={service.id}
                          className={`p-3 rounded-2xl border flex-row justify-between items-center ${
                            isSelected
                              ? "bg-neonPurple/15 border-neonPurple"
                              : "bg-darkBg border-darkBorder"
                          }`}
                          onPress={() => handleToggleService(service.id)}
                          activeOpacity={0.7}
                        >
                          <View className="flex-row items-center flex-1">
                            <View
                              className={`w-4 h-4 rounded-md mr-2.5 border items-center justify-center ${
                                isSelected
                                  ? "bg-neonPurple border-neonPurple"
                                  : "border-neutral-600"
                              }`}
                            >
                              {isSelected && (
                                <Text className="text-[10px] font-bold text-white">
                                  ✓
                                </Text>
                              )}
                            </View>
                            <View className="flex-1">
                              <Text
                                className={`text-xs font-bold ${
                                  isSelected
                                    ? "text-white"
                                    : "text-neutral-300"
                                }`}
                              >
                                {service.name}
                              </Text>
                              <Text className="text-[10px] text-neonPurple font-semibold mt-0.5">
                                {formatCurrency(Number(service.price))}
                              </Text>
                            </View>
                          </View>

                          {isSelected && (
                            <View className="bg-neonPurple/20 border border-neonPurple/40 px-2.5 py-1 rounded-lg">
                              <Text className="text-[10px] font-bold text-neonPurple">
                                Terpilih
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View className="bg-darkBg rounded-2xl p-4 border border-darkBorder mb-5 flex-row justify-between items-center">
                <View>
                  <Text className="text-xs text-neutral-400 font-medium">
                    Total Biaya Transaksi:
                  </Text>
                  <Text className="text-[10px] text-neutral-500 mt-0.5">
                    {selectedItems.length} layanan dipilih
                  </Text>
                </View>
                <Text className="text-base font-bold text-neonPurple font-mono">
                  {formatCurrency(calculatedTotalPrice)}
                </Text>
              </View>

              <View className="flex-row justify-end space-x-3 pt-2 border-t border-darkBorder mb-3">
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
                  className={`px-6 py-3 rounded-xl ${
                    isSubmitting ? "bg-neonPurple/50" : "bg-neonPurple"
                  }`}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-xs px-2 text-center">
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

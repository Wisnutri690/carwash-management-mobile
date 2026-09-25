import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { deleteCustomer } from "../../services/customerServices";
import { deleteVehicle } from "../../services/vehicleServices";
import type { Customer } from "../../types/customer";
import type { Vehicle } from "../../types/vehicle";

interface DeleteCustomerVehicleProps {
  visible: boolean;
  mode: "CUSTOMER" | "VEHICLE";
  customerData?: Customer | null;
  vehicleData?: Vehicle | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteCustomerVehicle = ({
  visible,
  mode,
  customerData,
  vehicleData,
  onClose,
  onSuccess,
}: DeleteCustomerVehicleProps) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    if (mode === "CUSTOMER") {
      if (!customerData) return;

      try {
        setIsDeleting(true);
        await deleteCustomer(String(customerData.id));
        Alert.alert(
          "Berhasil",
          `Data pelanggan "${customerData.name}" berhasil dihapus!`,
        );
        onSuccess();
        onClose();
      } catch (error: any) {
        console.log("Delete Customer Error", error);
        const errMsg =
          error?.response?.data?.message ||
          error.message ||
          "Gagal menghapus data Customer.";
        Alert.alert("Gagal", errMsg);
      } finally {
        setIsDeleting(false);
      }
    } else {
      if (!vehicleData) return;

      try {
        setIsDeleting(true);
        await deleteVehicle(String(vehicleData.id));
        Alert.alert(
          "Berhasil",
          `Vehicle "${vehicleData.plateNumber}" berhasil dihapus`,
        );
        onSuccess();
        onClose();
      } catch (error: any) {
        console.log("Delete Vehicle Error", error);
        const errMSg =
          error?.response?.data?.message ||
          error.message ||
          "Gagal menghapus data Vehicle";
        Alert.alert("Gagal", errMSg);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const targetName =
    mode === "CUSTOMER"
      ? customerData?.name || "Customer ini"
      : vehicleData?.plateNumber || "Vehicle ini";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/40 px-6">
        <View className="w-full bg-white rounded-2xl p-6 border border-neutral-200">
          <Text className="text-base font-black text-black mb-2">
            {mode === "CUSTOMER"
              ? "Hapus Data Pelanggan"
              : "Hapus Unit Kendaraan"}
          </Text>
          <Text className="text-xs text-neutral-500 leading-5 mb-6">
            Apakah Anda yakin ingin menghapus{" "}
            <Text className="text-black font-bold">{targetName}</Text>? Tindakan ini tidak dapat dibatalkan.
          </Text>
          <View className="flex-row justify-end items-center gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isDeleting}
              className="py-2 px-4"
              activeOpacity={0.7}
            >
              <Text className="text-neutral-400 font-mono text-xs uppercase">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-black py-2.5 px-5 rounded-full"
              onPress={handleDelete}
              disabled={isDeleting}
              activeOpacity={0.85}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-xs">
                  Hapus
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteCustomerVehicle;

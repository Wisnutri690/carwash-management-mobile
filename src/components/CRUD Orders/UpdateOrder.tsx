import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import type { Order, OrderStatus, PaymentMethod } from "../../types/order";
import {
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from "../../services/orderServices";
import { InvoiceModal } from "./InvoiceModal";

interface UpdateOrderStatusProps {
  visible: boolean;
  orderData: Order | null;
  onClose: () => void;
  onSuccess: () => void;
}  

export const UpdateOrder = ({
  visible,
  orderData,
  onClose,
  onSuccess,
}: UpdateOrderStatusProps) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isInvoiceVisible, setIsInvoiceVisible] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("CASH");

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!orderData) return;

    try {
      setIsSubmitting(true);
      await updateOrderStatus(orderData.id, newStatus);
      Alert.alert("Berhasil", "Status order berhasil diperbaharui!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.log("Update Status Error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal memperbaharui status order";
      Alert.alert("Gagal", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!orderData) return;
    try {
      setIsSubmitting(true);
      await updatePaymentStatus(orderData.id, {
        paymentStatus: "PAID",
        paymentMethod: selectedPaymentMethod,
      });
      Alert.alert("Berhasil", `Pembayaran via ${selectedPaymentMethod}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.log("Update Payment Error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal mencatat pembayaran.";
      Alert.alert("Gagal", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderData) return null;

  const isPaid = orderData.paymentStatus === "PAID";

  const handleDeleteOrder = () => {
    if (!orderData) return;

    Alert.alert(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus transaksi order untuk kendaraan ${orderData.vehicle?.plateNumber || ""}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await deleteOrder(orderData.id);
              Alert.alert("Berhasil", "Transaksi order berhasil dihapus!");
              onSuccess();
              onClose();
            } catch (error: any) {
              console.log("Delete Order Error:", error);
              const errorMsg =
                error?.response?.data?.message ||
                error.message ||
                "Gagal menghapus transaksi order.";
              Alert.alert("Gagal", errorMsg);
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/60 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          className="bg-darkSurface border-t border-darkBorder rounded-t-3xl p-5 max-h-[85%]"
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="items-center mb-4">
            <View className="w-10 h-1 bg-neutral-700 rounded-full mb-3" />
            <Text className="w-full text-center text-xs text-neutral-400 uppercase font-semibold px-4">
              Kelola Order & Pembayaran
            </Text>
            <Text className="w-full text-center text-base font-bold text-white font-mono px-4 mt-0.5">
              {orderData.vehicle?.plateNumber || "NO PLAT"}
            </Text>
            <Text className="w-full text-center text-xs text-neonPurple font-medium px-4 mt-0.5">
              {orderData.customer?.name || "Customer"}
            </Text>
          </View>

          <Text className="text-xs font-bold text-neutral-400 uppercase mb-2">
            1. Ubah Status Pengerjaan:
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            <TouchableOpacity
              className={`flex-1 min-w-[45%] p-3 rounded-xl border ${
                orderData.status === "WAITING"
                  ? "bg-amber-500/20 border-amber-500"
                  : "bg-darkBg border-darkBorder"
              }`}
              onPress={() => handleStatusChange("WAITING")}
              disabled={isSubmitting}
            >
              <Text className="text-xs font-bold text-amber-400 text-center">
                Menunggu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 min-w-[45%] p-3 rounded-xl border ${
                orderData.status === "IN_PROGRESS"
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-darkBg border-darkBorder"
              }`}
              onPress={() => handleStatusChange("IN_PROGRESS")}
              disabled={isSubmitting}
            >
              <Text className="text-xs font-bold text-blue-400 text-center">
                Sedang Dicuci
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 min-w-[45%] p-3 rounded-xl border ${
                orderData.status === "COMPLETED"
                  ? "bg-emerald-500/20 border-emerald-500"
                  : "bg-darkBg border-darkBorder"
              }`}
              onPress={() => handleStatusChange("COMPLETED")}
              disabled={isSubmitting}
            >
              <Text className="text-xs font-bold text-emerald-400 text-center">
                Selesai
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 min-w-[45%] p-3 rounded-xl border ${
                orderData.status === "CANCELLED"
                  ? "bg-red-500/20 border-red-500"
                  : "bg-darkBg border-darkBorder"
              }`}
              onPress={() => handleStatusChange("CANCELLED")}
              disabled={isSubmitting}
            >
              <Text className="text-xs font-bold text-red-400 text-center">
                Batal
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs font-bold text-neutral-400 uppercase mb-2">
            2. Pelunasan Pembayaran:
          </Text>
          {isPaid ? (
            <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 items-center mb-4">
              <Text className="text-xs font-bold text-emerald-400">
                Transaksi Sudah LUNAS ({orderData.paymentMethod || "CASH"})
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              <Text className="text-xs text-neutral-400 mb-2">
                Pilih Metode Pembayaran:
              </Text>
              <View className="flex-row gap-2 mb-3">
                {(["CASH", "QRIS", "TRANSFER"] as PaymentMethod[]).map(
                  (method) => (
                    <TouchableOpacity
                      key={method}
                      className={`flex-1 py-2.5 rounded-xl border items-center ${
                        selectedPaymentMethod === method
                          ? "bg-neonPurple/20 border-neonPurple"
                          : "bg-darkBg border-darkBorder"
                      }`}
                      onPress={() => setSelectedPaymentMethod(method)}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          selectedPaymentMethod === method
                            ? "text-neonPurple"
                            : "text-neutral-400"
                        }`}
                      >
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
              <TouchableOpacity
                className="bg-emerald-600 rounded-xl p-3.5 items-center justify-center"
                onPress={handlePaymentSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-xs font-bold text-white">
                    Bayar Via ({selectedPaymentMethod})
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            className="w-full py-3 bg-neonPurple/15 border border-neonPurple/40 rounded-xl items-center justify-center mb-2"
            onPress={() => setIsInvoiceVisible(true)}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-bold text-neonPurple">
              Lihat Nota Invoice
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-3 bg-red-500/10 border border-red-500/30 rounded-xl items-center justify-center mb-2"
            onPress={handleDeleteOrder}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-bold text-red-400">
              Hapus Transaksi Order
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-3 items-center justify-center"
            onPress={onClose}
          >
            <Text className="w-full text-center text-xs text-neutral-400 font-semibold px-4">
              Tutup
            </Text>
          </TouchableOpacity>
          <InvoiceModal
            visible={isInvoiceVisible}
            orderId={orderData.id}
            onClose={() => setIsInvoiceVisible(false)}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default UpdateOrder;

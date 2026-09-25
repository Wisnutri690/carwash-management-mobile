import { useState, useEffect } from "react";
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
  const [activeView, setActiveView] = useState<"MENU" | "STATUS" | "PAYMENT">(
    "MENU",
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("CASH");

  useEffect(() => {
    if (visible) {
      setActiveView("MENU");
    }
  }, [visible]);

  const handleCloseAll = () => {
    setActiveView("MENU");
    onClose();
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!orderData) return;

    try {
      setIsSubmitting(true);
      await updateOrderStatus(orderData.id, newStatus);
      Alert.alert("Berhasil", "Status order berhasil diperbarui.");
      onSuccess();
      handleCloseAll();
    } catch (error: any) {
      console.log("Update Status Error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal memperbarui status order";
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
      Alert.alert("Berhasil", `Pembayaran via ${selectedPaymentMethod} tercatat.`);
      onSuccess();
      handleCloseAll();
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
      `Hapus transaksi order kendaraan ${orderData.vehicle?.plateNumber || ""}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await deleteOrder(orderData.id);
              Alert.alert("Berhasil", "Order berhasil dihapus.");
              onSuccess();
              handleCloseAll();
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
      onRequestClose={handleCloseAll}
    >
      <TouchableOpacity
        className="flex-1 bg-black/40 justify-end"
        activeOpacity={1}
        onPress={handleCloseAll}
      >
        <TouchableOpacity
          className="bg-white border-t border-neutral-200 rounded-t-3xl p-6"
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {activeView === "MENU" && (
            <View>
              <View className="items-center mb-4">
                <View className="w-8 h-1 bg-neutral-300 rounded-full mb-3" />
                <Text className="text-base font-black text-black font-mono">
                  {orderData.vehicle?.plateNumber || "NO PLAT"}
                </Text>
                <Text className="text-xs text-neutral-400 mt-0.5">
                  {orderData.customer?.name || "Customer"}
                </Text>
              </View>

              <TouchableOpacity
                className="py-3.5 border-b border-neutral-100 flex-row justify-between items-center"
                onPress={() => setActiveView("STATUS")}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-bold text-black">
                  Ubah Status Pengerjaan
                </Text>
                <Text className="text-neutral-400 text-sm font-mono">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3.5 border-b border-neutral-100 flex-row justify-between items-center"
                onPress={() => setActiveView("PAYMENT")}
                activeOpacity={0.7}
              >
                <View>
                  <Text className="text-sm font-bold text-black">
                    Pelunasan Pembayaran
                  </Text>
                  <Text className="text-[10px] font-mono text-neutral-400 uppercase mt-0.5">
                    {isPaid ? "Status: Lunas" : "Status: Belum Bayar"}
                  </Text>
                </View>
                <Text className="text-neutral-400 text-sm font-mono">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3.5 border-b border-neutral-100 flex-row justify-between items-center"
                onPress={() => setIsInvoiceVisible(true)}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-bold text-black">
                  Lihat Nota Invoice
                </Text>
                <Text className="text-neutral-400 text-sm font-mono">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3.5 border-b border-neutral-100 flex-row justify-between items-center"
                onPress={handleDeleteOrder}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-bold text-red-600">
                  Hapus Transaksi Order
                </Text>
                <Text className="text-neutral-400 text-sm font-mono">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full py-4 items-center justify-center mt-1"
                onPress={handleCloseAll}
              >
                <Text className="text-xs font-mono uppercase text-neutral-400">
                  Batal
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeView === "STATUS" && (
            <View>
              <View className="items-center mb-4">
                <View className="w-8 h-1 bg-neutral-300 rounded-full mb-3" />
                <Text className="text-xs font-mono uppercase text-neutral-400">
                  Pilih Status Baru
                </Text>
                <Text className="text-sm font-black text-black font-mono mt-0.5">
                  {orderData.vehicle?.plateNumber}
                </Text>
              </View>

              {[
                { key: "WAITING", label: "Menunggu" },
                { key: "IN_PROGRESS", label: "Sedang Dicuci" },
                { key: "COMPLETED", label: "Selesai" },
                { key: "CANCELLED", label: "Dibatalkan" },
              ].map((st) => {
                const isCurrent = orderData.status === st.key;
                return (
                  <TouchableOpacity
                    key={st.key}
                    className="py-3.5 border-b border-neutral-100 flex-row justify-between items-center"
                    onPress={() => handleStatusChange(st.key as OrderStatus)}
                    disabled={isSubmitting}
                  >
                    <Text
                      className={`text-sm ${
                        isCurrent ? "font-black text-black" : "font-medium text-neutral-600"
                      }`}
                    >
                      {st.label}
                    </Text>
                    {isCurrent && (
                      <Text className="text-xs font-mono font-bold text-black">
                        ✓ Aktif
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                className="w-full py-4 items-center justify-center mt-2"
                onPress={() => setActiveView("MENU")}
              >
                <Text className="text-xs font-mono uppercase text-neutral-400">
                  Kembali
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeView === "PAYMENT" && (
            <View>
              <View className="items-center mb-4">
                <View className="w-8 h-1 bg-neutral-300 rounded-full mb-3" />
                <Text className="text-xs font-mono uppercase text-neutral-400">
                  Pelunasan Pembayaran
                </Text>
                <Text className="text-sm font-black text-black font-mono mt-0.5">
                  {orderData.vehicle?.plateNumber}
                </Text>
              </View>

              {isPaid ? (
                <View className="py-6 items-center">
                  <Text className="text-sm font-bold text-black mb-1">
                    Transaksi Sudah Lunas
                  </Text>
                  <Text className="text-xs font-mono text-neutral-400">
                    Metode: {orderData.paymentMethod || "CASH"}
                  </Text>
                </View>
              ) : (
                <View className="mb-4">
                  <Text className="text-[10px] font-mono uppercase text-neutral-400 mb-2">
                    Pilih Metode Bayar:
                  </Text>
                  <View className="flex-row gap-2 mb-4">
                    {(["CASH", "QRIS", "TRANSFER"] as PaymentMethod[]).map(
                      (method) => {
                        const isSelected = selectedPaymentMethod === method;
                        return (
                          <TouchableOpacity
                            key={method}
                            className={`flex-1 py-2 rounded-xl border items-center ${
                              isSelected
                                ? "bg-black border-black"
                                : "border-neutral-200"
                            }`}
                            onPress={() => setSelectedPaymentMethod(method)}
                          >
                            <Text
                              className={`text-xs font-mono font-bold ${
                                isSelected ? "text-white" : "text-black"
                              }`}
                            >
                              {method}
                            </Text>
                          </TouchableOpacity>
                        );
                      },
                    )}
                  </View>

                  <TouchableOpacity
                    className="bg-black py-3 rounded-full items-center justify-center"
                    onPress={handlePaymentSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-xs font-bold text-white tracking-wider">
                        Konfirmasi Lunas ({selectedPaymentMethod})
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                className="w-full py-4 items-center justify-center mt-1"
                onPress={() => setActiveView("MENU")}
              >
                <Text className="text-xs font-mono uppercase text-neutral-400">
                  Kembali
                </Text>
              </TouchableOpacity>
            </View>
          )}

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

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { getOrderInvoice } from "../../services/orderServices";
import type { Invoice } from "../../types/invoice";

interface InvoiceModalProps {
  visible: boolean;
  orderId: number | string | null;
  onClose: () => void;
}

export const InvoiceModal = ({
  visible,
  orderId,
  onClose,
}: InvoiceModalProps) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchInvoice = async () => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      const data = await getOrderInvoice(orderId);
      setInvoice(data);
    } catch (error: any) {
      console.log("Error fetch invoice:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal memuat data invoice.";
      Alert.alert("Gagal", errorMsg);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible && orderId) {
      fetchInvoice();
    } else {
      setInvoice(null);
    }
  }, [visible, orderId]);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/75 justify-center items-center p-4">
        <View className="w-full max-w-md bg-darkSurface border border-darkBorder rounded-3xl p-5 max-h-[90%]">
          {isLoading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#a855f7" />
              <Text className="mt-3 text-xs text-neutral-400">
                Memuat nota invoice...
              </Text>
            </View>
          ) : invoice ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="items-center border-b border-dashed border-neutral-700 pb-4 mb-4">
                <Text className="text-base font-bold text-neonPurple tracking-wide">
                  CARWASH MANAGEMENT
                </Text>
                <Text className="text-xs text-neutral-400 mt-0.5">
                  Bukti Pembayaran & Layanan
                </Text>
                <View className="bg-darkBg px-3 py-1 rounded-full border border-darkBorder mt-2">
                  <Text className="text-xs font-mono font-bold text-white">
                    {invoice.invoiceNumber}
                  </Text>
                </View>
                <Text className="text-[10px] text-neutral-500 mt-1.5">
                  Diterbitkan:{" "}
                  {formatDate(invoice.issuedAt || invoice.createdAt)}
                </Text>
              </View>

              <View className="bg-darkBg rounded-2xl p-3.5 border border-darkBorder mb-4 gap-1.5">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-400">Pelanggan:</Text>
                  <Text className="text-xs font-bold text-white">
                    {invoice.order.customer?.name || "-"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-400">No. HP:</Text>
                  <Text className="text-xs text-neutral-300">
                    {invoice.order.customer?.phone || "-"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-400">No. Plat:</Text>
                  <Text className="text-xs font-bold text-neonPurple font-mono">
                    {invoice.order.vehicle?.plateNumber || "-"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-400">Kendaraan:</Text>
                  <Text className="text-xs text-neutral-300">
                    {invoice.order.vehicle?.brand}{" "}
                    {invoice.order.vehicle?.model} (
                    {invoice.order.vehicle?.color || "-"})
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-400">
                    Petugas Cuci:
                  </Text>
                  <Text className="text-xs font-semibold text-white">
                    {invoice.order.staff?.name || "Staff Umum"}
                  </Text>
                </View>
              </View>

              <Text className="text-xs font-bold text-neutral-300 uppercase mb-2">
                Rincian Layanan:
              </Text>
              <View className="bg-darkBg rounded-2xl p-3.5 border border-darkBorder mb-4">
                {invoice.order.orderItems &&
                invoice.order.orderItems.length > 0 ? (
                  invoice.order.orderItems.map((item, idx) => (
                    <View
                      key={item.id || idx}
                      className={`flex-row justify-between items-center py-2 ${
                        idx !== (invoice.order.orderItems?.length || 0) - 1
                          ? "border-b border-neutral-800"
                          : ""
                      }`}
                    >
                      <View className="flex-1 mr-2">
                        <Text className="text-xs font-semibold text-white">
                          {item.service?.name || `Layanan #${item.serviceId}`}
                        </Text>
                        <Text className="text-[10px] text-neutral-400">
                          {item.quantity} x {formatCurrency(item.price)}
                        </Text>
                      </View>
                      <Text className="text-xs font-bold text-neutral-200 font-mono">
                        {formatCurrency(
                          item.subtotal || Number(item.price) * item.quantity,
                        )}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-xs text-neutral-500 text-center py-2">
                    Tidak ada rincian layanan
                  </Text>
                )}
              </View>

              <View className="bg-darkBg rounded-2xl p-4 border border-darkBorder mb-5">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xs text-neutral-400">
                    Metode Bayar:
                  </Text>
                  <Text className="text-xs font-bold text-white">
                    {invoice.order.paymentMethod || "CASH"}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-xs text-neutral-400">
                    Status Bayar:
                  </Text>
                  <View
                    className={`px-2.5 py-0.5 rounded-md ${
                      invoice.order.paymentStatus === "PAID"
                        ? "bg-emerald-500/20 border border-emerald-500/40"
                        : "bg-red-500/20 border border-red-500/40"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        invoice.order.paymentStatus === "PAID"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {invoice.order.paymentStatus === "PAID"
                        ? "LUNAS"
                        : "BELUM LUNAS"}
                    </Text>
                  </View>
                </View>
                <View className="pt-2.5 border-t border-neutral-800 flex-row justify-between items-center">
                  <Text className="text-sm font-bold text-white">
                    Total Pembayaran:
                  </Text>
                  <Text className="text-base font-bold text-neonPurple font-mono">
                    {formatCurrency(invoice.order.totalPrice)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="w-full py-3.5 bg-neonPurple rounded-2xl items-center justify-center"
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-xs">Tutup Nota</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default InvoiceModal;

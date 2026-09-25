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
      <View className="flex-1 bg-black/40 justify-center items-center p-6">
        <View className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 max-h-[90%]">
          {isLoading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="small" color="#000000" />
              <Text className="mt-3 text-xs text-neutral-400 font-mono tracking-wider">
                MEMUAT INVOICE...
              </Text>
            </View>
          ) : invoice ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="pb-4 mb-4 border-b border-neutral-200">
                <Text className="text-xl font-black text-black tracking-tight">
                  APEX CARWASH
                </Text>
                <Text className="text-xs text-neutral-400 font-mono mt-0.5 uppercase tracking-widest">
                  Bukti Pembayaran
                </Text>
                <Text className="text-xs font-mono font-bold text-black mt-2">
                  #{invoice.invoiceNumber}
                </Text>
                <Text className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  {formatDate(invoice.issuedAt || invoice.createdAt)}
                </Text>
              </View>

              <View className="py-2 border-b border-neutral-100 mb-4 gap-1.5">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-400">Pelanggan</Text>
                  <Text className="text-xs font-bold text-black">
                    {invoice.order.customer?.name || "-"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-400">Plat Nomor</Text>
                  <Text className="text-xs font-bold text-black font-mono">
                    {invoice.order.vehicle?.plateNumber || "-"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-400">Kendaraan</Text>
                  <Text className="text-xs text-neutral-600">
                    {invoice.order.vehicle?.brand} {invoice.order.vehicle?.model}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-400">Petugas</Text>
                  <Text className="text-xs text-black">
                    {invoice.order.staff?.name || "Staff Umum"}
                  </Text>
                </View>
              </View>

              <Text className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Rincian Layanan
              </Text>
              <View className="border-t border-neutral-100 mb-4">
                {invoice.order.orderItems && invoice.order.orderItems.length > 0 ? (
                  invoice.order.orderItems.map((item, idx) => (
                    <View
                      key={item.id || idx}
                      className="flex-row justify-between items-center py-2.5 border-b border-neutral-100"
                    >
                      <View className="flex-1 mr-2">
                        <Text className="text-xs font-bold text-black">
                          {item.service?.name || `Layanan #${item.serviceId}`}
                        </Text>
                        <Text className="text-[10px] text-neutral-400 font-mono">
                          {item.quantity} × {formatCurrency(item.price)}
                        </Text>
                      </View>
                      <Text className="text-xs font-mono font-bold text-black">
                        {formatCurrency(
                          item.subtotal || Number(item.price) * item.quantity,
                        )}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-xs text-neutral-400 font-mono py-2">
                    Tidak ada rincian.
                  </Text>
                )}
              </View>

              <View className="py-3 border-t border-neutral-200 mb-6 gap-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-neutral-400">Metode</Text>
                  <Text className="text-xs font-mono text-black">
                    {invoice.order.paymentMethod || "CASH"}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-neutral-400">Status</Text>
                  <Text className="text-xs font-mono font-bold text-black uppercase">
                    {invoice.order.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center pt-2 border-t border-neutral-100">
                  <Text className="text-sm font-black text-black">Total</Text>
                  <Text className="text-base font-black text-black font-mono">
                    {formatCurrency(invoice.order.totalPrice)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="w-full py-3 bg-black rounded-full items-center justify-center"
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text className="text-white font-bold text-xs">Tutup</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default InvoiceModal;

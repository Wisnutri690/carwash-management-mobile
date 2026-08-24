import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import type { Order, OrderStatus } from "../../types/order";

interface ReadOrderProps {
  orders: Order[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  selectedStatus: OrderStatus | "ALL";
  onSelectedStatus: (status: OrderStatus | "ALL") => void;
  onSelectedOrderAction: (order: Order) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusInfo = (status: OrderStatus) => {
  switch (status) {
    case "WAITING":
      return {
        label: "Menunggu",
        textClass: "text-amber-400",
        bgClass: "bg-amber-500/10 border-amber-500/30",
      };
    case "IN_PROGRESS":
      return {
        label: "Sedang Dicuci",
        textClass: "text-blue-400",
        bgClass: "bg-blue-500/10 border-blue-500/30",
      };
    case "COMPLETED":
      return {
        label: "Selesai",
        textClass: "text-emerald-400",
        bgClass: "bg-emerald-500/10 border-emerald-500/30",
      };
    case "CANCELLED":
      return {
        label: "Dibatalkan",
        textClass: "text-red-400",
        bgClass: "bg-red-500/10 border-red-500/30",
      };
    default:
      return {
        label: status,
        textClass: "text-neutral-400",
        bgClass: "bg-neutral-500/10 border-neutral-500/30",
      };
  }
};

export const ReadOrder = ({
  orders,
  isLoading,
  isRefreshing,
  onRefresh,
  selectedStatus,
  onSelectedStatus,
  onSelectedOrderAction,
}: ReadOrderProps) => {
  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusInfo = getStatusInfo(item.status);
    const isPaid = item.paymentStatus === "PAID";

    return (
      <View className="bg-darkSurface rounded-2xl p-4 mb-3 border border-darkBorder">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-white font-mono">
              {item.vehicle?.plateNumber || "NO PLAT"}
            </Text>
            <Text className="text-xs text-neutral-400 mt-0.5">
              {item.vehicle?.brand} {item.vehicle?.model}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View
              className={`px-2.5 py-1 rounded-lg border ${statusInfo.bgClass}`}
            >
              <Text className={`text-xs font-bold ${statusInfo.textClass}`}>
                {statusInfo.label}
              </Text>
            </View>
            <TouchableOpacity
              className="w-8 h-8 rounded-lg bg-darkBg border border-darkBorder items-center justify-center"
              onPress={() => onSelectedOrderAction(item)}
              activeOpacity={0.7}
            >
              <Text className="text-neutral-400 font-bold text-base leading-none">
                ⋮
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-[1px] bg-neutral-800 my-2.5" />
        <View className="flex-row justify-between mb-3">
          <View className="flex-1">
            <Text className="text-[10px] text-neutral-500 uppercase font-semibold">
              Pelanggan
            </Text>
            <Text
              className="text-xs font-semibold text-neutral-200 mt-0.5"
              numberOfLines={1}
            >
              {item.customer?.name || "Customer"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-neutral-500 uppercase font-semibold">
              Staff
            </Text>
            <Text
              className="text-xs font-semibold text-neutral-200 mt-0.5"
              numberOfLines={1}
            >
              {item.staff?.name || "Belum Ditugaskan"}
            </Text>
          </View>
          <View className="flex-[1.2] items-end">
            <Text className="text-[10px] text-neutral-500 uppercase font-semibold">
              Pembayaran
            </Text>
            <Text
              className={`text-[11px] font-bold mt-0.5 ${
                isPaid ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isPaid
                ? `LUNAS (${item.paymentMethod || "CASH"})`
                : "BELUM BAYAR"}
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center pt-2.5 border-t border-neutral-800">
          <Text className="text-xs text-neutral-400 font-medium">
            Total Tagihan:
          </Text>
          <Text className="text-sm font-bold text-neonPurple font-mono">
            {formatCurrency(item.totalPrice)}
          </Text>
        </View>
      </View>
    );
  };

  const statusTabs: { label: string; value: OrderStatus | "ALL" }[] = [
    { label: "Semua", value: "ALL" },
    { label: "Menunggu", value: "WAITING" },
    { label: "Sedang Dicuci", value: "IN_PROGRESS" },
    { label: "Selesai", value: "COMPLETED" },
    { label: "Dibatalkan", value: "CANCELLED" },
  ];

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-darkBg">
        <ActivityIndicator size="large" color="#a855f7" />
        <Text className="mt-3 text-xs text-neutral-400 font-medium">
          Memuat daftar transaksi order...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-darkBg">
      <View className="py-3 px-4 bg-darkSurface border-b border-darkBorder">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {statusTabs.map((tab) => {
              const isActive = selectedStatus === tab.value;
              return (
                <TouchableOpacity
                  key={tab.value}
                  className={`px-3.5 py-1.5 rounded-xl border ${
                    isActive
                      ? "bg-neonPurple/20 border-neonPurple"
                      : "bg-darkBg border-darkBorder"
                  }`}
                  onPress={() => onSelectedStatus(tab.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isActive
                        ? "text-neonPurple font-bold"
                        : "text-neutral-400"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderOrderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#a855f7"
            colors={["#a855f7"]}
          />
        }
        ListEmptyComponent={
          <View className="bg-darkSurface rounded-2xl p-6 items-center border border-darkBorder my-4">
            <Text className="text-base font-bold text-white mb-1.5">
              Belum Ada Order
            </Text>
            <Text className="text-xs text-neutral-500 text-center leading-5">
              Tidak ada transaksi order pencucian untuk status ini.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ReadOrder;

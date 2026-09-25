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

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case "WAITING":
      return "Menunggu";
    case "IN_PROGRESS":
      return "Sedang Dicuci";
    case "COMPLETED":
      return "Selesai";
    case "CANCELLED":
      return "Dibatalkan";
    default:
      return status;
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
    const isPaid = item.paymentStatus === "PAID";

    return (
      <View className="py-4 px-6 border-b border-neutral-100">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-black text-black font-mono tracking-wider">
                {item.vehicle?.plateNumber || "NO PLAT"}
              </Text>
              <Text className="text-xs text-neutral-500 font-medium">
                {item.vehicle?.brand} {item.vehicle?.model}
              </Text>
            </View>
            <Text className="text-xs text-neutral-400 mt-0.5">
              {item.customer?.name || "Customer"} • {item.staff?.name || "Staff Umum"}
            </Text>
          </View>

          <TouchableOpacity
            className="p-1"
            onPress={() => onSelectedOrderAction(item)}
            activeOpacity={0.7}
          >
            <Text className="text-neutral-500 font-bold text-base leading-none">
              •••
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-neutral-100">
          <View>
            <Text className="text-xs font-semibold text-black">
              • {getStatusText(item.status)}
            </Text>
            <Text className="text-[10px] font-mono text-neutral-400 uppercase mt-0.5">
              {isPaid ? `Lunas (${item.paymentMethod || "CASH"})` : "Belum Lunas"}
            </Text>
          </View>

          <Text className="text-sm font-black text-black font-mono">
            {formatCurrency(item.totalPrice)}
          </Text>
        </View>
      </View>
    );
  };

  const statusTabs: { label: string; value: OrderStatus | "ALL" }[] = [
    { label: "Semua", value: "ALL" },
    { label: "Menunggu", value: "WAITING" },
    { label: "Dicuci", value: "IN_PROGRESS" },
    { label: "Selesai", value: "COMPLETED" },
    { label: "Batal", value: "CANCELLED" },
  ];

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <ActivityIndicator size="small" color="#000000" />
        <Text className="mt-3 text-xs text-neutral-400 font-mono tracking-wider">
          MEMUAT DATA...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 border-b border-neutral-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-5">
            {statusTabs.map((tab) => {
              const isActive = selectedStatus === tab.value;
              return (
                <TouchableOpacity
                  key={tab.value}
                  className={`py-3 ${
                    isActive ? "border-b-2 border-black" : "opacity-40"
                  }`}
                  onPress={() => onSelectedStatus(tab.value)}
                  activeOpacity={0.7}
                >
                  <Text className="text-xs font-bold font-mono uppercase tracking-wider text-black">
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#000000"
            colors={["#000000"]}
          />
        }
        ListEmptyComponent={
          <View className="py-16 items-center px-6">
            <Text className="text-xs text-neutral-400 font-mono text-center">
              Tidak ada transaksi order untuk status ini.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ReadOrder;

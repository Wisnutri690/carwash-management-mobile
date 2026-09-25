import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { getOrders } from "../services/orderServices";
import type { Order } from "../types/order";
import { InvoiceModal } from "../components/CRUD Orders/InvoiceModal";

export const SalesScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filterRange, setFilterRange] = useState<"TODAY" | "MONTH" | "ALL">(
    "TODAY",
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState<
    number | string | null
  >(null);

  const fetchOrdersData = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.log("Error fetch sales orders:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchOrdersData();
  }, []);

  const now = new Date();
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return (
      d.getDate() === todayDate &&
      d.getMonth() === todayMonth &&
      d.getFullYear() === todayYear
    );
  };

  const isThisMonth = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return (
      d.getMonth() === todayMonth &&
      d.getFullYear() === todayYear
    );
  };

  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");

  const filteredOrders = paidOrders.filter((o) => {
    if (filterRange === "TODAY") return isToday(o.createdAt);
    if (filterRange === "MONTH") return isThisMonth(o.createdAt);
    return true;
  });

  const totalRevenue = filteredOrders.reduce(
    (sum, o) => sum + (Number(o.totalPrice) || 0),
    0,
  );

  const cashRevenue = filteredOrders
    .filter((o) => o.paymentMethod === "CASH")
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  const qrisRevenue = filteredOrders
    .filter((o) => o.paymentMethod === "QRIS")
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  const transferRevenue = filteredOrders
    .filter((o) => o.paymentMethod === "TRANSFER")
    .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  const renderHeader = () => (
    <View>
      <View className="px-6 border-b border-neutral-100 flex-row gap-6 mb-6">
        <TouchableOpacity
          className={`py-3 ${
            filterRange === "TODAY" ? "border-b-2 border-black" : "opacity-40"
          }`}
          onPress={() => setFilterRange("TODAY")}
        >
          <Text className="text-xs font-mono font-bold uppercase tracking-wider text-black">
            Hari Ini
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`py-3 ${
            filterRange === "MONTH" ? "border-b-2 border-black" : "opacity-40"
          }`}
          onPress={() => setFilterRange("MONTH")}
        >
          <Text className="text-xs font-mono font-bold uppercase tracking-wider text-black">
            Bulan Ini
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`py-3 ${
            filterRange === "ALL" ? "border-b-2 border-black" : "opacity-40"
          }`}
          onPress={() => setFilterRange("ALL")}
        >
          <Text className="text-xs font-mono font-bold uppercase tracking-wider text-black">
            Semua
          </Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 mb-8">
        <Text className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
          Total Penjualan
        </Text>
        <Text className="text-3xl font-black text-black font-mono mt-1">
          {formatCurrency(totalRevenue)}
        </Text>
        <Text className="text-xs font-mono text-neutral-400 mt-1">
          {filteredOrders.length} TRANSAKSI LUNAS
        </Text>

        <View className="border border-neutral-200 rounded-2xl p-4 mt-5 flex-row">
          <View className="flex-1 border-r border-neutral-200 pr-2">
            <Text className="text-[10px] font-mono uppercase text-neutral-400">
              Cash
            </Text>
            <Text className="text-xs font-black text-black font-mono mt-0.5" numberOfLines={1}>
              {formatCurrency(cashRevenue)}
            </Text>
          </View>
          <View className="flex-1 border-r border-neutral-200 px-2">
            <Text className="text-[10px] font-mono uppercase text-neutral-400">
              QRIS
            </Text>
            <Text className="text-xs font-black text-black font-mono mt-0.5" numberOfLines={1}>
              {formatCurrency(qrisRevenue)}
            </Text>
          </View>
          <View className="flex-1 pl-2">
            <Text className="text-[10px] font-mono uppercase text-neutral-400">
              Transfer
            </Text>
            <Text className="text-xs font-black text-black font-mono mt-0.5" numberOfLines={1}>
              {formatCurrency(transferRevenue)}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-6 pb-2 border-b border-neutral-100 flex-row justify-between items-center">
        <Text className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
          Riwayat Transaksi
        </Text>
        <Text className="text-xs font-mono text-neutral-400">
          {filteredOrders.length} ITEM
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="px-6 py-4 border-b border-neutral-100 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text className="text-black text-base font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-black text-black tracking-tight">
          Laporan Penjualan
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center p-5 bg-white">
          <ActivityIndicator size="small" color="#000000" />
          <Text className="mt-3 text-xs text-neutral-400 font-mono tracking-wider">
            MEMUAT DATA PENJUALAN...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#000000"
              colors={["#000000"]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="py-4 px-6 border-b border-neutral-100 flex-row justify-between items-center"
              activeOpacity={0.7}
              onPress={() => setSelectedInvoiceOrderId(item.id)}
            >
              <View className="flex-1 mr-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-black text-black font-mono">
                    {item.vehicle?.plateNumber || "NO PLAT"}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    {item.vehicle?.brand} {item.vehicle?.model}
                  </Text>
                </View>
                <Text className="text-xs text-neutral-400 mt-0.5">
                  {item.customer?.name || "Customer"} • {formatDate(item.createdAt)} {formatTime(item.createdAt)}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-sm font-black text-black font-mono">
                  {formatCurrency(Number(item.totalPrice) || 0)}
                </Text>
                <Text className="text-[10px] font-mono text-neutral-400 uppercase mt-0.5">
                  {item.paymentMethod || "CASH"} ›
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="py-16 items-center px-6">
              <Text className="text-xs text-neutral-400 font-mono text-center">
                Belum ada transaksi penjualan pada periode ini.
              </Text>
            </View>
          }
        />
      )}

      <InvoiceModal
        visible={selectedInvoiceOrderId !== null}
        orderId={selectedInvoiceOrderId}
        onClose={() => setSelectedInvoiceOrderId(null)}
      />
    </SafeAreaView>
  );
};

export default SalesScreen;

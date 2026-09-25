import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useAuth } from "../context/authContext";
import {
  getDashboardOrders,
  getDashboardCustomers,
  getDashboardVehicles,
} from "../services/dashboardService";
import type { Order, OrderStatus } from "../types/order";

export const DashboardScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { admin, logOut } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [vehicleCount, setVehicleCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [ordersData, customersData, vehiclesData] = await Promise.all([
        getDashboardOrders(),
        getDashboardCustomers(),
        getDashboardVehicles(),
      ]);

      setOrders(ordersData);
      setCustomerCount(customersData.length);
      setVehicleCount(vehiclesData.length);
    } catch (error: any) {
      console.log("Error dashboard:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Gagal memuat data dari Backend";
      Alert.alert("Gagal Memuat Data", errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, []);

  const handleLogout = () => {
    Alert.alert("Konfirmasi Keluar", "Yakin mau keluar dari akun Admin?", [
      { text: "Batal", style: "cancel" },
      { text: "Keluar", style: "destructive", onPress: logOut },
    ]);
  };

  const activeQueueCount = orders.filter(
    (item) => item.status === "WAITING" || item.status === "IN_PROGRESS",
  ).length;

  const now = new Date();
  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const todayRevenue = orders
    .filter((item) => item.paymentStatus === "PAID" && isToday(item.createdAt))
    .reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

  const formatCurrency = (amount: number) => {
    const validAmount = Number(amount) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(validAmount);
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "WAITING":
        return "• Menunggu";
      case "IN_PROGRESS":
        return "• Sedang Dicuci";
      case "COMPLETED":
        return "• Selesai";
      case "CANCELLED":
        return "• Dibatalkan";
      default:
        return `• ${status}`;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="flex-row justify-between items-center px-6 py-4 border-b border-neutral-100">
        <View>
          <Text className="text-xl font-black text-black tracking-tight">
            APEX
          </Text>
          <Text className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-0.5">
            {admin?.name || "Admin"}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="w-8 h-8 rounded-full border border-neutral-200 items-center justify-center"
            onPress={fetchData}
            activeOpacity={0.7}
          >
            <Text className="text-black text-sm">↻</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Keluar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center p-5 bg-white">
          <ActivityIndicator size="small" color="#000000" />
          <Text className="mt-3 text-xs text-neutral-400 font-mono tracking-wider">
            MEMUAT DATA...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#000000"
              colors={["#000000"]}
            />
          }
        >
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity
              className="flex-1 bg-black rounded-xl py-3 px-4 items-center justify-center"
              onPress={() => navigation.navigate("CustomerVehicle")}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-xs tracking-wide">
                Pelanggan & Unit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 border border-black rounded-xl py-3 px-4 items-center justify-center"
              onPress={() => navigation.navigate("OrderScreen")}
              activeOpacity={0.85}
            >
              <Text className="text-black font-bold text-xs tracking-wide">
                Transaksi Order
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-8">
            <Text className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mb-3">
              Ringkasan Operasional
            </Text>

            <View className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
              <View className="flex-row border-b border-neutral-200">
                <TouchableOpacity
                  className="flex-1 p-4 border-r border-neutral-200"
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("OrderScreen")}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Antrean Aktif
                    </Text>
                    <Text className="text-xs text-neutral-400">›</Text>
                  </View>
                  <Text className="text-3xl font-black text-black mt-1">
                    {activeQueueCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 p-4"
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("Sales")}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Penjualan Hari Ini
                    </Text>
                    <Text className="text-xs text-neutral-400">›</Text>
                  </View>
                  <Text className="text-xl font-black text-black mt-2 font-mono" numberOfLines={1}>
                    {formatCurrency(todayRevenue)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row">
                <TouchableOpacity
                  className="flex-1 p-4 border-r border-neutral-200"
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("CustomerVehicle")}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Pelanggan
                    </Text>
                    <Text className="text-xs text-neutral-400">›</Text>
                  </View>
                  <Text className="text-3xl font-black text-black mt-1">
                    {customerCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 p-4"
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("CustomerVehicle")}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Kendaraan
                    </Text>
                    <Text className="text-xs text-neutral-400">›</Text>
                  </View>
                  <Text className="text-3xl font-black text-black mt-1">
                    {vehicleCount}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
                Order Terkini
              </Text>
              <Text className="text-xs font-mono text-neutral-400">
                {orders.length} TOTAL
              </Text>
            </View>

            {orders.length === 0 ? (
              <View className="py-10 items-center border border-dashed border-neutral-200 rounded-2xl">
                <Text className="text-xs text-neutral-400 font-mono">
                  Belum ada transaksi order hari ini.
                </Text>
              </View>
            ) : (
              <View className="border-t border-neutral-100">
                {orders.slice(0, 5).map((orderItem) => {
                  const isPaid = orderItem.paymentStatus === "PAID";

                  return (
                    <TouchableOpacity
                      key={orderItem.id}
                      className="py-4 border-b border-neutral-100 flex-row justify-between items-center"
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate("OrderScreen")}
                    >
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base font-black text-black font-mono tracking-wider">
                            {orderItem.vehicle?.plateNumber || "NO PLAT"}
                          </Text>
                          <Text className="text-xs text-neutral-500 font-medium">
                            {orderItem.vehicle?.brand} {orderItem.vehicle?.model}
                          </Text>
                        </View>
                        <Text className="text-xs text-neutral-400 mt-1">
                          {orderItem.customer?.name || "-"}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="text-xs font-semibold text-neutral-900">
                          {getStatusLabel(orderItem.status)}
                        </Text>
                        <Text className="text-xs font-bold text-black font-mono mt-1">
                          {formatCurrency(Number(orderItem.totalPrice) || 0)}
                        </Text>
                        <Text className="text-[10px] font-mono text-neutral-400 uppercase mt-0.5">
                          {isPaid ? "Lunas" : "Belum Bayar"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DashboardScreen;

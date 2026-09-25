import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { getOrders } from "../services/orderServices";
import type { Order, OrderStatus } from "../types/order";
import { ReadOrder } from "../components/CRUD Orders/ReadOrder";
import { UpdateOrder } from "../components/CRUD Orders/UpdateOrder";
import { CreateOrder } from "../components/CRUD Orders/CreateOrder";

const ITEMS_PER_PAGE = 5;

export const OrderScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">(
    "ALL",
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [selectedOrderAction, setSelectedOrderAction] = useState<Order | null>(
    null,
  );

  const fetchData = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error: any) {
      console.log("Error fetch orders:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal memuat data order.";
      Alert.alert("Gagal Memuat Data", errorMsg);
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

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus =
      selectedStatus === "ALL" || ord.status === selectedStatus;
    const query = searchQuery.toLowerCase().trim();
    const plateNumber = ord.vehicle?.plateNumber?.toLowerCase() || "";
    const customerName = ord.customer?.name?.toLowerCase() || "";
    const matchesSearch =
      !query || plateNumber.includes(query) || customerName.includes(query);
    return matchesStatus && matchesSearch;
  });

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleStatusChange = (status: OrderStatus | "ALL") => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="px-6 py-4 border-b border-neutral-100 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text className="text-black text-base font-bold">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-black text-black tracking-tight">
            Transaksi Order
          </Text>
        </View>

        <TouchableOpacity
          className="bg-black px-4 py-2 rounded-full items-center justify-center"
          onPress={() => setIsCreateModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-xs">
            + Tambah
          </Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 py-2 border-b border-neutral-100 flex-row items-center justify-between">
        <TextInput
          className="h-10 text-black text-sm px-0 flex-1 mr-2"
          placeholder="Cari plat nomor atau nama pelanggan..."
          placeholderTextColor="#a3a3a3"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            className="w-6 h-6 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-neutral-400 font-mono text-xs">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 bg-white">
        <ReadOrder
          orders={paginatedOrders}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          selectedStatus={selectedStatus}
          onSelectedStatus={handleStatusChange}
          onSelectedOrderAction={(order) => setSelectedOrderAction(order)}
        />
      </View>

      {filteredOrders.length > 0 && (
        <View className="flex-row justify-between items-center px-6 py-3 border-t border-neutral-100">
          <TouchableOpacity
            className={`py-1.5 ${currentPage === 1 ? "opacity-30" : "opacity-100"}`}
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            activeOpacity={0.7}
          >
            <Text className="text-black font-mono text-xs uppercase">Sebelumnya</Text>
          </TouchableOpacity>

          <Text className="text-xs font-mono text-neutral-400">
            {currentPage} / {totalPages}
          </Text>

          <TouchableOpacity
            className={`py-1.5 ${currentPage === totalPages ? "opacity-30" : "opacity-100"}`}
            onPress={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            activeOpacity={0.7}
          >
            <Text className="text-black font-mono text-xs uppercase">Selanjutnya</Text>
          </TouchableOpacity>
        </View>
      )}

      <CreateOrder
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={fetchData}
      />

      <UpdateOrder
        visible={selectedOrderAction !== null}
        orderData={selectedOrderAction}
        onClose={() => setSelectedOrderAction(null)}
        onSuccess={fetchData}
      />
    </SafeAreaView>
  );
};

export default OrderScreen;

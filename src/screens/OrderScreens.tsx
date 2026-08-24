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

export const OrderScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">(
    "ALL",
  );
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
  };

  return (
    <SafeAreaView className="flex-1 bg-darkBg" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      <View className="px-5 pt-3 pb-4 bg-darkSurface border-b border-darkBorder">
        <View className="flex-row justify-start mb-3">
          <TouchableOpacity
            className="px-3.5 py-2 bg-darkBg border border-darkBorder rounded-xl items-center justify-center"
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text className="text-neonPurple font-bold text-xs">
              Kembali
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-white">
          Order Pencucian
        </Text>
      </View>

      <View className="p-4 bg-darkBg border-b border-darkBorder flex-row items-center">
        <TextInput
          className="flex-1 h-11 bg-darkSurface border border-darkBorder rounded-xl px-4 text-white text-sm mr-3"
          placeholder="Cari no. plat atau pelanggan..."
          placeholderTextColor="#737373"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <TouchableOpacity
          className="h-11 bg-purple-900 px-4 rounded-xl items-center justify-center"
          onPress={() => setIsCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-xs px-1 text-center">
            + Tambah
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <ReadOrder
          orders={filteredOrders}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          selectedStatus={selectedStatus}
          onSelectedStatus={setSelectedStatus}
          onSelectedOrderAction={(order) => setSelectedOrderAction(order)}
        />
      </View>

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

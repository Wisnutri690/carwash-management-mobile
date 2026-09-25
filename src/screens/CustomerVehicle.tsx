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
import { getCustomer } from "../services/customerServices";
import { getVehicle } from "../services/vehicleServices";
import type { Vehicle } from "../types/vehicle";
import type { Customer } from "../types/customer";
import { ReadCustomerVehicle } from "../components/CRUD CustomerVehicle/ReadCustomerVehicle";
import { CreateCustomerVehicle } from "../components/CRUD CustomerVehicle/CreateCustomerVehicle";
import { UpdateCustomerVehicle } from "../components/CRUD CustomerVehicle/UpdateCustomerVehicle";
import { DeleteCustomerVehicle } from "../components/CRUD CustomerVehicle/DeleteCustomerVehicle";

const ITEMS_PER_PAGE = 5;

export const CustomerVehicleScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCreateModalVisible, setIsCreateModalVisible] =
    useState<boolean>(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] =
    useState<boolean>(false);
  const [updateMode, setUpdateMode] = useState<"CUSTOMER" | "VEHICLE">(
    "CUSTOMER",
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<"CUSTOMER" | "VEHICLE">(
    "CUSTOMER",
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleOpenEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedVehicle(null);
    setUpdateMode("CUSTOMER");
    setIsUpdateModalVisible(true);
  };

  const handleOpenEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedCustomer(null);
    setUpdateMode("VEHICLE");
    setIsUpdateModalVisible(true);
  };

  const handleOpenDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setVehicleToDelete(null);
    setDeleteMode("CUSTOMER");
    setIsDeleteModalVisible(true);
  };

  const handleOpenDeleteVehicle = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setCustomerToDelete(null);
    setDeleteMode("VEHICLE");
    setIsDeleteModalVisible(true);
  };

  const fetchData = async () => {
    try {
      const [customerList, vehicleList] = await Promise.all([
        getCustomer(),
        getVehicle(),
      ]);
      setCustomers(customerList);
      setVehicles(vehicleList);
    } catch (error: any) {
      console.log("Error fetch customer/vehicle:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal memuat data Customer/Vehicle.";
      Alert.alert("Gagal memuat Data", errorMsg);
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

  const filteredCustomers = customers.filter((cust) => {
    const query = searchQuery.toLowerCase();
    return (
      cust.name.toLowerCase().includes(query) ||
      cust.phone.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(
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
            Pelanggan & Unit
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
          placeholder="Cari nama atau nomor telepon..."
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
        <ReadCustomerVehicle
          customers={paginatedCustomers}
          vehicles={vehicles}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          searchQuery={searchQuery}
          onEditCustomer={handleOpenEditCustomer}
          onEditVehicle={handleOpenEditVehicle}
          onDeleteCustomer={handleOpenDeleteCustomer}
          onDeleteVehicle={handleOpenDeleteVehicle}
        />
      </View>

      {filteredCustomers.length > 0 && (
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

      <CreateCustomerVehicle
        visible={isCreateModalVisible}
        customer={customers}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={fetchData}
      />

      <UpdateCustomerVehicle
        visible={isUpdateModalVisible}
        mode={updateMode}
        customerData={selectedCustomer}
        vehicleData={selectedVehicle}
        onClose={() => setIsUpdateModalVisible(false)}
        onSuccess={fetchData}
      />

      <DeleteCustomerVehicle
        visible={isDeleteModalVisible}
        mode={deleteMode}
        customerData={customerToDelete}
        vehicleData={vehicleToDelete}
        onClose={() => setIsDeleteModalVisible(false)}
        onSuccess={fetchData}
      />
    </SafeAreaView>
  );
};

export default CustomerVehicleScreen;

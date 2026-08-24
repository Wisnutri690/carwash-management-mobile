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
import { ReadCustomerVehicle } from "../components/CRUD/ReadCustomerVehicle";
import { CreateCustomerVehicle } from "../components/CRUD/CreateCustomerVehicle";
import { UpdateCustomerVehicle } from "../components/CRUD/UpdateCustomerVehicle";
import { DeleteCustomerVehicle } from "../components/CRUD/DeleteCustomerVehicle";

const ITEMS_PER_PAGE = 3;

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
    <SafeAreaView className="flex-1 bg-darkBg" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      <View className="px-5 pt-3 pb-4 bg-darkSurface border-b border-darkBorder">
        <View className="flex-row justify-start mb-3">
          <TouchableOpacity
            className="px-3.5 py-2 bg-darkBg border border-darkBorder rounded-xl items-center justify-center"
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text className="text-neonPurple font-bold text-xs tracking-wide">
              Kembali
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-white tracking-wide">
          Customer & Vehicle
        </Text>
      </View>

      <View className="p-4 bg-darkBg border-b border-darkBorder flex-row items-center">
        <TextInput
          className="flex-1 h-11 bg-darkSurface border border-darkBorder rounded-xl px-4 text-white text-sm mr-3"
          placeholder="Cari nama atau no. telepon..."
          placeholderTextColor="#737373"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <TouchableOpacity
          className="h-11 bg-purple-900 px-4 rounded-xl items-center justify-center"
          onPress={() => setIsCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-xs tracking-wide">
            + Tambah
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
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
        <View className="flex-row justify-between items-center px-5 py-3.5 bg-darkSurface border-t border-darkBorder">
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl bg-darkBg border border-darkBorder ${currentPage === 1 ? "opacity-40" : "opacity-100"}`}
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-xs">Sebelumnya</Text>
          </TouchableOpacity>

          <Text className="text-xs font-semibold text-neutral-400">
            <Text className="text-neonPurple font-bold">{currentPage}</Text>{" "}
            dari <Text className="text-white font-bold">{totalPages}</Text>
          </Text>

          <TouchableOpacity
            className={`px-4 py-2 rounded-xl bg-darkBg border border-darkBorder ${currentPage === totalPages ? "opacity-40" : "opacity-100"}`}
            onPress={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-xs">Selanjutnya</Text>
          </TouchableOpacity>
        </View>
      )}

      <CreateCustomerVehicle
        visible={isCreateModalVisible}
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

import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import type { Customer } from "../../types/customer";
import type { Vehicle } from "../../types/vehicle";

interface ReadCustomerVehicleProps {
  customers: Customer[];
  vehicles: Vehicle[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  searchQuery: string;
  onEditCustomer: (customer: Customer) => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteCustomer: (customer: Customer) => void;
  onDeleteVehicle: (vehicle: Vehicle) => void;
}

type ActionStep =
  | { step: "CHOICE"; customer: Customer }
  | { step: "CUSTOMER"; customer: Customer }
  | { step: "VEHICLE_SELECT"; customer: Customer }
  | { step: "VEHICLE"; vehicle: Vehicle; customer: Customer }
  | null;

export const ReadCustomerVehicle = ({
  customers,
  vehicles,
  isLoading,
  isRefreshing,
  onRefresh,
  searchQuery,
  onEditCustomer,
  onEditVehicle,
  onDeleteCustomer,
  onDeleteVehicle,
}: ReadCustomerVehicleProps) => {
  const [actionStep, setActionStep] = useState<ActionStep>(null);

  const getCustomerVehicles = (cust: Customer) => {
    return vehicles.filter((v) => String(v.customerId) === String(cust.id));
  };

  const renderCustomerRow = ({ item: cust }: { item: Customer }) => {
    const customerVehicles = getCustomerVehicles(cust);

    return (
      <View className="py-4 px-6 border-b border-neutral-100">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-base font-black text-black">{cust.name}</Text>
            <Text className="text-xs text-neutral-400 font-mono mt-0.5">
              {cust.phone}
            </Text>
            {cust.address && (
              <Text className="text-xs text-neutral-400 mt-0.5" numberOfLines={1}>
                {cust.address}
              </Text>
            )}
          </View>

          <View className="flex-row items-center gap-3">
            <Text className="text-xs font-mono text-neutral-400">
              {customerVehicles.length} UNIT
            </Text>

            <TouchableOpacity
              className="p-1"
              onPress={() => setActionStep({ step: "CHOICE", customer: cust })}
              activeOpacity={0.7}
            >
              <Text className="text-neutral-500 font-bold text-base leading-none">
                •••
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {customerVehicles.length > 0 && (
          <View className="mt-2 pt-2 border-t border-neutral-100 gap-1.5">
            {customerVehicles.map((vehicle) => (
              <View
                key={vehicle.id}
                className="flex-row items-center justify-between py-1"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-bold text-black font-mono">
                    {vehicle.plateNumber}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    {vehicle.brand} {vehicle.model}
                  </Text>
                </View>
                {vehicle.color && (
                  <Text className="text-[11px] text-neutral-400">
                    {vehicle.color}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

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
      <FlatList
        data={customers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCustomerRow}
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
              {searchQuery
                ? "Pelanggan tidak ditemukan."
                : "Belum ada data pelanggan."}
            </Text>
          </View>
        }
      />

      <Modal
        visible={actionStep !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActionStep(null)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setActionStep(null)}
        >
          <Pressable
            className="bg-white border-t border-neutral-200 rounded-t-3xl p-6 max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            {actionStep?.step === "CHOICE" && (
              <View>
                <View className="items-center mb-5">
                  <View className="w-8 h-1 bg-neutral-300 rounded-full mb-3" />
                  <Text className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
                    Kelola
                  </Text>
                  <Text className="text-lg font-black text-black mt-0.5">
                    {actionStep.customer.name}
                  </Text>
                </View>

                <TouchableOpacity
                  className="py-4 border-b border-neutral-100 flex-row items-center justify-between"
                  onPress={() =>
                    setActionStep({
                      step: "CUSTOMER",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <Text className="text-sm font-bold text-black">
                    Kelola Data Pelanggan
                  </Text>
                  <Text className="text-neutral-400 text-lg">›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-4 border-b border-neutral-100 flex-row items-center justify-between"
                  onPress={() =>
                    setActionStep({
                      step: "VEHICLE_SELECT",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <View>
                    <Text className="text-sm font-bold text-black">
                      Kelola Unit Kendaraan
                    </Text>
                    <Text className="text-xs text-neutral-400 font-mono mt-0.5">
                      {getCustomerVehicles(actionStep.customer).length} Unit Terdaftar
                    </Text>
                  </View>
                  <Text className="text-neutral-400 text-lg">›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-full py-4 items-center justify-center mt-2"
                  onPress={() => setActionStep(null)}
                >
                  <Text className="text-xs font-mono uppercase text-neutral-400">
                    Batal
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {actionStep?.step === "CUSTOMER" && (
              <View>
                <View className="items-center mb-5">
                  <View className="w-8 h-1 bg-neutral-300 rounded-full mb-3" />
                  <Text className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
                    Pelanggan
                  </Text>
                  <Text className="text-lg font-black text-black mt-0.5">
                    {actionStep.customer.name}
                  </Text>
                </View>

                <TouchableOpacity
                  className="py-4 border-b border-neutral-100"
                  onPress={() => {
                    const cust = actionStep.customer;
                    setActionStep(null);
                    onEditCustomer(cust);
                  }}
                >
                  <Text className="text-sm font-bold text-black text-center">
                    Edit Data Pelanggan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-4 border-b border-neutral-100"
                  onPress={() => {
                    const cust = actionStep.customer;
                    setActionStep(null);
                    onDeleteCustomer(cust);
                  }}
                >
                  <Text className="text-sm font-bold text-red-600 text-center">
                    Hapus Pelanggan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-full py-4 items-center justify-center mt-2"
                  onPress={() =>
                    setActionStep({
                      step: "CHOICE",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <Text className="text-xs font-mono uppercase text-neutral-400">
                    Kembali
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {actionStep?.step === "VEHICLE_SELECT" && (
              <View>
                <View className="items-center mb-5">
                  <View className="w-8 h-1 bg-neutral-300 rounded-full mb-3" />
                  <Text className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
                    Pilih Kendaraan
                  </Text>
                  <Text className="text-lg font-black text-black mt-0.5">
                    {actionStep.customer.name}
                  </Text>
                </View>

                {getCustomerVehicles(actionStep.customer).length === 0 ? (
                  <View className="py-6 items-center">
                    <Text className="text-xs text-neutral-400 font-mono">
                      Belum ada unit kendaraan terdaftar.
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    className="max-h-60"
                    showsVerticalScrollIndicator={false}
                  >
                    {getCustomerVehicles(actionStep.customer).map((veh) => (
                      <TouchableOpacity
                        key={veh.id}
                        className="py-3 border-b border-neutral-100 flex-row justify-between items-center"
                        onPress={() =>
                          setActionStep({
                            step: "VEHICLE",
                            vehicle: veh,
                            customer: actionStep.customer,
                          })
                        }
                      >
                        <View>
                          <Text className="text-sm font-bold text-black font-mono">
                            {veh.plateNumber}
                          </Text>
                          <Text className="text-xs text-neutral-400 mt-0.5">
                            {veh.brand} {veh.model} {veh.color ? `(${veh.color})` : ""}
                          </Text>
                        </View>
                        <Text className="text-xs font-mono text-neutral-400 uppercase">
                          Pilih ›
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity
                  className="w-full py-4 items-center justify-center mt-2"
                  onPress={() =>
                    setActionStep({
                      step: "CHOICE",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <Text className="text-xs font-mono uppercase text-neutral-400">
                    Kembali
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {actionStep?.step === "VEHICLE" && (
              <View>
                <View className="items-center mb-5">
                  <View className="w-8 h-1 bg-neutral-300 rounded-full mb-3" />
                  <Text className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
                    Aksi Kendaraan
                  </Text>
                  <Text className="text-base font-black text-black font-mono mt-0.5">
                    {actionStep.vehicle.plateNumber}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5">
                    {actionStep.vehicle.brand} {actionStep.vehicle.model}
                  </Text>
                </View>

                <TouchableOpacity
                  className="py-4 border-b border-neutral-100"
                  onPress={() => {
                    const veh = actionStep.vehicle;
                    setActionStep(null);
                    onEditVehicle(veh);
                  }}
                >
                  <Text className="text-sm font-bold text-black text-center">
                    Edit Kendaraan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-4 border-b border-neutral-100"
                  onPress={() => {
                    const veh = actionStep.vehicle;
                    setActionStep(null);
                    onDeleteVehicle(veh);
                  }}
                >
                  <Text className="text-sm font-bold text-red-600 text-center">
                    Hapus Kendaraan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-full py-4 items-center justify-center mt-2"
                  onPress={() =>
                    setActionStep({
                      step: "VEHICLE_SELECT",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <Text className="text-xs font-mono uppercase text-neutral-400">
                    Kembali
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ReadCustomerVehicle;

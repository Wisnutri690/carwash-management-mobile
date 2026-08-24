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

  const renderVehicleItem = (vehicle: Vehicle) => (
    <View
      key={vehicle.id}
      className="bg-darkBg rounded-xl p-3 mb-2 border border-darkBorder flex-row justify-between items-center"
    >
      <View className="flex-1">
        <Text className="text-sm font-bold text-white font-mono tracking-wider">
          {vehicle.plateNumber}
        </Text>
        <Text className="text-xs text-neutral-400 mt-0.5">
          {vehicle.brand} {vehicle.model}{" "}
          {vehicle.color ? "(" + vehicle.color + ")" : ""}
        </Text>
      </View>
    </View>
  );

  const renderCustomerCard = ({ item: cust }: { item: Customer }) => {
    const customerVehicles = vehicles.filter(
      (v) => String(v.customerId) === String(cust.id),
    );

    return (
      <View className="bg-darkSurface rounded-2xl p-4 mb-3 border border-darkBorder">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-white">{cust.name}</Text>
            <Text className="text-xs text-neonPurple mt-0.5 font-medium">
              {cust.phone}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="bg-neonPurple/15 px-2.5 py-1 rounded-lg border border-neonPurple/30">
              <Text className="text-xs text-neonPurple font-bold">
                {customerVehicles.length} Unit
              </Text>
            </View>

            <TouchableOpacity
              className="w-8 h-8 rounded-lg bg-darkBg border border-darkBorder items-center justify-center"
              onPress={() => setActionStep({ step: "CHOICE", customer: cust })}
              activeOpacity={0.7}
            >
              <Text className="text-neutral-400 font-bold text-base leading-none">
                ⋮
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {cust.address && (
          <Text className="text-xs text-neutral-400 mb-3" numberOfLines={1}>
            {cust.address}
          </Text>
        )}

        <View className="h-[1px] bg-neutral-800 my-2" />

        <Text className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Unit Kendaraan Terdaftar:
        </Text>

        {customerVehicles.length === 0 ? (
          <View className="bg-darkBg rounded-xl p-3 border border-dashed border-neutral-800 items-center">
            <Text className="text-xs text-neutral-500">
              Belum ada unit kendaraan terdaftar
            </Text>
          </View>
        ) : (
          customerVehicles.map(renderVehicleItem)
        )}
      </View>
    );
  };

  const getCustomerVehicles = (cust: Customer) => {
    return vehicles.filter((v) => String(v.customerId) === String(cust.id));
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-darkBg">
        <ActivityIndicator size="large" color="#a855f7" />
        <Text className="mt-3 text-xs text-neutral-400 font-medium">
          Memuat data pelanggan & unit...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={customers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCustomerCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
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
              {searchQuery
                ? "Pelanggan Tidak Ditemukan"
                : "Belum Ada Pelanggan"}
            </Text>
            <Text className="text-xs text-neutral-500 text-center leading-5">
              {searchQuery
                ? "Coba gunakan kata kunci pencarian yang lain."
                : "Data pelanggan dari backend masih kosong."}
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
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setActionStep(null)}
        >
          <Pressable
            className="bg-darkSurface border-t border-darkBorder rounded-t-3xl p-5 max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            {actionStep?.step === "CHOICE" && (
              <View>
                <View className="items-center mb-4">
                  <View className="w-10 h-1 bg-neutral-700 rounded-full mb-3" />
                  <Text className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
                    Pilih Kategori Aksi
                  </Text>
                  <Text className="text-base font-bold text-white mt-0.5">
                    {actionStep.customer.name}
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-darkBg border border-darkBorder rounded-xl p-4 mb-3 flex-row items-center justify-between"
                  onPress={() =>
                    setActionStep({
                      step: "CUSTOMER",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <View className="flex-row items-center space-x-3">
                    <View>
                      <Text className="text-sm font-bold text-white">
                        Kelola Pelanggan
                      </Text>
                    </View>
                  </View>
                  <Text className="text-neutral-500 font-bold text-lg">›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-darkBg border border-darkBorder rounded-xl p-4 mb-3 flex-row items-center justify-between"
                  onPress={() =>
                    setActionStep({
                      step: "VEHICLE_SELECT",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <View className="flex-row items-center space-x-3">
                    <View>
                      <Text className="text-sm font-bold text-white">
                        Kelola Kendaraan
                      </Text>
                      <Text className="text-xs text-neonPurple font-medium">
                        {getCustomerVehicles(actionStep.customer).length} Unit
                        Terdaftar
                      </Text>
                    </View>
                  </View>
                  <Text className="text-neutral-500 font-bold text-lg">›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="p-3 items-center"
                  onPress={() => setActionStep(null)}
                >
                  <Text className="text-xs text-neutral-400 font-medium">
                    Batal
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {actionStep?.step === "CUSTOMER" && (
              <View>
                <View className="items-center mb-4">
                  <View className="w-10 h-1 bg-neutral-700 rounded-full mb-3" />
                  <Text className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
                    Aksi Pelanggan
                  </Text>
                  <Text className="text-base font-bold text-white mt-0.5">
                    {actionStep.customer.name}
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-darkBg border border-darkBorder rounded-xl p-3.5 mb-2.5 flex-row items-center justify-center"
                  onPress={() => {
                    const cust = actionStep.customer;
                    setActionStep(null);
                    onEditCustomer(cust);
                  }}
                >
                  <Text className="text-sm font-semibold text-white">
                    Edit Pelanggan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 mb-3 flex-row items-center justify-center"
                  onPress={() => {
                    const cust = actionStep.customer;
                    setActionStep(null);
                    onDeleteCustomer(cust);
                  }}
                >
                  <Text className="text-sm font-semibold text-red-400">
                    Hapus Pelanggan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="p-3 items-center"
                  onPress={() =>
                    setActionStep({
                      step: "CHOICE",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <Text className="text-xs text-neonPurple font-medium">
                    Kembali
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {actionStep?.step === "VEHICLE_SELECT" && (
              <View>
                <View className="items-center mb-4">
                  <View className="w-10 h-1 bg-neutral-700 rounded-full mb-3" />
                  <Text className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
                    Pilih Unit Kendaraan
                  </Text>
                  <Text className="text-base font-bold text-white mt-0.5">
                    {actionStep.customer.name}
                  </Text>
                </View>

                {getCustomerVehicles(actionStep.customer).length === 0 ? (
                  <View className="bg-darkBg rounded-xl p-4 border border-dashed border-neutral-800 items-center mb-4">
                    <Text className="text-xs text-neutral-500">
                      Belum ada unit kendaraan terdaftar untuk pelanggan ini.
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    className="max-h-60 mb-2"
                    showsVerticalScrollIndicator={false}
                  >
                    {getCustomerVehicles(actionStep.customer).map((veh) => (
                      <TouchableOpacity
                        key={veh.id}
                        className="bg-darkBg border border-darkBorder rounded-xl p-3 mb-2 flex-row justify-between items-center"
                        onPress={() =>
                          setActionStep({
                            step: "VEHICLE",
                            vehicle: veh,
                            customer: actionStep.customer,
                          })
                        }
                      >
                        <View>
                          <Text className="text-sm font-bold text-white font-mono tracking-wider">
                            {veh.plateNumber}
                          </Text>
                          <Text className="text-xs text-neutral-400 mt-0.5">
                            {veh.brand} {veh.model}{" "}
                            {veh.color ? "(" + veh.color + ")" : ""}
                          </Text>
                        </View>
                        <Text className="text-xs text-neonPurple font-semibold">
                          Pilih ›
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity
                  className="p-3 items-center"
                  onPress={() =>
                    setActionStep({
                      step: "CHOICE",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <Text className="text-xs text-neonPurple font-medium">
                    Kembali
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {actionStep?.step === "VEHICLE" && (
              <View>
                <View className="items-center mb-4">
                  <View className="w-10 h-1 bg-neutral-700 rounded-full mb-3" />
                  <Text className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">
                    Aksi Kendaraan
                  </Text>
                  <Text className="text-base font-bold text-white font-mono tracking-wider mt-0.5">
                    {actionStep.vehicle.plateNumber}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5">
                    {actionStep.vehicle.brand} {actionStep.vehicle.model}
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-darkBg border border-darkBorder rounded-xl p-3.5 mb-2.5 flex-row items-center justify-center"
                  onPress={() => {
                    const veh = actionStep.vehicle;
                    setActionStep(null);
                    onEditVehicle(veh);
                  }}
                >
                  <Text className="text-sm font-semibold text-white">
                    Edit Kendaraan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 mb-3 flex-row items-center justify-center"
                  onPress={() => {
                    const veh = actionStep.vehicle;
                    setActionStep(null);
                    onDeleteVehicle(veh);
                  }}
                >
                  <Text className="text-sm font-semibold text-red-400">
                    Hapus Kendaraan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="p-3 items-center"
                  onPress={() =>
                    setActionStep({
                      step: "VEHICLE_SELECT",
                      customer: actionStep.customer,
                    })
                  }
                >
                  <Text className="text-xs text-neonPurple font-medium">
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

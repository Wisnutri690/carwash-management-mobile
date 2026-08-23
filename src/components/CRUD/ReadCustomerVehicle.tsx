import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import type { Customer } from '../../types/customer';
import type { Vehicle } from '../../types/vehicle';

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
    onDeleteVehicle: (vehicle: Vehicle) => void
}

export const ReadCustomerVehicle = ({ customers, vehicles, isLoading, isRefreshing, onRefresh, searchQuery, onEditCustomer, onEditVehicle, onDeleteCustomer,
    onDeleteVehicle, }: ReadCustomerVehicleProps) => {

    const renderVehicleItem = (vehicle: Vehicle) => (
        <View
            key={vehicle.id}
            className="bg-darkBg rounded-xl p-3 mb-2 border border-darkBorder flex-row justify-between items-center" >
            <View>
                <Text className="text-sm font-bold text-white font-mono tracking-wider">
                    {vehicle.plateNumber}
                </Text>
                <Text className="text-xs text-neutral-400 mt-0.5">
                    {vehicle.brand} {vehicle.model} {vehicle.color ? '(' + vehicle.color + ')' : ''}
                </Text>
            </View>
            <TouchableOpacity
                className="px-3 py-1.5 rounded-lg bg-darkSurface border border-darkBorder"
                onPress={() => onEditVehicle(vehicle)}
                activeOpacity={0.7}>
                <Text className="text-xs text-neutral-300 font-semibold">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30"
                onPress={() => onDeleteVehicle(vehicle)}
                activeOpacity={0.7}>
                <Text className="text-xs text-red-400 font-semibold">Hapus</Text>
            </TouchableOpacity>
        </View>

    );

    const renderCustomerCard = ({ item: cust }: { item: Customer }) => {
        const customerVehicles = vehicles.filter(
            (v) => String(v.customerId) === String(cust.id)
        );

        return (
            <View className="bg-darkSurface rounded-2xl p-4 mb-3 border border-darkBorder">
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-2">
                        <Text className="text-base font-bold text-white">{cust.name}</Text>
                        <Text className="text-xs text-neonPurple mt-0.5 font-medium">{cust.phone}</Text>
                    </View>

                    <View className="flex-row items-center space-x-2">
                        <TouchableOpacity
                            className="px-2.5 py-1 rounded-lg bg-darkBg border border-darkBorder mr-2"
                            onPress={() => onEditCustomer(cust)}
                            activeOpacity={0.7}>
                            <Text className="text-xs text-neonPurple font-bold">Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 mr-2"
                            onPress={() => onDeleteCustomer(cust)}
                            activeOpacity={0.7}>
                            <Text className="text-xs text-red-400 font-bold">Hapus</Text>
                        </TouchableOpacity>

                        <View className="bg-neonPurple/15 px-2.5 py-1 rounded-lg border border-neonPurple/30">
                            <Text className="text-xs text-neonPurple font-bold">
                                {customerVehicles.length} Unit
                            </Text>
                        </View>
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
                    colors={['#a855f7']} />
            }
            ListEmptyComponent={
                <View className="bg-darkSurface rounded-2xl p-6 items-center border border-darkBorder my-4">
                    <Text className="text-base font-bold text-white mb-1.5">
                        {searchQuery ? 'Pelanggan Tidak Ditemukan' : 'Belum Ada Pelanggan'}
                    </Text>
                    <Text className="text-xs text-neutral-500 text-center leading-5">
                        {searchQuery
                            ? 'Coba gunakan kata kunci pencarian yang lain.'
                            : 'Data pelanggan dari backend masih kosong.'}
                    </Text>
                </View>
            } />
    );
};

export default ReadCustomerVehicle;

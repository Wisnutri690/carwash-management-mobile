import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, StatusBar, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/authContext';
import { getDashboardOrders, getDashboardCustomers, getDashboardVehicles, } from '../services/dashboardService';
import type { Order, OrderStatus } from '../types/order';

export const DashboardScreen = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
            console.log('Error dashboard:', error);
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Gagal memuat data dari Backend';
            Alert.alert('Gagal Memuat Data', errorMessage);
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
        Alert.alert(
            'Konfirmasi LogOut',
            'Yakin mau LogOut dari akun Admin?',
            [
                { text: 'Ga Jadi', style: 'cancel' },
                { text: 'Yakin', style: 'destructive', onPress: logOut },
            ]
        );
    };

    const activeQueueCount = orders.filter(
        (item) => item.status === 'WAITING' || item.status === 'IN_PROGRESS'
    ).length;

    const totalIncome = orders
        .filter((item) => item.paymentStatus === 'PAID')
        .reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

    const formatCurrency = (amount: number) => {
        const validAmount = Number(amount) || 0;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(validAmount);
    };

    const getStatusInfo = (status: OrderStatus) => {
        switch (status) {
            case 'WAITING':
                return { label: 'Antrean', colorClass: 'text-amber-400' };
            case 'IN_PROGRESS':
                return { label: 'Sedang Dicuci', colorClass: 'text-blue-400' };
            case 'COMPLETED':
                return { label: 'Selesai', colorClass: 'text-emerald-400' };
            case 'CANCELLED':
                return { label: 'Dibatalkan', colorClass: 'text-red-400' };
            default:
                return { label: status, colorClass: 'text-neutral-400' };
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-darkBg" edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

            <View className="flex-row justify-between items-center px-5 py-4 bg-darkSurface border-b border-darkBorder">
                <View>
                    <Text className="text-xs text-neutral-400">Selamat Datang,</Text>
                    <Text className="text-lg font-bold text-white mt-0.5">
                        {admin?.name || admin?.email || 'Admin APEX'}
                    </Text>
                    <Text className="text-xs text-neonPurple font-medium mt-0.5">Hai, Admin</Text>
                </View>

                <TouchableOpacity
                    className="px-3.5 py-2 bg-red-500/15 rounded-xl border border-red-500/30"
                    onPress={handleLogout}
                    activeOpacity={0.7}>
                    <Text className="text-red-400 text-xs font-bold">Keluar</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center p-5 bg-darkBg">
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text className="mt-3 text-xs text-neutral-400 font-medium">
                        Memuat data dashboard...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#a855f7"
                            colors={['#a855f7']} />
                    }>

                    <View className="mb-6">
                        <TouchableOpacity
                            className="bg-darkSurface border border-darkBorder rounded-2xl p-4 items-center flex-row justify-between"
                            onPress={() => navigation.navigate('CustomerVehicle')}
                            activeOpacity={0.7}>
                            <View className="flex-row items-center">
                                <View>
                                    <Text className="text-white font-bold text-sm tracking-wide">
                                        Kelola Pelanggan & Kendaraan
                                    </Text>
                                    <Text className="text-neutral-400 text-xs mt-0.5">
                                        Tambah customer, Vehicle & buat order
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-base font-bold text-white mb-3 tracking-wide">
                        Ringkasan Operasional
                    </Text>

                    <View className="flex-row flex-wrap justify-between mb-6">
                        <View className="w-[48%] mb-3">
                            <View className="bg-darkSurface rounded-2xl p-4 border border-darkBorder border-l-4 border-l-amber-500">
                                <Text className="text-xs text-neutral-400 font-semibold">
                                    Antrean Aktif
                                </Text>
                                <Text className="text-xl font-bold text-amber-400 my-1">
                                    {activeQueueCount}
                                </Text>
                                <Text className="text-[10px] text-neutral-500">Sedang dikerjakan</Text>
                            </View>
                        </View>
                        <View className="w-[48%] mb-3">
                            <View className="bg-darkSurface rounded-2xl p-4 border border-darkBorder border-l-4 border-l-emerald-500">
                                <Text className="text-xs text-neutral-400 font-semibold">
                                    Total Omset
                                </Text>
                                <Text
                                    className="text-base font-bold text-emerald-400 my-1"
                                    numberOfLines={1}>
                                    {formatCurrency(totalIncome)}
                                </Text>
                                <Text className="text-[10px] text-neutral-500">Transaksi lunas</Text>
                            </View>
                        </View>
                        <View className="w-[48%] mb-3">
                            <View className="bg-darkSurface rounded-2xl p-4 border border-darkBorder border-l-4 border-l-purple-500">
                                <Text className="text-xs text-neutral-400 font-semibold">
                                    Total Pelanggan
                                </Text>
                                <Text className="text-xl font-bold text-purple-400 my-1">
                                    {customerCount}
                                </Text>
                                <Text className="text-[10px] text-neutral-500">Customer terdaftar</Text>
                            </View>
                        </View>
                        <View className="w-[48%] mb-3">
                            <View className="bg-darkSurface rounded-2xl p-4 border border-darkBorder border-l-4 border-l-blue-500">
                                <Text className="text-xs text-neutral-400 font-semibold">
                                    Kendaraan
                                </Text>
                                <Text className="text-xl font-bold text-blue-400 my-1">
                                    {vehicleCount}
                                </Text>
                                <Text className="text-[10px] text-neutral-500"> Vehicle Terdaftar</Text>
                            </View>
                        </View>
                    </View>


                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-base font-bold text-white tracking-wide">
                            Data Order Terkini
                        </Text>
                        <Text className="text-xs text-neutral-400 font-semibold">
                            ({orders.length} Order)
                        </Text>
                    </View>

                    {orders.length === 0 ? (
                        <View className="bg-darkSurface rounded-2xl p-6 items-center border border-darkBorder">
                            <Text className="text-base font-bold text-white mb-1.5">
                                Belum Ada Order Terkini
                            </Text>
                            <Text className="text-xs text-neutral-500 text-center leading-5">
                                Belum ada order pencucian hari ini. Tarik layar ke bawah untuk memperbarui.
                            </Text>
                        </View>
                    ) : (
                        orders.slice(0, 5).map((orderItem) => {
                            const statusInfo = getStatusInfo(orderItem.status);
                            const isPaid = orderItem.paymentStatus === 'PAID';

                            return (
                                <TouchableOpacity
                                    key={orderItem.id}
                                    className="w-full mb-3"
                                    activeOpacity={0.7}>
                                    <View className="bg-darkSurface rounded-2xl p-4 border border-darkBorder">
                                        <View className="flex-row justify-between items-start">
                                            <View>
                                                <Text className="text-base font-bold text-white font-mono tracking-wider">
                                                    {orderItem.vehicle?.plateNumber || 'NO PLAT'}
                                                </Text>
                                                <Text className="text-xs text-neutral-400 mt-0.5">
                                                    {orderItem.vehicle?.brand} {orderItem.vehicle?.model}
                                                </Text>
                                            </View>

                                            <Text className={`text-xs font-bold ${statusInfo.colorClass}`}>
                                                {statusInfo.label}
                                            </Text>
                                        </View>

                                        <View className="h-[1px] bg-neutral-800 my-3" />

                                        <View className="flex-row justify-between">
                                            <View className="flex-1">
                                                <Text className="text-[10px] text-neutral-500 uppercase font-semibold">
                                                    Pelanggan
                                                </Text>
                                                <Text
                                                    className="text-xs font-semibold text-neutral-200 mt-0.5"
                                                    numberOfLines={1}>
                                                    {orderItem.customer?.name || 'Customer'}
                                                </Text>
                                            </View>

                                            <View className="flex-1">
                                                <Text className="text-[10px] text-neutral-500 uppercase font-semibold">
                                                    Staff
                                                </Text>
                                                <Text
                                                    className="text-xs font-semibold text-neutral-200 mt-0.5"
                                                    numberOfLines={1}>
                                                    {orderItem.staff?.name || 'Belum Ditugaskan'}
                                                </Text>
                                            </View>

                                            <View className="flex-[1.2] items-end">
                                                <Text className="text-[10px] text-neutral-500 uppercase font-semibold">
                                                    Pembayaran
                                                </Text>
                                                <Text
                                                    className={`text-[11px] font-bold mt-0.5 ${isPaid ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {isPaid ? `LUNAS (${orderItem.paymentMethod || 'QRIS'})` : 'BELUM BAYAR'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row justify-between items-center mt-3 pt-2.5 border-t border-neutral-800">
                                            <Text className="text-xs text-neutral-400 font-medium">
                                                Total Tagihan:
                                            </Text>
                                            <Text className="text-sm font-bold text-neonPurple font-mono">
                                                {formatCurrency(orderItem.totalPrice)}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default DashboardScreen;

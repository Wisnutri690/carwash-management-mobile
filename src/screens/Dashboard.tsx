import { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authContext';
import { getDashboardOrders, getDashboardCustomers, getDashboardVehicles, } from '../services/dashboardService';
import type { Order, OrderStatus } from '../types/order';

export const DashboardScreen = () => {

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
                return { label: 'Antrean', color: '#fbbf24' };
            case 'IN_PROGRESS':
                return { label: 'Sedang Dicuci', color: '#60a5fa' };
            case 'COMPLETED':
                return { label: 'Selesai', color: '#34d399' };
            case 'CANCELLED':
                return { label: 'Dibatalkan', color: '#f87171' };
            default:
                return { label: status, color: '#a3a3a3' };
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Selamat Datang,</Text>
                    <Text style={styles.adminName}>
                        {admin?.name || admin?.email || 'Admin APEX'}
                    </Text>
                    <Text style={styles.roleSubText}>Hai, Admin</Text>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}>
                    <Text style={styles.logoutText}>Keluar</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text style={styles.loadingText}>Memuat data dashboard...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#ff0077ff"
                            colors={['#a855f7']} />
                    }>
                    <Text style={styles.sectionTitle}>Ringkasan Operasional</Text>
                    <View style={styles.statsGrid}>
                        <TouchableOpacity style={styles.statCardWrapper} activeOpacity={0.7}>
                            <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
                                <Text style={styles.statLabel}>Antrean Aktif</Text>
                                <Text style={[styles.statValue, { color: '#fbbf24' }]}>
                                    {activeQueueCount}
                                </Text>
                                <Text style={styles.statSub}>Sedang dikerjakan</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statCardWrapper} activeOpacity={0.7}>
                            <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
                                <Text style={styles.statLabel}>Total Omset</Text>
                                <Text style={[styles.statValue, { color: '#34d399', fontSize: 16 }]} numberOfLines={1}>
                                    {formatCurrency(totalIncome)}
                                </Text>
                                <Text style={styles.statSub}>Transaksi lunas</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statCardWrapper} activeOpacity={0.7}>
                            <View style={[styles.statCard, { borderLeftColor: '#a855f7' }]}>
                                <Text style={styles.statLabel}>Total Pelanggan</Text>
                                <Text style={[styles.statValue, { color: '#c084fc' }]}>
                                    {customerCount}
                                </Text>
                                <Text style={styles.statSub}>Customer terdaftar</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statCardWrapper} activeOpacity={0.7}>
                            <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
                                <Text style={styles.statLabel}>Kendaraan</Text>
                                <Text style={[styles.statValue, { color: '#60a5fa' }]}>
                                    {vehicleCount}
                                </Text>
                                <Text style={styles.statSub}>Unit terdata</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Data Order Terkini</Text>
                        <Text style={styles.queueCountText}>({orders.length} Order)</Text>
                    </View>

                    {orders.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyTitle}>Belum Ada Order Terkini</Text>
                            <Text style={styles.emptyText}>
                                Belum ada order pencucian hari ini. Tarik layar ke bawah untuk memperbarui.
                            </Text>
                        </View>
                    ) : (
                        orders.slice(0, 5).map((orderItem) => {
                            const statusInfo = getStatusInfo(orderItem.status);
                            const isPaid = orderItem.paymentStatus === 'PAID';

                            return (
                                <TouchableOpacity key={orderItem.id} style={styles.orderCardWrapper} activeOpacity={0.7}>
                                    <View style={styles.orderCard}>
                                        <View style={styles.orderCardHeader}>
                                            <View>
                                                <Text style={styles.plateNumber}>
                                                    {orderItem.vehicle?.plateNumber || 'NO PLAT'}
                                                </Text>
                                                <Text style={styles.vehicleInfo}>
                                                    {orderItem.vehicle?.brand} {orderItem.vehicle?.model}
                                                </Text>
                                            </View>

                                            <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                                {statusInfo.label}
                                            </Text>
                                        </View>

                                        <View style={styles.orderDivider} />
                                        <View style={styles.orderInfoRow}>
                                            <View style={styles.infoCol}>
                                                <Text style={styles.infoLabel}>Pelanggan</Text>
                                                <Text style={styles.infoValue} numberOfLines={1}>
                                                    {orderItem.customer?.name || 'Customer'}
                                                </Text>
                                            </View>

                                            <View style={styles.infoCol}>
                                                <Text style={styles.infoLabel}>Staff</Text>
                                                <Text style={styles.infoValue} numberOfLines={1}>
                                                    {orderItem.staff?.name || 'Belum Ditugaskan'}
                                                </Text>
                                            </View>

                                            <View style={styles.infoColRight}>
                                                <Text style={styles.infoLabel}>Pembayaran</Text>
                                                <Text
                                                    style={[
                                                        styles.paymentStatusText,
                                                        { color: isPaid ? '#34d399' : '#f87171' },
                                                    ]}>
                                                    {isPaid ? `LUNAS (${orderItem.paymentMethod || 'QRIS'})` : 'BELUM BAYAR'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Total Tagihan:</Text>
                                            <Text style={styles.totalValue}>{formatCurrency(orderItem.totalPrice)}</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#121212',
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
    },
    greeting: {
        fontSize: 12,
        color: '#a3a3a3',
    },
    adminName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 1,
    },
    roleSubText: {
        fontSize: 12,
        color: '#a855f7',
        marginTop: 2,
        fontWeight: '500',
    },
    logoutButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    logoutText: {
        color: '#f87171',
        fontSize: 13,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#0a0a0a',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 13,
        color: '#a3a3a3',
        fontWeight: '500',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCardWrapper: {
        width: '48%',
        marginBottom: 12,
    },
    statCard: {
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#262626',
        borderLeftWidth: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#a3a3a3',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    statSub: {
        fontSize: 10,
        color: '#737373',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    queueCountText: {
        fontSize: 13,
        color: '#a3a3a3',
        fontWeight: '600',
    },
    emptyCard: {
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#262626',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 12,
        color: '#737373',
        textAlign: 'center',
        lineHeight: 18,
    },
    orderCardWrapper: {
        width: '100%',
        marginBottom: 12,
    },
    orderCard: {
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#262626',
    },
    orderCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    plateNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 0.5,
    },
    vehicleInfo: {
        fontSize: 12,
        color: '#a3a3a3',
        marginTop: 2,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
    orderDivider: {
        height: 1,
        backgroundColor: '#1e1e1e',
        marginVertical: 12,
    },
    orderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoCol: {
        flex: 1,
    },
    infoColRight: {
        flex: 1.2,
        alignItems: 'flex-end',
    },
    infoLabel: {
        fontSize: 10,
        color: '#737373',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#e5e5e5',
        marginTop: 2,
    },
    paymentStatusText: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#1e1e1e',
    },
    totalLabel: {
        fontSize: 12,
        color: '#a3a3a3',
        fontWeight: '500',
    },
    totalValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#c084fc',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});

export default DashboardScreen;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../context/authContext';

export const DashboardScreen: React.FC = () => {
    const { admin, logOut } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Halo, Admin </Text>
                    <Text style={styles.adminName}>{admin?.name || admin?.email || 'Administrator'}</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={logOut} activeOpacity={0.7}>
                    <Text style={styles.logoutText}>Keluar</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.cardTitle}>Login Berhasil!</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    greeting: {
        fontSize: 13,
        color: '#64748b',
    },
    adminName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    logoutButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
    },
    logoutText: {
        color: '#dc2626',
        fontSize: 13,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    welcomeCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
});

export default DashboardScreen;

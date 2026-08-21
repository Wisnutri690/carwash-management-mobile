import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authContext';

export const LoginScreen = () => {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Perhatian', 'Email dan password wajib diisi!');
            return;
        }

        try {
            setIsSubmitting(true);
            await login({ email: email.trim(), password: password.trim() });
        } catch (error: any) {
            console.log('Login error:', error);
            const errorMsg =
                error?.response?.data?.message ||
                error.message ||
                'Login gagal. Periksa koneksi dengan backend.';
            Alert.alert('Login Gagal', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-darkBg" edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <View className="items-center mb-8">
                        <View className="flex-row items-center justify-center mb-2">
                            <Text className="text-3xl font-bold text-white tracking-widest mr-2">
                                APEX
                            </Text>
                            <Text className="text-3xl font-bold text-neonPink tracking-widest">
                                CARWASH
                            </Text>
                        </View>
                        <Text className="text-xs text-neutral-400 text-center">
                            Portal Administrator Operasional & Layanan
                        </Text>
                    </View>

                    <View className="bg-darkSurface rounded-3xl p-6 border border-darkBorder">
                        <View className="mb-4">
                            <Text className="text-xs font-semibold text-neutral-300 mb-2">
                                Email Admin
                            </Text>
                            <TextInput
                                className="h-12 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                                placeholder="admin@apexcarwash.com"
                                placeholderTextColor="#737373"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                editable={!isSubmitting} />
                        </View>

                        <View className="mb-4">
                            <Text className="text-xs font-semibold text-neutral-300 mb-2">
                                Password
                            </Text>
                            <TextInput
                                className="h-12 bg-darkInput border border-darkBorder rounded-xl px-4 text-white text-sm"
                                placeholder="Masukkan password"
                                placeholderTextColor="#737373"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                editable={!isSubmitting} />
                        </View>

                        <TouchableOpacity
                            className={`h-12 rounded-xl items-center justify-center mt-2 ${isSubmitting ? 'bg-neonPurple/50' : 'bg-neonPurple'}`}
                            onPress={handleLogin}
                            disabled={isSubmitting}
                            activeOpacity={0.8}>
                            {isSubmitting ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text className="text-white font-bold text-sm tracking-wide">
                                    Login
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

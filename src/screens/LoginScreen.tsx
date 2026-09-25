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
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    
                    <View className="mb-12">
                        <Text className="text-3xl font-black text-black tracking-tight">
                            APEX CARWASH
                        </Text>
                        <Text className="text-xs text-neutral-400 font-mono tracking-widest uppercase mt-1">
                            Administrator Console
                        </Text>
                    </View>

                    <View className="space-y-6">
                        <View className="mb-5">
                            <Text className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                                Email
                            </Text>
                            <TextInput
                                className="h-12 border-b border-neutral-200 px-0 text-black text-base"
                                placeholder="admin@apexcarwash.com"
                                placeholderTextColor="#a3a3a3"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                editable={!isSubmitting} />
                        </View>

                        <View className="mb-8">
                            <Text className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                                Password
                            </Text>
                            <TextInput
                                className="h-12 border-b border-neutral-200 px-0 text-black text-base"
                                placeholder="••••••••"
                                placeholderTextColor="#a3a3a3"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                editable={!isSubmitting} />
                        </View>

                        <TouchableOpacity
                            className="h-13 bg-black rounded-full items-center justify-center"
                            onPress={handleLogin}
                            disabled={isSubmitting}
                            activeOpacity={0.85}>
                            {isSubmitting ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text className="text-white font-bold text-sm tracking-wide">
                                    Masuk
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

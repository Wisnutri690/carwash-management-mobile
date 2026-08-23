import "./global.css";
import { View, ActivityIndicator, StatusBar, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/authContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/Dashboard';
import CustomerVehicleScreen from "./src/screens/CustomerVehicle";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CustomerVehicle: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0a0a0a',
    card: '#121212',
    text: '#ffffff',
    border: '#262626',
  },
};

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-darkBg">
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <ActivityIndicator size="large" color="#a855f7" />
        <Text className="mt-4 text-xs text-neutral-400 font-medium tracking-wide">
          Memuat APEX CARWASH...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={customDarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0a' },
        }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen
              name="CustomerVehicle"
              component={CustomerVehicleScreen}
              options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <RootNavigator />
    </AuthProvider>
  );
}

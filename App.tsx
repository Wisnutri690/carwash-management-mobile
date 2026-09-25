import "./global.css";
import { View, ActivityIndicator, StatusBar, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/authContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/Dashboard';
import CustomerVehicleScreen from "./src/screens/CustomerVehicle";
import OrderScreen from "./src/screens/OrderScreens";
import SalesScreen from "./src/screens/SalesScreen";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CustomerVehicle: undefined;
  OrderScreen: undefined;
  Sales: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const monochromeTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#ffffff',
    text: '#000000',
    border: '#e4e4e7',
  },
};

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="small" color="#000000" />
        <Text className="mt-4 text-xs text-neutral-400 font-mono tracking-widest uppercase">
          APEX CARWASH
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={monochromeTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
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
            <Stack.Screen
              name="OrderScreen"
              component={OrderScreen}
              options={{ headerShown: false }} />
            <Stack.Screen
              name="Sales"
              component={SalesScreen}
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <RootNavigator />
    </AuthProvider>
  );
}

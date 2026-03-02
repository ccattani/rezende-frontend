import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../store/auth";

import LoginScreen from "../screens/LoginScreen";
import VehiclesListScreen from "../screens/VehiclesListScreen";
import VehicleDetailScreen from "../screens/VehicleDetailScreen";
import CreateVehicleScreen from "../screens/CreateVehicleScreen";
import EditVehicleScreen from "../screens/EditVehicleScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EmployeesListScreen from "../screens/EmployeesListScreen";
import CreateEmployeeScreen from "../screens/CreateEmployeeScreen";

import type { Vehicle } from "../services/api/vehicles";

/* ============================
   BRAND THEME
============================ */

const BRAND = {
  red: "#C1121F",
  black: "#0B0B0B",
  white: "#FFFFFF",
  gray: "#E5E5E5",
  muted: "#9CA3AF",
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: BRAND.white,
    card: BRAND.black,
    text: BRAND.white,
    border: BRAND.black,
    primary: BRAND.red,
    notification: BRAND.red,
  },
};

/* ============================
   TYPES
============================ */

export type VehiclesStackParamList = {
  VehiclesList: undefined;
  VehicleDetail: { id: string };
  CreateVehicle: undefined;
  EditVehicle: { vehicle: Vehicle };
};

export type EmployeesStackParamList = {
  EmployeesList: undefined;
  CreateEmployee: undefined;
};

export type RootStackParamList = {
  App: undefined;
  Auth: undefined;
};

/* ============================
   NAVIGATORS
============================ */

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();
const VehiclesStack = createNativeStackNavigator<VehiclesStackParamList>();
const EmployeesStack = createNativeStackNavigator<EmployeesStackParamList>();

/* ============================
   COMMON HEADER STYLE
============================ */

const stackScreenOptions = {
  headerStyle: { backgroundColor: BRAND.black },
  headerTintColor: BRAND.white,
  headerTitleStyle: { fontWeight: "700" as const },
};

/* ============================
   VEHICLES STACK
============================ */

function VehiclesStackNavigator() {
  return (
    <VehiclesStack.Navigator id="veiculos" screenOptions={stackScreenOptions}>
      <VehiclesStack.Screen
        name="VehiclesList"
        component={VehiclesListScreen}
        options={{ title: "Veículos" }}
      />
      <VehiclesStack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{ title: "Detalhes" }}
      />
      <VehiclesStack.Screen
        name="CreateVehicle"
        component={CreateVehicleScreen}
        options={{ title: "Novo veículo" }}
      />
      <VehiclesStack.Screen
        name="EditVehicle"
        component={EditVehicleScreen}
        options={{ title: "Editar veículo" }}
      />
    </VehiclesStack.Navigator>
  );
}

/* ============================
   EMPLOYEES STACK
============================ */

function EmployeesStackNavigator() {
  return (
    <EmployeesStack.Navigator
      id="funcionarios"
      screenOptions={stackScreenOptions}
    >
      <EmployeesStack.Screen
        name="EmployeesList"
        component={EmployeesListScreen}
        options={{ title: "Funcionários" }}
      />
      <EmployeesStack.Screen
        name="CreateEmployee"
        component={CreateEmployeeScreen}
        options={{ title: "Novo funcionário" }}
      />
    </EmployeesStack.Navigator>
  );
}

/* ============================
   TABS
============================ */

function AppTabs() {
  const { user } = useAuth();

  return (
    <Tabs.Navigator
      id="tabs"
      screenOptions={{
        headerShown: false,
        tabBarIconStyle: { display: "none" },
        tabBarStyle: {
          backgroundColor: BRAND.black,
          borderTopColor: "#111111",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: BRAND.red,
        tabBarInactiveTintColor: BRAND.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="Veículos" component={VehiclesStackNavigator} />

      {user?.role === "CHEFE" && (
        <Tabs.Screen name="Funcionários" component={EmployeesStackNavigator} />
      )}

      <Tabs.Screen name="Perfil" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

/* ============================
   ROOT
============================ */

export default function RootNavigator() {
  const { token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
        {token ? (
          <RootStack.Screen name="App" component={AppTabs} />
        ) : (
          <RootStack.Screen name="Auth" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
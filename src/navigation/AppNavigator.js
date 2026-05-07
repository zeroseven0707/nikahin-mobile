import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../config/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import DashboardScreen from '../screens/DashboardScreen';
import TemplateScreen from '../screens/TemplateScreen';
import CreateInvitationWizardScreen from '../screens/CreateInvitationWizardScreen';
import EditInvitationScreen from '../screens/EditInvitationScreen';
import InvitationDetailScreen from '../screens/InvitationDetailScreen';
import GuestListScreen from '../screens/GuestListScreen';
import AddGuestScreen from '../screens/AddGuestScreen';
import EditGuestScreen from '../screens/EditGuestScreen';
import GuestQrScreen from '../screens/GuestQrScreen';
import QrScannerScreen from '../screens/QrScannerScreen';
import ScanAnalyticsScreen from '../screens/ScanAnalyticsScreen';
import ImportGuestScreen from '../screens/ImportGuestScreen';
import RsvpListScreen from '../screens/RsvpListScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import ShareInvitationScreen from '../screens/ShareInvitationScreen';
import WaBlastScreen from '../screens/WaBlastScreen';
import GalleryScreen from '../screens/GalleryScreen';
import PaymentScreen from '../screens/PaymentScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpScreen from '../screens/HelpScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TemplateTab') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 80 : 64,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.semibold,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Beranda' }}
      />
      <Tab.Screen
        name="TemplateTab"
        component={TemplateScreen}
        options={{ tabBarLabel: 'Template' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Main Stack
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="CreateInvitation" component={CreateInvitationWizardScreen} />
          <Stack.Screen name="EditInvitation" component={EditInvitationScreen} />
          <Stack.Screen name="InvitationDetail" component={InvitationDetailScreen} />
          <Stack.Screen name="GuestList" component={GuestListScreen} />
          <Stack.Screen name="AddGuest" component={AddGuestScreen} />
          <Stack.Screen name="EditGuest" component={EditGuestScreen} />
          <Stack.Screen name="GuestQr" component={GuestQrScreen} />
          <Stack.Screen name="QrScanner" component={QrScannerScreen} />
          <Stack.Screen name="ScanAnalytics" component={ScanAnalyticsScreen} />
          <Stack.Screen name="ImportGuest" component={ImportGuestScreen} />
          <Stack.Screen name="RsvpList" component={RsvpListScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
          <Stack.Screen name="ShareInvitation" component={ShareInvitationScreen} />
          <Stack.Screen name="WaBlast" component={WaBlastScreen} />
          <Stack.Screen name="Gallery" component={GalleryScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

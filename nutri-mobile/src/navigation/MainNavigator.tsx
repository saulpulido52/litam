import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES, TRANSLATIONS } from '../constants';
import { useAppStore } from '../store/appStore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Importar pantallas
import DashboardScreen from '../screens/DashboardScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import DietPlansScreen from '../screens/DietPlansScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language];
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }} edges={['bottom', 'left', 'right']}> 
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = 'circle';
            if (route.name === 'Dashboard') {
              iconName = 'home';
            } else if (route.name === 'Appointments') {
              iconName = 'calendar';
            } else if (route.name === 'DietPlans') {
              iconName = 'cutlery';
            } else if (route.name === 'Progress') {
              iconName = 'line-chart';
            } else if (route.name === 'Profile') {
              iconName = 'user';
            }
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
                <FontAwesome
                  name={iconName as any}
                  size={size - 2}
                  color={color}
                  style={{ opacity: focused ? 1 : 0.7 }}
                />
              </View>
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingBottom: insets.bottom + 2,
            paddingTop: 2,
            height: 36 + insets.bottom, // aún más compacta
            alignItems: 'center',
            justifyContent: 'center',
          },
          tabBarLabelStyle: {
            fontSize: FONT_SIZES.xs,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: COLORS.surface,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          },
          headerTitleStyle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: '600',
            color: COLORS.text,
          },
          headerTintColor: COLORS.text,
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: t.dashboard,
            headerTitle: t.dashboard,
          }}
        />
        <Tab.Screen
          name="Appointments"
          component={AppointmentsScreen}
          options={{
            title: t.appointments,
            headerTitle: t.appointments,
          }}
        />
        <Tab.Screen
          name="DietPlans"
          component={DietPlansScreen}
          options={{
            title: t.dietPlans,
            headerTitle: t.dietPlans,
          }}
        />
        <Tab.Screen
          name="Progress"
          component={ProgressScreen}
          options={{
            title: t.progress,
            headerTitle: t.progress,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: t.profile,
            headerTitle: t.profile,
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default MainNavigator; 
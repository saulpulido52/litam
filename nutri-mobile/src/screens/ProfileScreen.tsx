import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TRANSLATIONS } from '../constants';
import { FontAwesome } from '@expo/vector-icons';

const ProfileScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { language } = useAppStore();
  const t = TRANSLATIONS[language];

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user" size={40} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="user" size={24} color={COLORS.primary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Información Personal</Text>
            <FontAwesome name="chevron-right" size={20} color={COLORS.textSecondary} style={styles.chevronIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="bell" size={24} color={COLORS.primary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Notificaciones</Text>
            <FontAwesome name="chevron-right" size={20} color={COLORS.textSecondary} style={styles.chevronIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="cog" size={24} color={COLORS.primary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Configuración</Text>
            <FontAwesome name="chevron-right" size={20} color={COLORS.textSecondary} style={styles.chevronIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="question-circle" size={24} color={COLORS.primary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Ayuda</Text>
            <FontAwesome name="chevron-right" size={20} color={COLORS.textSecondary} style={styles.chevronIcon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={24} color={COLORS.error} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  avatarIcon: {
    fontSize: 40,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  chevronIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

export default ProfileScreen; 
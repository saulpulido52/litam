import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TRANSLATIONS } from '../constants';
import { FontAwesome } from '@expo/vector-icons';

const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { language } = useAppStore();
  const t = TRANSLATIONS[language];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t.welcome}, {user?.first_name || 'Usuario'}! 👋
          </Text>
          <Text style={styles.subtitle}>
            ¿Cómo te sientes hoy?
          </Text>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <FontAwesome name="calendar" size={24} color={COLORS.primary} style={styles.statIcon} />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Citas esta semana</Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome name="cutlery" size={24} color={COLORS.primary} style={styles.statIcon} />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Comidas completadas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.nextAppointment}</Text>
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentIcon}>
              <FontAwesome name="user-md" size={24} color={COLORS.primary} style={styles.appointmentIconText} />
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentTitle}>Dr. María García</Text>
              <Text style={styles.appointmentDate}>Mañana, 10:00 AM</Text>
            </View>
            <TouchableOpacity style={styles.appointmentButton}>
              <FontAwesome name="chevron-right" size={20} color={COLORS.textSecondary} style={styles.chevronText} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.todaysMeals}</Text>
          <View style={styles.mealCard}>
            <View style={styles.mealIcon}>
              <FontAwesome name="sun-o" size={20} color={COLORS.primary} style={styles.mealIconText} />
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealTitle}>Desayuno</Text>
              <Text style={styles.mealDescription}>Avena con frutas</Text>
            </View>
            <View style={styles.mealStatus}>
              <FontAwesome name="check-circle" size={20} color={COLORS.success} style={styles.statusIcon} />
            </View>
          </View>
          <View style={styles.mealCard}>
            <View style={styles.mealIcon}>
              <FontAwesome name="cutlery" size={20} color={COLORS.primary} style={styles.mealIconText} />
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealTitle}>Almuerzo</Text>
              <Text style={styles.mealDescription}>Pollo con verduras</Text>
            </View>
            <View style={styles.mealStatus}>
              <FontAwesome name="clock-o" size={20} color={COLORS.warning} style={styles.statusIcon} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="balance-scale" size={24} color={COLORS.primary} style={styles.actionIcon} />
              <Text style={styles.actionText}>Registrar Peso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="commenting-o" size={24} color={COLORS.primary} style={styles.actionIcon} />
              <Text style={styles.actionText}>Mensaje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingVertical: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    ...SHADOWS.sm,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginVertical: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  appointmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  appointmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  appointmentIconText: {
    fontSize: 24,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  appointmentDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  appointmentButton: {
    padding: SPACING.sm,
  },
  chevronText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  mealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  mealIconText: {
    fontSize: 20,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  mealDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  mealStatus: {
    padding: SPACING.sm,
  },
  statusIcon: {
    fontSize: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    ...SHADOWS.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

export default DashboardScreen; 
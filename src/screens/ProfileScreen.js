import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'confirm', buttons: [] });

  const showAlert = (title, message, type = 'confirm', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const handleLogout = () => {
    showAlert(
      'Keluar dari Akun',
      'Apakah Anda yakin ingin keluar?',
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: async () => { await logout(); } },
      ]
    );
  };

  const getInitials = (name) => {
    const parts = (name || '').trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (name || '?').substring(0, 2).toUpperCase();
  };

  const menuSections = [
    {
      title: 'AKUN',
      items: [
        {
          icon: 'person-outline',
          color: theme.colors.primary,
          bg: theme.colors.primary + '15',
          title: 'Edit Profil',
          subtitle: 'Ubah nama dan email',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          icon: 'lock-closed-outline',
          color: theme.colors.success,
          bg: theme.colors.success + '15',
          title: 'Ubah Password',
          subtitle: 'Ganti password akun',
          onPress: () => navigation.navigate('ChangePassword'),
        },
      ],
    },
    {
      title: 'INFORMASI',
      items: [
        {
          icon: 'help-circle-outline',
          color: theme.colors.info,
          bg: theme.colors.info + '15',
          title: 'Bantuan & FAQ',
          subtitle: 'Pertanyaan yang sering diajukan',
          onPress: () => navigation.navigate('Help'),
        },
        {
          icon: 'information-circle-outline',
          color: theme.colors.accent,
          bg: theme.colors.accent + '20',
          title: 'Tentang Aplikasi',
          subtitle: 'Versi 1.0.0',
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* ── HERO ── */}
      <LinearGradient
        colors={theme.colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            {/* Label */}
            <Text style={styles.heroLabel}>Profil</Text>

            {/* Avatar + info row */}
            <View style={styles.heroRow}>
              <View style={styles.avatarRing}>
                <LinearGradient
                  colors={[theme.colors.primaryLight, theme.colors.primaryDark]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
                </LinearGradient>
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
                <TouchableOpacity
                  style={styles.editPill}
                  onPress={() => navigation.navigate('EditProfile')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={12} color={theme.colors.white} />
                  <Text style={styles.editPillText}>Edit Profil</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── MENU SECTIONS ── */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <View key={item.title}>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                      <Ionicons name={item.icon} size={19} color={item.color} />
                    </View>
                    <View style={styles.menuText}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSub}>{item.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                  {index < section.items.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* ── DANGER ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.error }]}>ZONA BAHAYA</Text>
          <View style={[styles.menuCard, styles.dangerCard]}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('DeleteAccount')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: theme.colors.error + '15' }]}>
                <Ionicons name="trash-outline" size={19} color={theme.colors.error} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: theme.colors.error }]}>Hapus Akun</Text>
                <Text style={styles.menuSub}>Hapus akun dan semua data permanen</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LOGOUT ── */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>

        {/* ── VERSION ── */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>Nikahin v1.0.0</Text>
          <Text style={styles.versionSub}>Made with ❤️ for your special day</Text>
        </View>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // ── HERO ──
  hero: {},
  heroContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  heroLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    flexShrink: 0,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  heroInfo: { flex: 1 },
  userName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.sm,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignSelf: 'flex-start',
  },
  editPillText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },

  // ── SCROLL ──
  scroll: { flex: 1 },
  scrollContent: { paddingTop: theme.spacing.lg },

  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },

  // ── MENU CARD ──
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  dangerCard: {
    borderColor: theme.colors.error + '30',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: { flex: 1 },
  menuTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 1,
  },
  menuSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  rowDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginLeft: theme.spacing.md + 40 + theme.spacing.md,
  },

  // ── LOGOUT ──
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.error + '35',
    backgroundColor: theme.colors.error + '07',
  },
  logoutText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.error,
  },

  // ── VERSION ──
  versionRow: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  versionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  versionSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 3,
  },
});

export default ProfileScreen;

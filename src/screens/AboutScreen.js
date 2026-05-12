import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';

const FEATURES = [
  { icon: 'create-outline',       color: theme.colors.primary,      title: 'Buat Undangan',    desc: 'Template premium yang elegan' },
  { icon: 'people-outline',       color: theme.colors.success,      title: 'Kelola Tamu',      desc: 'Manajemen tamu yang praktis' },
  { icon: 'qr-code-outline',      color: '#7C3AED',                 title: 'Scan QR',          desc: 'Check-in real-time di hari H' },
  { icon: 'gift-outline',         color: '#EC4899',                 title: 'Kirim Hadiah',     desc: 'Produk & transfer rekening' },
  { icon: 'chatbubbles-outline',  color: theme.colors.info,         title: 'RSVP & Ucapan',    desc: 'Pantau konfirmasi kehadiran' },
  { icon: 'stats-chart-outline',  color: theme.colors.accent,       title: 'Analitik',         desc: 'Statistik undangan lengkap' },
];

const CONTACTS = [
  { icon: 'mail-outline',   label: 'support@nikahin.app',  url: 'mailto:support@nikahin.app' },
  { icon: 'globe-outline',  label: 'www.nikahin.online',   url: 'https://nikahin.online'     },
  { icon: 'logo-instagram', label: '@nikahin.app',         url: 'https://instagram.com/nikahin.app' },
];

const LEGAL = [
  { icon: 'shield-checkmark-outline', label: 'Kebijakan Privasi', url: 'https://nikahin.online/privacy' },
  { icon: 'document-text-outline',    label: 'Syarat & Ketentuan', url: 'https://nikahin.online/terms'  },
];

// ─── Section header ───────────────────────────────────────────────────────────
const SectionTitle = ({ icon, color, title }) => (
  <View style={sectionStyles.row}>
    <View style={[sectionStyles.iconBg, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={sectionStyles.title}>{title}</Text>
  </View>
);
const sectionStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  iconBg: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
const AboutScreen = ({ navigation }) => (
  <View style={styles.container}>
    {/* Header */}
    <LinearGradient
      colors={theme.colors.gradient.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
    </LinearGradient>

    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── App identity ── */}
      <View style={styles.identityCard}>
        <LinearGradient
          colors={theme.colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.appLogo}
        >
          <Ionicons name="mail" size={36} color="#fff" />
        </LinearGradient>
        <Text style={styles.appName}>Nikahin</Text>
        <View style={styles.versionBadge}>
          <Ionicons name="sparkles" size={11} color={theme.colors.accent} />
          <Text style={styles.versionText}>Versi 1.0.0</Text>
        </View>
        <Text style={styles.appTagline}>
          Undangan pernikahan digital yang elegan dan modern
        </Text>
      </View>

      {/* ── About ── */}
      <View style={styles.card}>
        <SectionTitle icon="information-circle-outline" color={theme.colors.primary} title="Tentang Kami" />
        <Text style={styles.bodyText}>
          Nikahin adalah platform undangan pernikahan digital yang memudahkan Anda membuat, mengelola, dan membagikan undangan kepada seluruh tamu. Dengan desain premium dan fitur lengkap, kami hadir untuk mewujudkan undangan impian Anda.
        </Text>
      </View>

      {/* ── Features ── */}
      <View style={styles.card}>
        <SectionTitle icon="star-outline" color={theme.colors.success} title="Fitur Utama" />
        <View style={styles.featuresGrid}>
          {FEATURES.map(f => (
            <View key={f.title} style={styles.featureItem}>
              <View style={[styles.featureIconBg, { backgroundColor: f.color + '15' }]}>
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Contact ── */}
      <View style={styles.card}>
        <SectionTitle icon="chatbubble-ellipses-outline" color={theme.colors.info} title="Hubungi Kami" />
        {CONTACTS.map((c, i) => (
          <View key={c.label}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Linking.openURL(c.url)}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIconBg, { backgroundColor: theme.colors.primary + '12' }]}>
                <Ionicons name={c.icon} size={16} color={theme.colors.primary} />
              </View>
              <Text style={styles.linkLabel}>{c.label}</Text>
              <Ionicons name="open-outline" size={13} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            {i < CONTACTS.length - 1 && <View style={styles.rowDivider} />}
          </View>
        ))}
      </View>

      {/* ── Legal ── */}
      <View style={styles.card}>
        <SectionTitle icon="shield-outline" color={theme.colors.textSecondary} title="Legal" />
        {LEGAL.map((l, i) => (
          <View key={l.label}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Linking.openURL(l.url)}
              activeOpacity={0.7}
            >
              <View style={[styles.linkIconBg, { backgroundColor: theme.colors.textSecondary + '12' }]}>
                <Ionicons name={l.icon} size={16} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.linkLabel}>{l.label}</Text>
              <Ionicons name="open-outline" size={13} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            {i < LEGAL.length - 1 && <View style={styles.rowDivider} />}
          </View>
        ))}
      </View>

      {/* Copyright */}
      <View style={styles.copyright}>
        <Text style={styles.copyrightText}>© 2026 Nikahin. All rights reserved.</Text>
        <Text style={styles.copyrightSub}>Made with ❤️ for your special day</Text>
      </View>

      <View style={{ height: theme.spacing.xl }} />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: { paddingBottom: theme.spacing.md },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },

  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md },

  // Identity card
  identityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appLogo: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  versionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.colors.accent + '18',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  versionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  appTagline: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },

  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  bodyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  // Features grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  featureItem: {
    width: '47%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: 5,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  featureIconBg: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  featureDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },

  // Link rows
  linkRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  linkIconBg: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  linkLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  rowDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginLeft: 34 + theme.spacing.md,
  },

  // Copyright
  copyright: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    gap: 4,
  },
  copyrightText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  copyrightSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
});

export default AboutScreen;

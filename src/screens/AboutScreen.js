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
import Card from '../components/Card';
import { theme } from '../config/theme';

const features = [
  { icon: 'create-outline',       color: theme.colors.primary,      title: 'Buat Undangan',     desc: 'Desain undangan yang indah dan mudah' },
  { icon: 'people-outline',       color: theme.colors.success,      title: 'Kelola Tamu',       desc: 'Atur daftar tamu dengan praktis' },
  { icon: 'chatbubbles-outline',  color: theme.colors.info,         title: 'Tracking RSVP',     desc: 'Pantau konfirmasi kehadiran tamu' },
  { icon: 'stats-chart-outline',  color: theme.colors.accent,       title: 'Statistik',         desc: 'Lihat analitik undangan Anda' },
  { icon: 'share-social-outline', color: theme.colors.primaryLight, title: 'Bagikan Mudah',     desc: 'Kirim via WhatsApp, email, dan lainnya' },
];

const contacts = [
  { icon: 'mail-outline',      label: 'support@nikahin.app',      url: 'mailto:support@nikahin.app' },
  { icon: 'globe-outline',     label: 'www.nikahin.app',          url: 'https://nikahin.app' },
  { icon: 'logo-instagram',    label: '@nikahin.app',             url: 'https://instagram.com/nikahin.app' },
];

const AboutScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Identity Card */}
        <View style={styles.section}>
          <Card style={styles.appCard}>
            <LinearGradient
              colors={[theme.colors.primary + '12', theme.colors.primary + '04']}
              style={styles.appCardInner}
            >
              {/* Logo */}
              <LinearGradient
                colors={theme.colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoCircle}
              >
                <Ionicons name="mail" size={40} color={theme.colors.white} />
              </LinearGradient>

              <Text style={styles.appName}>Nikahin</Text>

              {/* Version badge */}
              <View style={styles.versionBadge}>
                <Ionicons name="sparkles" size={12} color={theme.colors.secondary} />
                <Text style={styles.versionText}>Versi 1.0.0</Text>
              </View>

              <Text style={styles.appTagline}>
                Buat undangan pernikahan digital yang indah dan modern
              </Text>

              {/* Divider */}
              <View style={styles.taglineDivider}>
                <View style={styles.dividerLine} />
                <Ionicons name="heart" size={12} color={theme.colors.primary + '60'} />
                <View style={styles.dividerLine} />
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Card>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconBg, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Tentang Kami</Text>
            </View>
            <Text style={styles.description}>
              Nikahin adalah aplikasi yang memudahkan Anda untuk membuat, mengelola, dan membagikan undangan pernikahan secara digital. Dengan desain yang elegan dan fitur yang lengkap, kami membantu mewujudkan undangan impian Anda.
            </Text>
          </Card>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Card>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconBg, { backgroundColor: theme.colors.success + '15' }]}>
                <Ionicons name="star-outline" size={18} color={theme.colors.success} />
              </View>
              <Text style={styles.cardTitle}>Fitur Utama</Text>
            </View>
            {features.map((f, index) => (
              <View key={f.title}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureIconBg, { backgroundColor: f.color + '15' }]}>
                    <Ionicons name={f.icon} size={20} color={f.color} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                </View>
                {index < features.length - 1 && <View style={styles.featureDivider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Card>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconBg, { backgroundColor: theme.colors.info + '15' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.info} />
              </View>
              <Text style={styles.cardTitle}>Hubungi Kami</Text>
            </View>
            {contacts.map((c, index) => (
              <View key={c.label}>
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(c.url)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.contactIconBg, { backgroundColor: theme.colors.primary + '12' }]}>
                    <Ionicons name={c.icon} size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.contactLabel}>{c.label}</Text>
                  <Ionicons name="open-outline" size={14} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                {index < contacts.length - 1 && <View style={styles.contactDivider} />}
              </View>
            ))}
          </Card>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyright}>© 2026 Nikahin. All rights reserved.</Text>
          <Text style={styles.copyrightSub}>Made with ❤️ for your special day</Text>
        </View>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header: { paddingBottom: theme.spacing.md },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  headerButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.white },

  content: { flex: 1 },
  section: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg },

  // App Card
  appCard: { padding: 0, overflow: 'hidden' },
  appCardInner: { padding: theme.spacing.xl, alignItems: 'center', borderRadius: theme.borderRadius.xl },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  appName: { fontSize: theme.fontSize.xxxl, fontWeight: theme.fontWeight.extrabold, color: theme.colors.text, letterSpacing: 1 },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.secondary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  versionText: { fontSize: theme.fontSize.xs, color: theme.colors.text, fontWeight: theme.fontWeight.semibold },
  appTagline: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'center', paddingHorizontal: theme.spacing.lg },
  taglineDivider: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.md, width: 100 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },

  // Card header
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  cardIconBg: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },

  description: { fontSize: theme.fontSize.md, color: theme.colors.text, lineHeight: 24 },

  // Features
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.sm },
  featureIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text, marginBottom: 2 },
  featureDesc: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  featureDivider: { height: 1, backgroundColor: theme.colors.divider, marginLeft: 44 + theme.spacing.md },

  // Contact
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.sm },
  contactIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },
  contactDivider: { height: 1, backgroundColor: theme.colors.divider, marginLeft: 36 + theme.spacing.md },

  // Copyright
  copyrightSection: { alignItems: 'center', paddingVertical: theme.spacing.xl },
  copyright: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  copyrightSub: { fontSize: theme.fontSize.xs, color: theme.colors.textTertiary, marginTop: 4 },
});

export default AboutScreen;

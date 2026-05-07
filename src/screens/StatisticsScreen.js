import React, { useState, useEffect } from 'react';
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
import { invitationService } from '../services/invitationService';

const StatisticsScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });

  useEffect(() => { loadStatistics(); }, []);

  const loadStatistics = async () => {
    try {
      const response = await invitationService.getStatistics(token, invitation.id);
      setStats(response.statistics || response.data || {});
    } catch {
      setAlert({ visible: true, title: 'Error', message: 'Gagal memuat statistik', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const viewsCount   = stats?.views_count   ?? invitation.views_count   ?? 0;
  const guestsCount  = stats?.guests_count  ?? invitation.guests_count  ?? 0;
  const rsvpsCount   = stats?.rsvps_count   ?? invitation.rsvps_count   ?? 0;
  const sharesCount  = stats?.shares_count  ?? 0;
  const mobileViews  = stats?.mobile_views  ?? 0;
  const desktopViews = stats?.desktop_views ?? 0;
  const tabletViews  = stats?.tablet_views  ?? 0;

  const engagementRate = viewsCount > 0
    ? ((rsvpsCount / viewsCount) * 100).toFixed(1)
    : '0.0';

  const totalDeviceViews = mobileViews + desktopViews + tabletViews || 1;

  const overviewStats = [
    { icon: 'eye-outline',          label: 'Total Views',  value: viewsCount,  color: theme.colors.primary,   bg: theme.colors.primary + '15' },
    { icon: 'people-outline',       label: 'Total Tamu',   value: guestsCount, color: theme.colors.accent,    bg: theme.colors.accent + '18'  },
    { icon: 'chatbubbles-outline',  label: 'Total RSVP',   value: rsvpsCount,  color: theme.colors.success,   bg: theme.colors.success + '15' },
    { icon: 'share-social-outline', label: 'Shares',       value: sharesCount, color: '#A855F7',               bg: '#A855F715'                 },
  ];

  const deviceStats = [
    { icon: 'phone-portrait-outline',  label: 'Mobile',  value: mobileViews,  color: theme.colors.primary },
    { icon: 'desktop-outline',         label: 'Desktop', value: desktopViews, color: theme.colors.success },
    { icon: 'tablet-portrait-outline', label: 'Tablet',  value: tabletViews,  color: theme.colors.accent  },
  ];

  return (
    <View style={styles.container}>
      {/* ── HERO HEADER ── */}
      <LinearGradient
        colors={theme.colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.white} />
            </TouchableOpacity>
            <View style={styles.heroTitles}>
              <Text style={styles.heroTitle}>Statistik</Text>
              <Text style={styles.heroSub} numberOfLines={1}>
                {invitation.bride_name} & {invitation.groom_name}
              </Text>
            </View>
            <View style={{ width: 38 }} />
          </View>

          {/* Big engagement number in hero */}
          <View style={styles.heroEngagement}>
            <Text style={styles.heroEngagementValue}>{engagementRate}%</Text>
            <Text style={styles.heroEngagementLabel}>Engagement Rate</Text>
            <Text style={styles.heroEngagementSub}>
              {rsvpsCount} dari {viewsCount} pengunjung mengirim ucapan
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── OVERVIEW 2×2 GRID ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OVERVIEW</Text>
          <View style={styles.overviewGrid}>
            {overviewStats.map((s) => (
              <View key={s.label} style={styles.overviewCard}>
                <View style={[styles.overviewIconBg, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={styles.overviewValue}>{s.value}</Text>
                <Text style={styles.overviewLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── ENGAGEMENT PROGRESS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>KONVERSI</Text>
          <View style={styles.card}>
            {/* Funnel: Views → RSVP */}
            <View style={styles.funnelRow}>
              <View style={styles.funnelItem}>
                <View style={[styles.funnelIconBg, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Ionicons name="eye-outline" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.funnelValue}>{viewsCount}</Text>
                <Text style={styles.funnelLabel}>Views</Text>
              </View>

              <View style={styles.funnelArrow}>
                <View style={styles.funnelArrowLine} />
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </View>

              <View style={styles.funnelItem}>
                <View style={[styles.funnelIconBg, { backgroundColor: theme.colors.success + '15' }]}>
                  <Ionicons name="chatbubble-outline" size={20} color={theme.colors.success} />
                </View>
                <Text style={styles.funnelValue}>{rsvpsCount}</Text>
                <Text style={styles.funnelLabel}>RSVP</Text>
              </View>

              <View style={styles.funnelArrow}>
                <View style={styles.funnelArrowLine} />
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </View>

              <View style={styles.funnelItem}>
                <View style={[styles.funnelIconBg, { backgroundColor: '#A855F715' }]}>
                  <Ionicons name="trending-up-outline" size={20} color="#A855F7" />
                </View>
                <Text style={[styles.funnelValue, { color: '#A855F7' }]}>{engagementRate}%</Text>
                <Text style={styles.funnelLabel}>Rate</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={theme.colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.min(parseFloat(engagementRate), 100)}%` }]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelLeft}>0%</Text>
              <Text style={styles.progressLabelRight}>100%</Text>
            </View>
          </View>
        </View>

        {/* ── DEVICE BREAKDOWN ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERANGKAT</Text>
          <View style={styles.card}>
            {deviceStats.map((d, index) => {
              const pct = totalDeviceViews > 0 ? Math.round((d.value / totalDeviceViews) * 100) : 0;
              return (
                <View key={d.label}>
                  <View style={styles.deviceRow}>
                    <View style={[styles.deviceIconBg, { backgroundColor: d.color + '15' }]}>
                      <Ionicons name={d.icon} size={18} color={d.color} />
                    </View>
                    <View style={styles.deviceInfo}>
                      <View style={styles.deviceTopRow}>
                        <Text style={styles.deviceLabel}>{d.label}</Text>
                        <Text style={styles.deviceCount}>{d.value} <Text style={styles.devicePct}>({pct}%)</Text></Text>
                      </View>
                      <View style={styles.deviceTrack}>
                        <View style={[styles.deviceFill, { width: `${pct}%`, backgroundColor: d.color }]} />
                      </View>
                    </View>
                  </View>
                  {index < deviceStats.length - 1 && <View style={styles.rowDivider} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── ACTIVITY ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AKTIVITAS</Text>
          <View style={styles.card}>
            <View style={styles.activityRow}>
              <View style={[styles.activityIconBg, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityLabel}>Terakhir dilihat</Text>
                <Text style={styles.activityValue}>{stats?.last_viewed_at || 'Belum pernah'}</Text>
              </View>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.activityRow}>
              <View style={[styles.activityIconBg, { backgroundColor: theme.colors.success + '15' }]}>
                <Ionicons name="chatbubble-outline" size={18} color={theme.colors.success} />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityLabel}>RSVP terakhir</Text>
                <Text style={styles.activityValue}>{stats?.last_rsvp_at || 'Belum ada RSVP'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // ── HERO ──
  hero: {},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  heroTitles: { flex: 1, alignItems: 'center' },
  heroTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  heroSub: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Big engagement in hero
  heroEngagement: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  heroEngagementValue: {
    fontSize: 56,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.white,
    lineHeight: 64,
  },
  heroEngagementLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  heroEngagementSub: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  // ── SCROLL ──
  scroll: { flex: 1 },
  scrollContent: { paddingTop: theme.spacing.lg },

  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },

  // ── CARD ──
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

  // ── OVERVIEW GRID ──
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  overviewCard: {
    width: '47.5%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  overviewIconBg: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  overviewValue: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  overviewLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },

  // ── FUNNEL ──
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  funnelItem: { alignItems: 'center', flex: 1 },
  funnelIconBg: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  funnelValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  funnelLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  funnelArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
  },
  funnelArrowLine: {
    width: 12, height: 1,
    backgroundColor: theme.colors.border,
  },

  // Progress
  progressTrack: {
    height: 10,
    backgroundColor: theme.colors.background,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  progressFill: { height: '100%', borderRadius: 5, minWidth: 4 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelLeft: { fontSize: 10, color: theme.colors.textTertiary },
  progressLabelRight: { fontSize: 10, color: theme.colors.textTertiary },

  // ── DEVICE ──
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  deviceIconBg: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  deviceInfo: { flex: 1 },
  deviceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deviceLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  deviceCount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  devicePct: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.regular,
    color: theme.colors.textSecondary,
  },
  deviceTrack: {
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deviceFill: { height: '100%', borderRadius: 4, minWidth: 4 },

  rowDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.xs,
  },

  // ── ACTIVITY ──
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  activityIconBg: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  activityText: { flex: 1 },
  activityLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 3,
  },
  activityValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});

export default StatisticsScreen;

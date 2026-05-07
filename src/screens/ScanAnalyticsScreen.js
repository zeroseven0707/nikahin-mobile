import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { guestService } from '../services/invitationService';

const CATEGORY_LABELS = { family: 'Keluarga', friend: 'Teman', colleague: 'Rekan' };
const CATEGORY_COLORS = {
  family:    theme.colors.primary,
  friend:    theme.colors.success,
  colleague: theme.colors.accent,
};

// ─── Mini bar chart ──────────────────────────────────────────────────────────
const HourBar = ({ hour, count, max, color }) => {
  const pct = max > 0 ? count / max : 0;
  return (
    <View style={barStyles.wrap}>
      <View style={barStyles.barBg}>
        <View style={[barStyles.barFill, { height: `${Math.max(pct * 100, 4)}%`, backgroundColor: color }]} />
      </View>
      <Text style={barStyles.label}>{hour}</Text>
    </View>
  );
};
const barStyles = StyleSheet.create({
  wrap:   { alignItems: 'center', flex: 1 },
  barBg:  { width: '70%', height: 60, backgroundColor: theme.colors.border, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill:{ width: '100%', borderRadius: 4 },
  label:  { fontSize: 9, color: theme.colors.textTertiary, marginTop: 3 },
});

// ─── Progress bar ────────────────────────────────────────────────────────────
const ProgressBar = ({ value, total, color }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={pbStyles.bg}>
      <View style={[pbStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
};
const pbStyles = StyleSheet.create({
  bg:   { height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});

// ─── Main screen ─────────────────────────────────────────────────────────────
const ScanAnalyticsScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState('checkin'); // 'checkin' | 'souvenir'

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      const res = await guestService.getScanAnalytics(token, invitation.id);
      setData(res.analytics);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading || !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="analytics-outline" size={48} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>Memuat analitik...</Text>
      </View>
    );
  }

  const hourData   = activeTab === 'checkin' ? data.check_in_by_hour : data.souvenir_by_hour;
  const maxHour    = Math.max(...Object.values(hourData), 1);
  const hourKeys   = Array.from({ length: 24 }, (_, i) => i);
  const activeColor = activeTab === 'checkin' ? theme.colors.success : '#A855F7';
  const activeGrad  = activeTab === 'checkin' ? ['#059669', '#10B981'] : ['#7C3AED', '#A855F7'];

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <LinearGradient colors={theme.colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Analitik Scan</Text>
              <Text style={styles.headerSub} numberOfLines={1}>{invitation.bride_name} & {invitation.groom_name}</Text>
            </View>
            <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
              <Ionicons name="refresh-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Hero stats */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{data.check_in_rate}%</Text>
              <Text style={styles.heroStatLabel}>Check-in Rate</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{data.checked_in}</Text>
              <Text style={styles.heroStatLabel}>Hadir</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{data.souvenir_taken}</Text>
              <Text style={styles.heroStatLabel}>Souvenir</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{data.total_guests}</Text>
              <Text style={styles.heroStatLabel}>Total Tamu</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
      >
        {/* ── Summary cards ── */}
        <View style={styles.summaryGrid}>
          {/* Check-in card */}
          <View style={[styles.summaryCard, { borderLeftColor: theme.colors.success }]}>
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.colors.success + '18' }]}>
                <Ionicons name="enter" size={20} color={theme.colors.success} />
              </View>
              <Text style={[styles.summaryNum, { color: theme.colors.success }]}>{data.checked_in}</Text>
            </View>
            <Text style={styles.summaryLabel}>Check-in</Text>
            <ProgressBar value={data.checked_in} total={data.total_guests} color={theme.colors.success} />
            <Text style={styles.summaryRate}>{data.check_in_rate}% dari total tamu</Text>
          </View>

          {/* Souvenir card */}
          <View style={[styles.summaryCard, { borderLeftColor: '#A855F7' }]}>
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIcon, { backgroundColor: '#A855F715' }]}>
                <Ionicons name="gift" size={20} color="#A855F7" />
              </View>
              <Text style={[styles.summaryNum, { color: '#A855F7' }]}>{data.souvenir_taken}</Text>
            </View>
            <Text style={styles.summaryLabel}>Souvenir Diambil</Text>
            <ProgressBar value={data.souvenir_taken} total={data.total_guests} color="#A855F7" />
            <Text style={styles.summaryRate}>{data.souvenir_rate}% dari total tamu</Text>
          </View>

          {/* Not checked-in */}
          <View style={[styles.summaryCard, { borderLeftColor: theme.colors.error }]}>
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.colors.error + '18' }]}>
                <Ionicons name="person-remove-outline" size={20} color={theme.colors.error} />
              </View>
              <Text style={[styles.summaryNum, { color: theme.colors.error }]}>{data.not_checked_in}</Text>
            </View>
            <Text style={styles.summaryLabel}>Belum Hadir</Text>
            <ProgressBar value={data.not_checked_in} total={data.total_guests} color={theme.colors.error} />
            <Text style={styles.summaryRate}>{data.total_guests > 0 ? ((data.not_checked_in / data.total_guests) * 100).toFixed(1) : 0}% dari total tamu</Text>
          </View>

          {/* Checked-in but no souvenir */}
          <View style={[styles.summaryCard, { borderLeftColor: theme.colors.warning }]}>
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.colors.warning + '18' }]}>
                <Ionicons name="gift-outline" size={20} color={theme.colors.warning} />
              </View>
              <Text style={[styles.summaryNum, { color: theme.colors.warning }]}>{data.checked_in_no_souvenir}</Text>
            </View>
            <Text style={styles.summaryLabel}>Hadir, Belum Souvenir</Text>
            <ProgressBar value={data.checked_in_no_souvenir} total={data.checked_in || 1} color={theme.colors.warning} />
            <Text style={styles.summaryRate}>{data.checked_in > 0 ? ((data.checked_in_no_souvenir / data.checked_in) * 100).toFixed(1) : 0}% dari yang hadir</Text>
          </View>
        </View>

        {/* ── Hourly chart ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Distribusi Per Jam</Text>
            {/* Tab toggle */}
            <View style={styles.tabToggle}>
              {['checkin', 'souvenir'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabBtn, activeTab === t && { backgroundColor: (t === 'checkin' ? theme.colors.success : '#A855F7') + '25', borderColor: t === 'checkin' ? theme.colors.success : '#A855F7' }]}
                  onPress={() => setActiveTab(t)}
                >
                  <Ionicons name={t === 'checkin' ? 'enter-outline' : 'gift-outline'} size={13} color={activeTab === t ? (t === 'checkin' ? theme.colors.success : '#A855F7') : theme.colors.textSecondary} />
                  <Text style={[styles.tabBtnText, activeTab === t && { color: t === 'checkin' ? theme.colors.success : '#A855F7', fontWeight: theme.fontWeight.semibold }]}>
                    {t === 'checkin' ? 'Check-in' : 'Souvenir'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chartCard}>
            {Object.values(hourData).every(v => v === 0) ? (
              <View style={styles.emptyChart}>
                <Ionicons name="bar-chart-outline" size={36} color={theme.colors.border} />
                <Text style={styles.emptyChartText}>Belum ada data</Text>
              </View>
            ) : (
              <View style={styles.barChart}>
                {hourKeys.map(h => (
                  <HourBar key={h} hour={h} count={hourData[h] || 0} max={maxHour} color={activeColor} />
                ))}
              </View>
            )}
            <Text style={styles.chartCaption}>Jam (0–23)</Text>
          </View>
        </View>

        {/* ── Per category ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Per Kategori Tamu</Text>
          <View style={styles.card}>
            {Object.entries(data.by_category).map(([cat, stats]) => {
              if (stats.total === 0) return null;
              const color = CATEGORY_COLORS[cat] || theme.colors.primary;
              return (
                <View key={cat} style={styles.catRow}>
                  <View style={[styles.catDot, { backgroundColor: color }]} />
                  <View style={styles.catInfo}>
                    <View style={styles.catTopRow}>
                      <Text style={styles.catLabel}>{CATEGORY_LABELS[cat]}</Text>
                      <Text style={styles.catTotal}>{stats.total} tamu</Text>
                    </View>
                    <View style={styles.catBars}>
                      <View style={styles.catBarRow}>
                        <Ionicons name="enter-outline" size={11} color={theme.colors.success} />
                        <View style={styles.catBarWrap}>
                          <ProgressBar value={stats.checked_in} total={stats.total} color={theme.colors.success} />
                        </View>
                        <Text style={styles.catBarNum}>{stats.checked_in}</Text>
                      </View>
                      <View style={styles.catBarRow}>
                        <Ionicons name="gift-outline" size={11} color="#A855F7" />
                        <View style={styles.catBarWrap}>
                          <ProgressBar value={stats.souvenir} total={stats.total} color="#A855F7" />
                        </View>
                        <Text style={styles.catBarNum}>{stats.souvenir}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Recent activity ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          <View style={styles.card}>
            {data.recent_activity.length === 0 ? (
              <View style={styles.emptyActivity}>
                <Ionicons name="time-outline" size={32} color={theme.colors.border} />
                <Text style={styles.emptyActivityText}>Belum ada aktivitas</Text>
              </View>
            ) : (
              data.recent_activity.map((item, idx) => {
                const isCheckin  = item.event === 'checkin';
                const evColor    = isCheckin ? theme.colors.success : '#A855F7';
                const evIcon     = isCheckin ? 'enter' : 'gift';
                const evLabel    = isCheckin ? 'Check-in' : 'Souvenir';
                const catColor   = CATEGORY_COLORS[item.category] || theme.colors.primary;
                return (
                  <View key={`${item.id}-${item.event}`} style={[styles.activityRow, idx > 0 && styles.activityRowBorder]}>
                    <View style={[styles.activityIcon, { backgroundColor: evColor + '18' }]}>
                      <Ionicons name={evIcon} size={16} color={evColor} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{item.name}</Text>
                      <View style={styles.activityMeta}>
                        <View style={[styles.activityCatDot, { backgroundColor: catColor }]} />
                        <Text style={styles.activityCat}>{CATEGORY_LABELS[item.category]}</Text>
                        <Text style={styles.activitySep}>·</Text>
                        <Text style={[styles.activityEvent, { color: evColor }]}>{evLabel}</Text>
                      </View>
                    </View>
                    <Text style={styles.activityTime}>
                      {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={{ height: theme.spacing.xxxl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: { paddingBottom: theme.spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm, gap: theme.spacing.md },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Hero stats
  heroStats: { flexDirection: 'row', paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, justifyContent: 'space-between' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatNum: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2, textAlign: 'center' },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  scrollContent: { padding: theme.spacing.lg, gap: theme.spacing.lg },

  // Summary grid
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  summaryCard: {
    width: '48%', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md, borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    gap: 6,
  },
  summaryCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  summaryNum: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold },
  summaryLabel: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },
  summaryRate: { fontSize: 10, color: theme.colors.textTertiary, marginTop: 2 },

  // Section
  section: { gap: theme.spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },

  // Tab toggle
  tabToggle: { flexDirection: 'row', gap: 6 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border },
  tabBtnText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },

  // Chart
  chartCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2 },
  chartCaption: { fontSize: 10, color: theme.colors.textTertiary, textAlign: 'center', marginTop: 8 },
  emptyChart: { height: 80, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyChartText: { fontSize: theme.fontSize.sm, color: theme.colors.textTertiary },

  // Card
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },

  // Category rows
  catRow: { flexDirection: 'row', gap: theme.spacing.sm, paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
  catDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  catInfo: { flex: 1, gap: 6 },
  catTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catLabel: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  catTotal: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary },
  catBars: { gap: 4 },
  catBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catBarWrap: { flex: 1 },
  catBarNum: { fontSize: 11, color: theme.colors.textSecondary, minWidth: 20, textAlign: 'right' },

  // Activity
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.sm },
  activityRowBorder: { borderTopWidth: 1, borderTopColor: theme.colors.divider },
  activityIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1 },
  activityName: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  activityCatDot: { width: 6, height: 6, borderRadius: 3 },
  activityCat: { fontSize: 11, color: theme.colors.textSecondary },
  activitySep: { fontSize: 11, color: theme.colors.textTertiary },
  activityEvent: { fontSize: 11, fontWeight: theme.fontWeight.semibold },
  activityTime: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary },

  // Empty
  emptyActivity: { alignItems: 'center', paddingVertical: theme.spacing.lg, gap: 8 },
  emptyActivityText: { fontSize: theme.fontSize.sm, color: theme.colors.textTertiary },
});

export default ScanAnalyticsScreen;

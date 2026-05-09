import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { guestService } from '../services/invitationService';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS = { family: 'Keluarga', friend: 'Teman', colleague: 'Rekan' };
const CATEGORY_COLORS = {
  family:    theme.colors.primary,
  friend:    theme.colors.success,
  colleague: theme.colors.accent,
};

// ─── Mini bar chart ───────────────────────────────────────────────────────────
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
  wrap:    { alignItems: 'center', flex: 1 },
  barBg:   { width: '70%', height: 60, backgroundColor: theme.colors.border, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 4 },
  label:   { fontSize: 9, color: theme.colors.textTertiary, marginTop: 3 },
});

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value, total, color }) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
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

// ─── Toggle row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ icon, iconColor, iconBg, title, desc, value, onToggle, disabled }) => (
  <View style={[toggleStyles.row, disabled && toggleStyles.rowDisabled]}>
    <View style={[toggleStyles.iconBg, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View style={toggleStyles.info}>
      <Text style={[toggleStyles.title, disabled && toggleStyles.titleDisabled]}>{title}</Text>
      <Text style={toggleStyles.desc}>{desc}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: theme.colors.border, true: iconColor + '60' }}
      thumbColor={value ? iconColor : theme.colors.textTertiary}
      ios_backgroundColor={theme.colors.border}
    />
  </View>
);
const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  rowDisabled: { opacity: 0.45 },
  iconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  info: { flex: 1 },
  title: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  titleDisabled: { color: theme.colors.textSecondary },
  desc: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 16 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ScanHubScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();

  // ── Scan feature toggles ──
  const [scanCheckin,   setScanCheckin]   = useState(true);
  const [scanSouvenir,  setScanSouvenir]  = useState(true);
  const [scanCheckout,  setScanCheckout]  = useState(false);
  const [multiSouvenir, setMultiSouvenir] = useState(false);

  // ── Analytics data ──
  const [data,       setData]       = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState('checkin'); // 'checkin' | 'souvenir' | 'checkout'

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    try {
      const res = await guestService.getScanAnalytics(token, invitation.id);
      setData(res.analytics);
    } catch (_) {}
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  // ── Build active modes for scanner ──
  const buildScanModes = () => {
    const modes = [];
    if (scanCheckin)  modes.push('checkin');
    if (scanSouvenir) modes.push('souvenir');
    if (scanCheckout) modes.push('checkout');
    return modes;
  };

  const canStartScan = scanCheckin || scanSouvenir || scanCheckout;

  const handleStartScan = () => {
    if (!canStartScan) return;
    navigation.navigate('QrScanner', {
      invitation,
      activeModes:  buildScanModes(),
      multiSouvenir,
    });
  };

  // ── Derived stats ──
  const total      = data?.total_guests          ?? 0;
  const checkedIn  = data?.checked_in            ?? 0;
  const checkedOut = data?.checked_out           ?? 0;
  const souvenir   = data?.souvenir_taken         ?? 0;
  const notIn      = data?.not_checked_in         ?? 0;
  const noSouvenir = data?.checked_in_no_souvenir ?? 0;
  const ciRate     = data?.check_in_rate          ?? 0;
  const svRate     = data?.souvenir_rate          ?? 0;
  const coRate     = data?.check_out_rate         ?? 0;

  // ── Hourly chart ──
  const hourData = activeTab === 'checkin'
    ? (data?.check_in_by_hour  ?? {})
    : activeTab === 'souvenir'
    ? (data?.souvenir_by_hour  ?? {})
    : (data?.check_out_by_hour ?? {});
  const maxHour   = Math.max(...Object.values(hourData), 1);
  const hourKeys  = Array.from({ length: 24 }, (_, i) => i);
  const activeColor = activeTab === 'checkin'
    ? theme.colors.success
    : activeTab === 'souvenir'
    ? '#A855F7'
    : theme.colors.warning;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <LinearGradient
        colors={['#4C1D95', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Pusat Scan QR</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {invitation.bride_name} & {invitation.groom_name}
              </Text>
            </View>
            <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
              <Ionicons name="refresh-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Hero rate pills */}
          <View style={styles.heroPills}>
            <View style={styles.heroPill}>
              <Ionicons name="enter" size={13} color="#4ADE80" />
              <Text style={styles.heroPillNum}>{checkedIn}</Text>
              <Text style={styles.heroPillLabel}>Check-in</Text>
              <Text style={styles.heroPillRate}>{ciRate}%</Text>
            </View>
            <View style={styles.heroPillDivider} />
            <View style={styles.heroPill}>
              <Ionicons name="gift" size={13} color="#C084FC" />
              <Text style={styles.heroPillNum}>{souvenir}</Text>
              <Text style={styles.heroPillLabel}>Souvenir</Text>
              <Text style={styles.heroPillRate}>{svRate}%</Text>
            </View>
            <View style={styles.heroPillDivider} />
            <View style={styles.heroPill}>
              <Ionicons name="exit" size={13} color="#FCD34D" />
              <Text style={styles.heroPillNum}>{checkedOut}</Text>
              <Text style={styles.heroPillLabel}>Check-out</Text>
              <Text style={styles.heroPillRate}>{coRate}%</Text>
            </View>
            <View style={styles.heroPillDivider} />
            <View style={styles.heroPill}>
              <Ionicons name="people" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroPillNum}>{total}</Text>
              <Text style={styles.heroPillLabel}>Total Tamu</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7C3AED']}
            tintColor="#7C3AED"
          />
        }
      >
        {/* ── Scan Settings ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Pengaturan Fitur Scan</Text>
          </View>
          <View style={styles.card}>
            <ToggleRow
              icon="enter-outline"
              iconColor={theme.colors.success}
              iconBg={theme.colors.success + '18'}
              title="Scan Check-in"
              desc="Verifikasi kehadiran tamu saat tiba di acara"
              value={scanCheckin}
              onToggle={setScanCheckin}
            />
            <ToggleRow
              icon="gift-outline"
              iconColor="#A855F7"
              iconBg="#A855F718"
              title="Scan Souvenir"
              desc="Catat pengambilan souvenir oleh tamu"
              value={scanSouvenir}
              onToggle={setScanSouvenir}
            />
            <ToggleRow
              icon="exit-outline"
              iconColor={theme.colors.warning}
              iconBg={theme.colors.warning + '18'}
              title="Scan Check-out"
              desc="Catat waktu tamu meninggalkan acara"
              value={scanCheckout}
              onToggle={setScanCheckout}
            />
            <View style={{ borderBottomWidth: 0 }}>
              <ToggleRow
                icon="repeat-outline"
                iconColor="#EC4899"
                iconBg="#EC489918"
                title="Souvenir Ganda"
                desc="Izinkan scan souvenir 2× (misal: souvenir + hampers terpisah)"
                value={multiSouvenir}
                onToggle={setMultiSouvenir}
                disabled={!scanSouvenir}
              />
            </View>
          </View>
        </View>

        {/* ── Start Scan CTA ── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.startBtn, !canStartScan && styles.startBtnDisabled]}
            onPress={handleStartScan}
            disabled={!canStartScan}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canStartScan ? ['#4C1D95', '#7C3AED'] : [theme.colors.border, theme.colors.border]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtnGrad}
            >
              <View style={styles.startBtnIcon}>
                <Ionicons name="qr-code" size={26} color="#fff" />
              </View>
              <View style={styles.startBtnText}>
                <Text style={styles.startBtnTitle}>
                  {canStartScan ? 'Mulai Scan' : 'Aktifkan minimal 1 fitur'}
                </Text>
                {canStartScan && (
                  <Text style={styles.startBtnSub}>
                    {buildScanModes().map(m =>
                      m === 'checkin' ? 'Check-in' : m === 'souvenir' ? 'Souvenir' : 'Check-out'
                    ).join(' · ')}
                    {multiSouvenir && scanSouvenir ? ' · Souvenir Ganda' : ''}
                  </Text>
                )}
              </View>
              {canStartScan && (
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════════════════════════════════════════
            ANALITIK LENGKAP
        ══════════════════════════════════════════════════════════════════════ */}

        {/* ── Analytics section header ── */}
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.sectionTitle}>Analitik Scan</Text>
        </View>

        {/* ── Summary cards 2×2 + checkout full-width ── */}
        <View style={styles.summaryGrid}>
          {/* Check-in */}
          <View style={[styles.summaryCard, { borderLeftColor: theme.colors.success }]}>
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.colors.success + '18' }]}>
                <Ionicons name="enter" size={20} color={theme.colors.success} />
              </View>
              <Text style={[styles.summaryNum, { color: theme.colors.success }]}>{checkedIn}</Text>
            </View>
            <Text style={styles.summaryLabel}>Check-in</Text>
            <ProgressBar value={checkedIn} total={total} color={theme.colors.success} />
            <Text style={styles.summaryRate}>{ciRate}% dari total tamu</Text>
          </View>

          {/* Souvenir */}
          <View style={[styles.summaryCard, { borderLeftColor: '#A855F7' }]}>
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIcon, { backgroundColor: '#A855F715' }]}>
                <Ionicons name="gift" size={20} color="#A855F7" />
              </View>
              <Text style={[styles.summaryNum, { color: '#A855F7' }]}>{souvenir}</Text>
            </View>
            <Text style={styles.summaryLabel}>Souvenir Diambil</Text>
            <ProgressBar value={souvenir} total={total} color="#A855F7" />
            <Text style={styles.summaryRate}>{svRate}% dari total tamu</Text>
          </View>

          {/* Belum Hadir */}
          <View style={[styles.summaryCard, { borderLeftColor: theme.colors.error }]}>
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.colors.error + '18' }]}>
                <Ionicons name="person-remove-outline" size={20} color={theme.colors.error} />
              </View>
              <Text style={[styles.summaryNum, { color: theme.colors.error }]}>{notIn}</Text>
            </View>
            <Text style={styles.summaryLabel}>Belum Hadir</Text>
            <ProgressBar value={notIn} total={total} color={theme.colors.error} />
            <Text style={styles.summaryRate}>
              {total > 0 ? ((notIn / total) * 100).toFixed(1) : 0}% dari total tamu
            </Text>
          </View>

          {/* Hadir Belum Souvenir */}
          <View style={[styles.summaryCard, { borderLeftColor: theme.colors.warning }]}>
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.colors.warning + '18' }]}>
                <Ionicons name="gift-outline" size={20} color={theme.colors.warning} />
              </View>
              <Text style={[styles.summaryNum, { color: theme.colors.warning }]}>{noSouvenir}</Text>
            </View>
            <Text style={styles.summaryLabel}>Hadir, Belum Souvenir</Text>
            <ProgressBar value={noSouvenir} total={checkedIn || 1} color={theme.colors.warning} />
            <Text style={styles.summaryRate}>
              {checkedIn > 0 ? ((noSouvenir / checkedIn) * 100).toFixed(1) : 0}% dari yang hadir
            </Text>
          </View>

          {/* Check-out — full width */}
          <View style={[styles.summaryCard, styles.summaryCardFull, { borderLeftColor: '#F59E0B' }]}>
            <View style={styles.summaryCardTop}>
              <View style={[styles.summaryIcon, { backgroundColor: '#F59E0B18' }]}>
                <Ionicons name="exit" size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.summaryNum, { color: '#F59E0B' }]}>{checkedOut}</Text>
            </View>
            <Text style={styles.summaryLabel}>Check-out</Text>
            <ProgressBar value={checkedOut} total={checkedIn || 1} color="#F59E0B" />
            <Text style={styles.summaryRate}>{coRate}% dari yang hadir</Text>
          </View>
        </View>

        {/* ── Hourly chart ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { flex: 1 }]}>Distribusi Per Jam</Text>
            <View style={styles.tabToggle}>
              {[
                { key: 'checkin',  label: 'Check-in',  icon: 'enter-outline', color: theme.colors.success },
                { key: 'souvenir', label: 'Souvenir',  icon: 'gift-outline',  color: '#A855F7' },
                { key: 'checkout', label: 'Check-out', icon: 'exit-outline',  color: theme.colors.warning },
              ].map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.tabBtn,
                    activeTab === t.key && { backgroundColor: t.color + '25', borderColor: t.color },
                  ]}
                  onPress={() => setActiveTab(t.key)}
                >
                  <Ionicons
                    name={t.icon}
                    size={13}
                    color={activeTab === t.key ? t.color : theme.colors.textSecondary}
                  />
                  <Text style={[
                    styles.tabBtnText,
                    activeTab === t.key && { color: t.color, fontWeight: theme.fontWeight.semibold },
                  ]}>
                    {t.label}
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

        {/* ── Per kategori tamu ── */}
        {data?.by_category && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleDark}>Per Kategori Tamu</Text>
            <View style={styles.analyticsCard}>
              {Object.entries(data.by_category).map(([cat, catStats]) => {
                if (catStats.total === 0) return null;
                const color = CATEGORY_COLORS[cat] || theme.colors.primary;
                return (
                  <View key={cat} style={styles.catRow}>
                    <View style={[styles.catDot, { backgroundColor: color }]} />
                    <View style={styles.catInfo}>
                      <View style={styles.catTopRow}>
                        <Text style={styles.catLabel}>{CATEGORY_LABELS[cat] ?? cat}</Text>
                        <Text style={styles.catTotal}>{catStats.total} tamu</Text>
                      </View>
                      <View style={styles.catBars}>
                        <View style={styles.catBarRow}>
                          <Ionicons name="enter-outline" size={11} color={theme.colors.success} />
                          <View style={styles.catBarWrap}>
                            <ProgressBar value={catStats.checked_in} total={catStats.total} color={theme.colors.success} />
                          </View>
                          <Text style={styles.catBarNum}>{catStats.checked_in}</Text>
                        </View>
                        <View style={styles.catBarRow}>
                          <Ionicons name="gift-outline" size={11} color="#A855F7" />
                          <View style={styles.catBarWrap}>
                            <ProgressBar value={catStats.souvenir} total={catStats.total} color="#A855F7" />
                          </View>
                          <Text style={styles.catBarNum}>{catStats.souvenir}</Text>
                        </View>
                        {catStats.checked_out !== undefined && (
                          <View style={styles.catBarRow}>
                            <Ionicons name="exit-outline" size={11} color={theme.colors.warning} />
                            <View style={styles.catBarWrap}>
                              <ProgressBar value={catStats.checked_out} total={catStats.total} color={theme.colors.warning} />
                            </View>
                            <Text style={styles.catBarNum}>{catStats.checked_out}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Aktivitas terbaru ── */}
        {data?.recent_activity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleDark}>Aktivitas Terbaru</Text>
            <View style={styles.analyticsCard}>
              {data.recent_activity.length === 0 ? (
                <View style={styles.emptyActivity}>
                  <Ionicons name="time-outline" size={32} color={theme.colors.border} />
                  <Text style={styles.emptyActivityText}>Belum ada aktivitas</Text>
                </View>
              ) : (
                data.recent_activity.map((item, idx) => {
                  const isCheckin  = item.event === 'checkin';
                  const isCheckout = item.event === 'checkout';
                  const evColor    = isCheckin ? theme.colors.success : isCheckout ? theme.colors.warning : '#A855F7';
                  const evIcon     = isCheckin ? 'enter' : isCheckout ? 'exit' : 'gift';
                  const evLabel    = isCheckin ? 'Check-in' : isCheckout ? 'Check-out' : 'Souvenir';
                  const catColor   = CATEGORY_COLORS[item.category] || theme.colors.primary;
                  return (
                    <View
                      key={`${item.id}-${item.event}`}
                      style={[styles.activityRow, idx > 0 && styles.activityRowBorder]}
                    >
                      <View style={[styles.activityIcon, { backgroundColor: evColor + '18' }]}>
                        <Ionicons name={evIcon} size={16} color={evColor} />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{item.name}</Text>
                        <View style={styles.activityMeta}>
                          <View style={[styles.activityCatDot, { backgroundColor: catColor }]} />
                          <Text style={styles.activityCat}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
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
        )}

        {/* ── Info box ── */}
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={theme.colors.info}
              style={{ flexShrink: 0, marginTop: 1 }}
            />
            <Text style={styles.infoText}>
              Aktifkan fitur yang dibutuhkan, lalu tekan <Text style={styles.infoBold}>Mulai Scan</Text>. Scanner akan menampilkan mode yang aktif saja. Fitur <Text style={styles.infoBold}>Souvenir Ganda</Text> memungkinkan tamu scan souvenir 2 kali — cocok untuk acara dengan 2 jenis souvenir berbeda.
            </Text>
          </View>
        </View>

        <View style={{ height: theme.spacing.xxxl }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: { paddingBottom: theme.spacing.md },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Hero pills
  heroPills: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  heroPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4,
  },
  heroPillDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  heroPillNum: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: '#fff' },
  heroPillLabel: { fontSize: 9, color: 'rgba(255,255,255,0.65)' },
  heroPillRate: {
    fontSize: 9, color: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 5,
  },

  scrollContent: { padding: theme.spacing.lg, gap: theme.spacing.lg },

  // Section
  section: { gap: theme.spacing.sm },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  sectionTitle: {
    flex: 1,
    fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  sectionTitleDark: {
    fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },

  // Card (toggle settings)
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Analytics card (white card for category / activity)
  analyticsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  // Start scan button
  startBtn: { borderRadius: theme.borderRadius.xl, overflow: 'hidden' },
  startBtnDisabled: { opacity: 0.6 },
  startBtnGrad: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  startBtnIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  startBtnText: { flex: 1 },
  startBtnTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: '#fff' },
  startBtnSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 3 },

  // Summary cards grid
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  summaryCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryCardFull: { width: '100%' },
  summaryCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  summaryNum: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold },
  summaryLabel: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },
  summaryRate: { fontSize: 10, color: theme.colors.textTertiary, marginTop: 2 },

  // Tab toggle (hourly chart)
  tabToggle: { flexDirection: 'row', gap: 5 },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  tabBtnText: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },

  // Chart
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2 },
  chartCaption: { fontSize: 10, color: theme.colors.textTertiary, textAlign: 'center', marginTop: 8 },
  emptyChart: { height: 80, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyChartText: { fontSize: theme.fontSize.sm, color: theme.colors.textTertiary },

  // Category rows
  catRow: {
    flexDirection: 'row', gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
  },
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

  // Empty states
  emptyActivity: { alignItems: 'center', paddingVertical: theme.spacing.lg, gap: 8 },
  emptyActivityText: { fontSize: theme.fontSize.sm, color: theme.colors.textTertiary },

  // Info box
  infoBox: {
    flexDirection: 'row', gap: theme.spacing.sm,
    backgroundColor: theme.colors.info + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.info + '25',
  },
  infoText: { flex: 1, fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, lineHeight: 18 },
  infoBold: { fontWeight: theme.fontWeight.bold, color: theme.colors.text },
});

export default ScanHubScreen;

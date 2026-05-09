import React, { useState, useEffect, useCallback } from 'react';
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
  bg:   { height: 5, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});

// ─── Stat mini card ───────────────────────────────────────────────────────────
const StatCard = ({ icon, color, value, label, sub }) => (
  <View style={[statStyles.card, { borderLeftColor: color }]}>
    <View style={[statStyles.iconBg, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={[statStyles.value, { color }]}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
    {sub ? <Text style={statStyles.sub}>{sub}</Text> : null}
  </View>
);
const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBg: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  value: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold },
  label: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },
  sub:   { fontSize: 10, color: theme.colors.textTertiary },
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
  const [multiSouvenir, setMultiSouvenir] = useState(false); // allow 2nd souvenir scan

  // ── Live stats ──
  const [stats,      setStats]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  const loadStats = async () => {
    try {
      const res = await guestService.getScanAnalytics(token, invitation.id);
      setStats(res.analytics);
    } catch (_) {}
  };

  const onRefresh = async () => { setRefreshing(true); await loadStats(); setRefreshing(false); };

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
      activeModes:    buildScanModes(),
      multiSouvenir,
    });
  };

  const total     = stats?.total_guests   ?? 0;
  const checkedIn = stats?.checked_in     ?? 0;
  const souvenir  = stats?.souvenir_taken ?? 0;
  const notIn     = stats?.not_checked_in ?? 0;
  const ciRate    = stats?.check_in_rate  ?? 0;
  const svRate    = stats?.souvenir_rate  ?? 0;

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
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigation.navigate('ScanAnalytics', { invitation })}
            >
              <Ionicons name="analytics-outline" size={20} color="#fff" />
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
            {/* Multi souvenir — hanya aktif jika souvenir scan ON */}
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

        {/* ── Live Dashboard ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pulse-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Dashboard Tracking</Text>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => navigation.navigate('ScanAnalytics', { invitation })}
            >
              <Text style={styles.seeAllText}>Lihat Detail</Text>
              <Ionicons name="chevron-forward" size={13} color="#7C3AED" />
            </TouchableOpacity>
          </View>

          {/* Stat cards 2×2 */}
          <View style={styles.statsRow}>
            <StatCard
              icon="enter"
              color={theme.colors.success}
              value={checkedIn}
              label="Check-in"
              sub={`${ciRate}% dari total`}
            />
            <StatCard
              icon="gift"
              color="#A855F7"
              value={souvenir}
              label="Souvenir"
              sub={`${svRate}% dari total`}
            />
          </View>
          <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
            <StatCard
              icon="person-remove-outline"
              color={theme.colors.error}
              value={notIn}
              label="Belum Hadir"
              sub={total > 0 ? `${((notIn / total) * 100).toFixed(0)}% dari total` : '-'}
            />
            <StatCard
              icon="people"
              color={theme.colors.primary}
              value={total}
              label="Total Tamu"
            />
          </View>

          {/* Progress bars */}
          {total > 0 && (
            <View style={[styles.card, { marginTop: theme.spacing.md, gap: theme.spacing.md }]}>
              <View style={styles.progressRow}>
                <View style={styles.progressLabel}>
                  <Ionicons name="enter-outline" size={13} color={theme.colors.success} />
                  <Text style={styles.progressLabelText}>Check-in</Text>
                </View>
                <ProgressBar value={checkedIn} total={total} color={theme.colors.success} />
                <Text style={[styles.progressPct, { color: theme.colors.success }]}>{ciRate}%</Text>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressLabel}>
                  <Ionicons name="gift-outline" size={13} color="#A855F7" />
                  <Text style={styles.progressLabelText}>Souvenir</Text>
                </View>
                <ProgressBar value={souvenir} total={total} color="#A855F7" />
                <Text style={[styles.progressPct, { color: '#A855F7' }]}>{svRate}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          </View>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => navigation.navigate('GuestList', { invitation })}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: theme.colors.success + '18' }]}>
                <Ionicons name="people-outline" size={22} color={theme.colors.success} />
              </View>
              <Text style={styles.quickLabel}>Daftar Tamu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => navigation.navigate('ScanAnalytics', { invitation })}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#7C3AED18' }]}>
                <Ionicons name="analytics-outline" size={22} color="#7C3AED" />
              </View>
              <Text style={styles.quickLabel}>Analitik</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => navigation.navigate('RsvpList', { invitation })}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: theme.colors.info + '18' }]}>
                <Ionicons name="chatbubbles-outline" size={22} color={theme.colors.info} />
              </View>
              <Text style={styles.quickLabel}>RSVP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => navigation.navigate('Statistics', { invitation })}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: theme.colors.accent + '18' }]}>
                <Ionicons name="stats-chart-outline" size={22} color={theme.colors.accent} />
              </View>
              <Text style={styles.quickLabel}>Statistik</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Info box ── */}
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.info} style={{ flexShrink: 0, marginTop: 1 }} />
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
    gap: 0,
  },
  heroPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5,
  },
  heroPillDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  heroPillNum: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: '#fff' },
  heroPillLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)' },
  heroPillRate: {
    fontSize: 10, color: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: 6,
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
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: theme.fontSize.sm, color: '#7C3AED', fontWeight: theme.fontWeight.semibold },

  // Card
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

  // Stats
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm },

  // Progress
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  progressLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 80 },
  progressLabelText: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },
  progressPct: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, minWidth: 36, textAlign: 'right' },

  // Quick actions
  quickGrid: { flexDirection: 'row', gap: theme.spacing.sm },
  quickBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 11, color: theme.colors.text, fontWeight: theme.fontWeight.medium, textAlign: 'center' },

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

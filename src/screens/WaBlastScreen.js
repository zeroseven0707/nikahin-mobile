
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Animated, AppState, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { guestService } from '../services/invitationService';
import { API_BASE_URL } from '../config/api';

// ─── Constants ───────────────────────────────────────────────────────────────
const WA_GREEN = '#25D366';
const WA_DARK  = '#128C7E';

const CATEGORY_CONFIG = {
  family:    { label: 'Keluarga', color: theme.colors.primary },
  friend:    { label: 'Teman',    color: theme.colors.success },
  colleague: { label: 'Rekan',    color: theme.colors.accent },
};

const FILTER_OPTIONS = [
  { key: 'all',        label: 'Semua' },
  { key: 'unsent',     label: 'Belum Dikirim' },
  { key: 'family',     label: 'Keluarga' },
  { key: 'friend',     label: 'Teman' },
  { key: 'colleague',  label: 'Rekan' },
  { key: 'no_phone',   label: 'Tanpa Nomor' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name) => {
  const parts = (name || '').trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (name || '?').substring(0, 2).toUpperCase();
};

const buildWaMessage = (guest, invitation, baseUrl) => {
  const guestUrl = guest.qr_token
    ? `${baseUrl}/i/${invitation.unique_url}?to=${encodeURIComponent(guest.qr_token)}`
    : `${baseUrl}/i/${invitation.unique_url}`;
  const dateStr = new Date(invitation.reception_date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return (
    `🎊 *Undangan Pernikahan* 🎊\n\n` +
    `Kepada Yth.\n*${guest.name}*\n\n` +
    `${invitation.bride_name} & ${invitation.groom_name}\n\n` +
    `📅 ${dateStr}\n` +
    `📍 ${invitation.reception_location || ''}\n\n` +
    `🔗 ${guestUrl}\n\n` +
    `Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari istimewa kami. Terima kasih! 💕`
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WaBlastScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();
  const baseUrl = API_BASE_URL.replace('/api', '');

  // ── State ──
  const [guests, setGuests]           = useState([]);
  const [filter, setFilter]           = useState('all');
  const [search, setSearch]           = useState('');
  const [sentIds, setSentIds]         = useState(new Set());   // persisted in session
  const [blasting, setBlasting]       = useState(false);
  const [blastQueue, setBlastQueue]   = useState([]);          // guests to blast
  const [blastIndex, setBlastIndex]   = useState(0);          // current position
  const [alert, setAlert]             = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  // Animated progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  // AppState ref to detect return from WhatsApp
  const appStateRef  = useRef(AppState.currentState);
  const blastingRef  = useRef(false);
  const queueRef     = useRef([]);
  const indexRef     = useRef(0);

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  // ── Load guests ──
  useFocusEffect(useCallback(() => { loadGuests(); }, []));

  const loadGuests = async () => {
    try {
      const res = await guestService.getGuests(token, invitation.id);
      setGuests(res.guests || res.data || []);
    } catch (_) {}
  };

  // ── Filtered list ──
  const filtered = guests.filter(g => {
    const matchSearch = !search.trim() || g.name.toLowerCase().includes(search.toLowerCase());
    let matchFilter = true;
    if (filter === 'unsent')   matchFilter = !sentIds.has(g.id);
    else if (filter === 'no_phone') matchFilter = !g.whatsapp_number && !g.phone;
    else if (['family','friend','colleague'].includes(filter)) matchFilter = g.category === filter;
    return matchSearch && matchFilter;
  });

  const withPhone    = filtered.filter(g => g.whatsapp_number || g.phone);
  const withoutPhone = filtered.filter(g => !g.whatsapp_number && !g.phone);

  // ── Progress animation ──
  useEffect(() => {
    if (blastQueue.length === 0) return;
    const pct = blastIndex / blastQueue.length;
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [blastIndex, blastQueue.length]);

  // ── AppState listener — detect return from WA ──
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      // User came back from background (WhatsApp) to foreground
      if (prev === 'background' && nextState === 'active' && blastingRef.current) {
        // Mark current as sent, advance to next
        const currentGuest = queueRef.current[indexRef.current];
        if (currentGuest) {
          setSentIds(prev => new Set([...prev, currentGuest.id]));
        }
        const nextIndex = indexRef.current + 1;
        indexRef.current = nextIndex;
        setBlastIndex(nextIndex);

        if (nextIndex >= queueRef.current.length) {
          // Done
          blastingRef.current = false;
          setBlasting(false);
          showAlert(
            'Blast Selesai! 🎉',
            `${queueRef.current.length} undangan berhasil dikirim via WhatsApp.`,
            'success',
            [{ text: 'OK', style: 'primary' }]
          );
        } else {
          // Open next WA
          setTimeout(() => openWhatsApp(queueRef.current[nextIndex]), 600);
        }
      }
    });
    return () => sub.remove();
  }, []);

  // ── Open WhatsApp for a guest ──
  const openWhatsApp = async (guest) => {
    const msg   = buildWaMessage(guest, invitation, baseUrl);
    const phone = (guest.whatsapp_number || guest.phone || '').replace(/\D/g, '');
    const waUrl = `whatsapp://send?text=${encodeURIComponent(msg)}${phone ? `&phone=${phone}` : ''}`;

    try {
      const canOpen = await Linking.canOpenURL(waUrl);
      if (!canOpen) {
        // WA not installed — skip this guest
        const nextIndex = indexRef.current + 1;
        indexRef.current = nextIndex;
        setBlastIndex(nextIndex);
        if (nextIndex < queueRef.current.length) {
          setTimeout(() => openWhatsApp(queueRef.current[nextIndex]), 300);
        } else {
          blastingRef.current = false;
          setBlasting(false);
        }
        return;
      }
      await Linking.openURL(waUrl);
    } catch (_) {}
  };

  // ── Start blast ──
  const handleStartBlast = () => {
    const queue = withPhone.filter(g => !sentIds.has(g.id));
    if (queue.length === 0) {
      showAlert('Tidak Ada Tamu', 'Semua tamu sudah dikirim atau tidak ada nomor WA.', 'warning');
      return;
    }

    showAlert(
      'Mulai WA Blast?',
      `App akan membuka WhatsApp untuk ${queue.length} tamu satu per satu.\n\nSetelah tap Kirim di WA, kembali ke app untuk lanjut ke tamu berikutnya.`,
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Mulai',
          style: 'primary',
          onPress: () => {
            queueRef.current  = queue;
            indexRef.current  = 0;
            blastingRef.current = true;
            setBlastQueue(queue);
            setBlastIndex(0);
            setBlasting(true);
            progressAnim.setValue(0);
            setTimeout(() => openWhatsApp(queue[0]), 400);
          },
        },
      ]
    );
  };

  // ── Stop blast ──
  const handleStopBlast = () => {
    showAlert(
      'Hentikan Blast?',
      'Progress yang sudah dikirim akan tetap tersimpan.',
      'confirm',
      [
        { text: 'Lanjutkan', style: 'cancel' },
        {
          text: 'Hentikan',
          style: 'destructive',
          onPress: () => {
            blastingRef.current = false;
            setBlasting(false);
          },
        },
      ]
    );
  };

  // ── Send single guest ──
  const handleSendOne = async (guest) => {
    const msg   = buildWaMessage(guest, invitation, baseUrl);
    const phone = (guest.whatsapp_number || guest.phone || '').replace(/\D/g, '');
    const waUrl = `whatsapp://send?text=${encodeURIComponent(msg)}${phone ? `&phone=${phone}` : ''}`;
    try {
      await Linking.openURL(waUrl);
      setSentIds(prev => new Set([...prev, guest.id]));
    } catch (_) {}
  };

  // ── Reset sent status ──
  const handleResetSent = () => {
    showAlert('Reset Status?', 'Semua tamu akan ditandai belum dikirim.', 'confirm', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setSentIds(new Set()) },
    ]);
  };

  // ── Render guest row ──
  const renderGuest = ({ item }) => {
    const cat      = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.family;
    const hasPhone = !!(item.whatsapp_number || item.phone);
    const isSent   = sentIds.has(item.id);
    const isCurrent = blasting && blastQueue[blastIndex]?.id === item.id;

    return (
      <View style={[styles.guestRow, isCurrent && styles.guestRowActive]}>
        {/* Avatar */}
        <LinearGradient
          colors={[cat.color + 'CC', cat.color]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </LinearGradient>

        {/* Info */}
        <View style={styles.guestInfo}>
          <View style={styles.guestNameRow}>
            <Text style={styles.guestName} numberOfLines={1}>{item.name}</Text>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Sekarang</Text>
              </View>
            )}
          </View>
          <Text style={[styles.guestPhone, !hasPhone && styles.guestPhoneEmpty]}>
            {hasPhone ? (item.whatsapp_number || item.phone) : 'Tidak ada nomor'}
          </Text>
        </View>

        {/* Status / Action */}
        {isSent ? (
          <View style={styles.sentBadge}>
            <Ionicons name="checkmark-circle" size={16} color={WA_GREEN} />
            <Text style={styles.sentText}>Terkirim</Text>
          </View>
        ) : hasPhone ? (
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => handleSendOne(item)}
            disabled={blasting}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={18} color={blasting ? theme.colors.textTertiary : WA_GREEN} />
          </TouchableOpacity>
        ) : (
          <View style={styles.noPhoneBadge}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.colors.textTertiary} />
          </View>
        )}
      </View>
    );
  };

  // ── Progress bar width ──
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const sentCount   = sentIds.size;
  const totalQueue  = blastQueue.length || withPhone.filter(g => !sentIds.has(g.id)).length;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[WA_DARK, WA_GREEN]}
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
              <Text style={styles.headerTitle}>WA Blast</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {invitation.bride_name} & {invitation.groom_name}
              </Text>
            </View>
            {sentCount > 0 && (
              <TouchableOpacity style={styles.headerBtn} onPress={handleResetSent}>
                <Ionicons name="refresh-outline" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            {sentCount === 0 && <View style={{ width: 40 }} />}
          </View>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{guests.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{withPhone.length}</Text>
              <Text style={styles.statLabel}>Ada Nomor</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: '#dcfce7' }]}>{sentCount}</Text>
              <Text style={styles.statLabel}>Terkirim</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: '#fef9c3' }]}>
                {withPhone.filter(g => !sentIds.has(g.id)).length}
              </Text>
              <Text style={styles.statLabel}>Belum</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Blast progress bar (visible during blast) ── */}
      {blasting && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>
            {blastIndex} / {blastQueue.length} — {blastQueue[blastIndex]?.name || ''}
          </Text>
        </View>
      )}

      {/* ── Search + Filter ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama tamu..."
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={FILTER_OPTIONS}
          keyExtractor={f => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Guest list ── */}
      <FlatList
        data={filtered}
        renderItem={renderGuest}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          withoutPhone.length > 0 && filter === 'all' ? (
            <View style={styles.warningBanner}>
              <Ionicons name="warning-outline" size={14} color={theme.colors.warning} />
              <Text style={styles.warningText}>
                {withoutPhone.length} tamu tidak memiliki nomor WA dan akan dilewati
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={theme.colors.border} />
            <Text style={styles.emptyText}>Tidak ada tamu yang sesuai filter</Text>
          </View>
        }
      />

      {/* ── Bottom action bar ── */}
      <View style={styles.bottomBar}>
        {blasting ? (
          <TouchableOpacity style={styles.stopBtn} onPress={handleStopBlast} activeOpacity={0.85}>
            <Ionicons name="stop-circle-outline" size={22} color={theme.colors.error} />
            <Text style={styles.stopBtnText}>Hentikan Blast</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.blastBtn, withPhone.filter(g => !sentIds.has(g.id)).length === 0 && styles.blastBtnDisabled]}
            onPress={handleStartBlast}
            disabled={withPhone.filter(g => !sentIds.has(g.id)).length === 0}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={withPhone.filter(g => !sentIds.has(g.id)).length > 0 ? [WA_DARK, WA_GREEN] : ['#9ca3af', '#9ca3af']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.blastBtnInner}
            >
              <Ionicons name="logo-whatsapp" size={22} color="#fff" />
              <Text style={styles.blastBtnText}>
                Blast ke {withPhone.filter(g => !sentIds.has(g.id)).length} Tamu
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

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
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    justifyContent: 'space-between',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  // Progress bar
  progressWrap: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 6,
  },
  progressTrack: {
    height: 6, backgroundColor: theme.colors.border,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: WA_GREEN,
  },
  progressText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Search
  searchWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5, borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },

  // Filter chips
  filterWrap: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  filterList: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md, paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filterChipActive: { backgroundColor: WA_GREEN, borderColor: WA_GREEN },
  filterChipText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },
  filterChipTextActive: { color: '#fff', fontWeight: theme.fontWeight.semibold },

  // Warning banner
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.warning + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.warning + '30',
  },
  warningText: { flex: 1, fontSize: theme.fontSize.xs, color: theme.colors.warning, lineHeight: 16 },

  // List
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },

  // Guest row
  guestRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  guestRowActive: {
    borderColor: WA_GREEN,
    backgroundColor: WA_GREEN + '08',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: '#fff' },
  guestInfo: { flex: 1 },
  guestNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  guestName: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text, flex: 1 },
  currentBadge: {
    backgroundColor: WA_GREEN, borderRadius: theme.borderRadius.full,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  currentBadgeText: { fontSize: 9, color: '#fff', fontWeight: theme.fontWeight.bold },
  guestPhone: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary },
  guestPhoneEmpty: { color: theme.colors.textTertiary, fontStyle: 'italic' },

  // Status badges
  sentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sentText: { fontSize: 11, color: WA_GREEN, fontWeight: theme.fontWeight.semibold },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: WA_GREEN + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  noPhoneBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.border,
    justifyContent: 'center', alignItems: 'center',
  },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: theme.spacing.xxl, gap: theme.spacing.sm },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  blastBtn: { borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
  blastBtnDisabled: { opacity: 0.5 },
  blastBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.md + 2, gap: theme.spacing.sm,
  },
  blastBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold },
  stopBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2, borderColor: theme.colors.error + '50',
    backgroundColor: theme.colors.error + '08',
  },
  stopBtnText: { color: theme.colors.error, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },
});

export default WaBlastScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import WebViewModal from '../components/WebViewModal';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { invitationService } from '../services/invitationService';
import { API_BASE_URL, WEB_BASE_URL } from '../config/api';

// ─── Mini progress bar ────────────────────────────────────────────────────────
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

const InvitationDetailScreen = ({ route, navigation }) => {
  const { invitation: initialInvitation } = route.params;
  const { token } = useAuth();
  const [invitation, setInvitation] = useState(initialInvitation);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('Pratinjau');

  const displayUrl = `${WEB_BASE_URL}/display/${invitation.unique_url}`;

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadInvitationData);
    return unsubscribe;
  }, [navigation]);

  const loadInvitationData = async () => {
    try {
      const response = await invitationService.getInvitation(token, invitation.id);
      setInvitation(response.invitation);
    } catch (error) {
      console.error('Error loading invitation:', error);
    }
    // Load stats in parallel (non-blocking)
    try {
      const statsRes = await invitationService.getStatistics(token, invitation.id);
      setStats(statsRes.statistics || statsRes.data || {});
    } catch (_) {}
  };

  const handlePublish = () => {
    const isPublished = invitation.status === 'published';

    // If trying to publish and not yet paid, go to payment screen
    if (!isPublished && !invitation.is_paid) {
      navigation.navigate('Payment', { invitation });
      return;
    }

    showAlert(
      isPublished ? 'Unpublish Undangan?' : 'Publish Undangan?',
      isPublished
        ? 'Undangan tidak akan bisa diakses oleh tamu. Lanjutkan?'
        : 'Undangan akan dapat diakses oleh tamu. Lanjutkan?',
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: isPublished ? 'Unpublish' : 'Publish',
          style: 'primary',
          onPress: async () => {
            setLoading(true);
            try {
              if (isPublished) {
                await invitationService.unpublishInvitation(token, invitation.id);
                setInvitation(prev => ({ ...prev, status: 'draft' }));
              } else {
                await invitationService.publishInvitation(token, invitation.id);
                setInvitation(prev => ({ ...prev, status: 'published' }));
              }
              showAlert('Berhasil', isPublished ? 'Undangan di-unpublish' : 'Undangan dipublish', 'success');
            } catch (error) {
              const errData = error?.response?.data;
              if (errData?.requires_payment) {
                navigation.navigate('Payment', { invitation });
              } else {
                showAlert('Error', 'Gagal mengubah status undangan', 'error');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    const url = `${API_BASE_URL}/i/${invitation.unique_url}`;
    try {
      await Share.share({
        message: `Undangan Pernikahan ${invitation.bride_name} & ${invitation.groom_name}\n\n${url}`,
        url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyDisplayUrl = async () => {
    await Clipboard.setStringAsync(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenDisplayUrl = () => {
    setPreviewUrl(displayUrl);
    setPreviewTitle('Layar Sapa');
    setPreviewVisible(true);
  };

  const handleShareDisplayUrl = async () => {
    try {
      await Share.share({
        message: `Layar Sapa — ${invitation.bride_name} & ${invitation.groom_name}\n${displayUrl}`,
        url: displayUrl,
      });
    } catch (_) {}
  };

  const isPublished = invitation.status === 'published';

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  // 2-column action grid
  const actionGrid = [
    {
      icon: 'eye-outline',
      color: theme.colors.primary,
      bg: theme.colors.primary + '15',
      label: 'Lihat',
      onPress: () => {
        const url = `${WEB_BASE_URL}/i/${invitation.unique_url}`;
        setPreviewUrl(url);
        setPreviewTitle('Pratinjau Undangan');
        setPreviewVisible(true);
      },
    },
    {
      icon: 'share-social-outline',
      color: theme.colors.primary,
      bg: theme.colors.primary + '15',
      label: 'Bagikan',
      onPress: () => navigation.navigate('ShareInvitation', { invitation }),
    },
    {
      icon: 'logo-whatsapp',
      color: '#25D366',
      bg: '#25D36615',
      label: 'WA Blast',
      onPress: () => navigation.navigate('WaBlast', { invitation }),
    },
    {
      icon: 'create-outline',
      color: theme.colors.accent,
      bg: theme.colors.accent + '18',
      label: 'Edit',
      onPress: () => navigation.navigate('EditInvitation', { invitation }),
    },
    {
      icon: 'images-outline',
      color: '#EC4899',
      bg: '#EC489915',
      label: 'Galeri',
      onPress: () => navigation.navigate('Gallery', { invitation }),
    },
    {
      icon: 'people-outline',
      color: theme.colors.success,
      bg: theme.colors.success + '15',
      label: 'Tamu',
      badge: invitation.guests_count || 0,
      onPress: () => navigation.navigate('GuestList', { invitation }),
    },
    {
      icon: 'qr-code-outline',
      color: '#7C3AED',
      bg: '#7C3AED15',
      label: 'QR Tamu',
      onPress: () => navigation.navigate('ScanHub', { invitation }),
    },
    {
      icon: 'chatbubbles-outline',
      color: theme.colors.info,
      bg: theme.colors.info + '15',
      label: 'RSVP',
      badge: invitation.rsvps_count || 0,
      onPress: () => navigation.navigate('RsvpList', { invitation }),
    },
    {
      icon: 'gift-outline',
      color: '#EC4899',
      bg: '#EC489915',
      label: 'Hadiah',
      onPress: () => navigation.navigate('GiftTracking', { invitation }),
    },
  ];

  return (
    <View style={styles.container}>
      {/* ── COMPACT HEADER ── */}
      <LinearGradient
        colors={theme.colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.heroRow}>
            {/* Back button */}
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.white} />
            </TouchableOpacity>

            {/* Center: names + date + stats inline */}
            <View style={styles.heroCenter}>
              <View style={styles.heroCoupleRow}>
                <Text style={styles.heroName} numberOfLines={1}>
                  {invitation.bride_name}
                </Text>
                <Text style={styles.heroAmp}>&</Text>
                <Text style={styles.heroName} numberOfLines={1}>
                  {invitation.groom_name}
                </Text>
              </View>
              <View style={styles.heroMeta}>
                <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroDate}>{formatDate(invitation.reception_date)}</Text>
                <View style={styles.heroMetaDot} />
                {[
                  { value: invitation.views_count || 0, label: 'Views' },
                  { value: invitation.guests_count || 0, label: 'Tamu' },
                  { value: invitation.rsvps_count || 0, label: 'RSVP' },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <View style={styles.heroMetaDot} />}
                    <Text style={styles.heroStat}>
                      <Text style={styles.heroStatNum}>{s.value}</Text>
                      {' '}{s.label}
                    </Text>
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Share button */}
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── PUBLISH STATUS CARD ── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.publishCard, isPublished ? styles.publishCardLive : styles.publishCardDraft]}
            onPress={handlePublish}
            disabled={loading}
            activeOpacity={0.85}
          >
            {/* Left: status info */}
            <View style={[styles.publishIconWrap, { backgroundColor: isPublished ? theme.colors.success + '20' : theme.colors.textSecondary + '15' }]}>
              <Ionicons
                name={isPublished ? 'globe' : 'cloud-offline-outline'}
                size={24}
                color={isPublished ? theme.colors.success : theme.colors.textSecondary}
              />
            </View>
            <View style={styles.publishInfo}>
              <View style={styles.publishStatusRow}>
                <View style={[styles.publishDot, { backgroundColor: isPublished ? theme.colors.success : theme.colors.textSecondary }]} />
                <Text style={[styles.publishStatusText, { color: isPublished ? theme.colors.success : theme.colors.textSecondary }]}>
                  {isPublished ? 'Sedang Dipublikasikan' : 'Belum Dipublikasikan'}
                </Text>
              </View>
              <Text style={styles.publishDesc}>
                {isPublished
                  ? 'Tamu dapat membuka undangan via link. Ketuk untuk menyembunyikan.'
                  : invitation.is_paid
                    ? 'Undangan belum bisa diakses tamu. Ketuk untuk mempublikasikan.'
                    : 'Perlu pembayaran Rp 50.000 untuk mempublikasikan undangan.'}
              </Text>
            </View>
            {/* Right: CTA */}
            <View style={[styles.publishCta, {
              backgroundColor: isPublished
                ? theme.colors.error + '12'
                : invitation.is_paid
                  ? theme.colors.success + '15'
                  : theme.colors.warning + '15',
            }]}>
              <Ionicons
                name={isPublished ? 'eye-off-outline' : invitation.is_paid ? 'globe-outline' : 'card-outline'}
                size={16}
                color={isPublished ? theme.colors.error : invitation.is_paid ? theme.colors.success : theme.colors.warning}
              />
              <Text style={[styles.publishCtaText, {
                color: isPublished ? theme.colors.error : invitation.is_paid ? theme.colors.success : theme.colors.warning,
              }]}>
                {loading ? '...' : isPublished ? 'Sembunyikan' : invitation.is_paid ? 'Publikasikan' : 'Bayar'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── ACTION GRID ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kelola</Text>
          <View style={styles.actionGrid}>
            {actionGrid.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.actionCell}
                onPress={item.onPress}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <View style={[styles.actionBadge, { backgroundColor: item.color }]}>
                      <Text style={styles.actionBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── LAYAR SAPA (DISPLAY SCREEN) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Layar Sapa</Text>
          <View style={styles.displayCard}>
            {/* Header row */}
            <View style={styles.displayCardHeader}>
              <View style={styles.displayIconWrap}>
                <Ionicons name="tv-outline" size={22} color="#7C3AED" />
              </View>
              <View style={styles.displayCardInfo}>
                <Text style={styles.displayCardTitle}>Layar Monitor Gerbang</Text>
                <Text style={styles.displayCardDesc}>
                  Buka di browser monitor untuk menampilkan popup selamat datang otomatis saat tamu check-in.
                </Text>
              </View>
            </View>

            {/* URL chip */}
            <View style={styles.displayUrlRow}>
              <Ionicons name="link-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.displayUrlText} numberOfLines={1}>{displayUrl}</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.displayActions}>
              <TouchableOpacity
                style={[styles.displayActionBtn, copied && styles.displayActionBtnActive]}
                onPress={handleCopyDisplayUrl}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={copied ? 'checkmark-circle' : 'copy-outline'}
                  size={17}
                  color={copied ? theme.colors.success : '#7C3AED'}
                />
                <Text style={[styles.displayActionText, copied && { color: theme.colors.success }]}>
                  {copied ? 'Tersalin!' : 'Salin URL'}
                </Text>
              </TouchableOpacity>

              <View style={styles.displayActionDivider} />

              <TouchableOpacity
                style={styles.displayActionBtn}
                onPress={handleOpenDisplayUrl}
                activeOpacity={0.75}
              >
                <Ionicons name="open-outline" size={17} color="#7C3AED" />
                <Text style={styles.displayActionText}>Buka</Text>
              </TouchableOpacity>

              <View style={styles.displayActionDivider} />

              <TouchableOpacity
                style={styles.displayActionBtn}
                onPress={handleShareDisplayUrl}
                activeOpacity={0.75}
              >
                <Ionicons name="share-outline" size={17} color="#7C3AED" />
                <Text style={styles.displayActionText}>Bagikan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── STATISTIK ── */}
        {(() => {
          const viewsCount   = stats?.views_count   ?? invitation.views_count   ?? 0;
          const guestsCount  = stats?.guests_count  ?? invitation.guests_count  ?? 0;
          const rsvpsCount   = stats?.rsvps_count   ?? invitation.rsvps_count   ?? 0;
          const mobileViews  = stats?.mobile_views  ?? 0;
          const desktopViews = stats?.desktop_views ?? 0;
          const tabletViews  = stats?.tablet_views  ?? 0;
          const engagementRate = viewsCount > 0
            ? ((rsvpsCount / viewsCount) * 100).toFixed(1)
            : '0.0';
          const totalDeviceViews = mobileViews + desktopViews + tabletViews || 1;

          return (
            <View style={styles.section}>
              <View style={styles.statsSectionHeader}>
                <Text style={styles.sectionTitle}>Statistik</Text>
                <TouchableOpacity
                  style={styles.statsDetailBtn}
                  onPress={() => navigation.navigate('Statistics', { invitation })}
                >
                  <Text style={styles.statsDetailText}>Detail</Text>
                  <Ionicons name="chevron-forward" size={13} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Overview 4 cards */}
              <View style={styles.statsGrid}>
                {[
                  { icon: 'eye-outline',         label: 'Views',  value: viewsCount,  color: theme.colors.primary },
                  { icon: 'people-outline',       label: 'Tamu',   value: guestsCount, color: theme.colors.accent  },
                  { icon: 'chatbubbles-outline',  label: 'RSVP',   value: rsvpsCount,  color: theme.colors.success },
                  { icon: 'trending-up-outline',  label: 'Rate',   value: `${engagementRate}%`, color: '#A855F7' },
                ].map(s => (
                  <View key={s.label} style={[styles.statsCard, { borderTopColor: s.color }]}>
                    <View style={[styles.statsIconBg, { backgroundColor: s.color + '15' }]}>
                      <Ionicons name={s.icon} size={16} color={s.color} />
                    </View>
                    <Text style={[styles.statsValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statsLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Funnel bar */}
              <View style={styles.statsCard2}>
                <View style={styles.funnelRow}>
                  <View style={styles.funnelItem}>
                    <Text style={styles.funnelNum}>{viewsCount}</Text>
                    <Text style={styles.funnelLbl}>Views</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={theme.colors.border} />
                  <View style={styles.funnelItem}>
                    <Text style={styles.funnelNum}>{rsvpsCount}</Text>
                    <Text style={styles.funnelLbl}>RSVP</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={theme.colors.border} />
                  <View style={styles.funnelItem}>
                    <Text style={[styles.funnelNum, { color: '#A855F7' }]}>{engagementRate}%</Text>
                    <Text style={styles.funnelLbl}>Engagement</Text>
                  </View>
                </View>
                <View style={styles.funnelTrack}>
                  <LinearGradient
                    colors={theme.colors.gradient.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.funnelFill, { width: `${Math.min(parseFloat(engagementRate), 100)}%` }]}
                  />
                </View>
              </View>

              {/* Device breakdown */}
              {(mobileViews + desktopViews + tabletViews) > 0 && (
                <View style={styles.statsCard2}>
                  <Text style={styles.statsCard2Title}>Perangkat</Text>
                  {[
                    { icon: 'phone-portrait-outline', label: 'Mobile',  value: mobileViews,  color: theme.colors.primary },
                    { icon: 'desktop-outline',         label: 'Desktop', value: desktopViews, color: theme.colors.success },
                    { icon: 'tablet-portrait-outline', label: 'Tablet',  value: tabletViews,  color: theme.colors.accent  },
                  ].map((d, i) => {
                    const pct = Math.round((d.value / totalDeviceViews) * 100);
                    return (
                      <View key={d.label} style={[styles.deviceRow, i > 0 && { marginTop: 10 }]}>
                        <View style={[styles.deviceIconBg, { backgroundColor: d.color + '15' }]}>
                          <Ionicons name={d.icon} size={14} color={d.color} />
                        </View>
                        <View style={{ flex: 1, gap: 4 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.deviceLabel}>{d.label}</Text>
                            <Text style={[styles.deviceCount, { color: d.color }]}>{d.value} <Text style={styles.devicePct}>({pct}%)</Text></Text>
                          </View>
                          <ProgressBar value={d.value} total={totalDeviceViews} color={d.color} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Last activity */}
              {stats && (
                <View style={styles.statsCard2}>
                  <View style={styles.activityRow}>
                    <View style={[styles.activityIconBg, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Ionicons name="time-outline" size={15} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityLbl}>Terakhir dilihat</Text>
                      <Text style={styles.activityVal}>{stats.last_viewed_at || 'Belum pernah'}</Text>
                    </View>
                  </View>
                  <View style={[styles.activityRow, { marginTop: 10 }]}>
                    <View style={[styles.activityIconBg, { backgroundColor: theme.colors.success + '15' }]}>
                      <Ionicons name="chatbubble-outline" size={15} color={theme.colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityLbl}>RSVP terakhir</Text>
                      <Text style={styles.activityVal}>{stats.last_rsvp_at || 'Belum ada RSVP'}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })()}

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>

      <WebViewModal
        visible={previewVisible}
        url={previewUrl}
        title={previewTitle}
        onClose={() => {
          setPreviewVisible(false);
          setPreviewUrl(null);
        }}
      />

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

  // ── HERO (compact) ──
  hero: {},
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    flexShrink: 0,
  },
  heroCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  heroCoupleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  heroName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.white,
    flexShrink: 1,
  },
  heroAmp: {
    fontSize: theme.fontSize.md,
    color: theme.colors.secondary,
    fontWeight: theme.fontWeight.light,
    flexShrink: 0,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  heroStat: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
  heroStatNum: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },

  // ── PUBLISH CARD ──
  publishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
  },
  publishCardLive: {
    backgroundColor: theme.colors.success + '08',
    borderColor: theme.colors.success + '30',
  },
  publishCardDraft: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  publishIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  publishInfo: { flex: 1 },
  publishStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  publishDot: { width: 7, height: 7, borderRadius: 4 },
  publishStatusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  publishDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  publishCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    flexShrink: 0,
  },
  publishCtaText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },

  // ── SCROLL ──
  scroll: { flex: 1 },
  scrollContent: { paddingTop: theme.spacing.lg },

  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.md,
  },

  // ── ACTION GRID — 4 kolom × 2 baris ──
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionCell: {
    // 4 per row: (100% - 3 gaps) / 4
    width: '23%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  actionLabel: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },

  // ── EVENT CARDS ──
  eventCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  eventCardInner: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  eventIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventHeaderText: { flex: 1 },
  eventType: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingLeft: 40 + theme.spacing.md,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  // Address card (no gradient)
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
  },
  addressText: { flex: 1 },
  addressValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },

  // ── CODE ──
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  codeText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    fontFamily: 'monospace',
  },

  // ── DISPLAY / LAYAR SAPA ──
  displayCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#7C3AED30',
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  displayCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  displayIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#7C3AED18',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  displayCardInfo: { flex: 1 },
  displayCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 3,
  },
  displayCardDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  displayUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  displayUrlText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  displayActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  displayActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 13,
  },
  displayActionBtnActive: {
    backgroundColor: theme.colors.success + '0A',
  },
  displayActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#7C3AED',
  },
  displayActionDivider: {
    width: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 8,
  },

  // ── STATISTIK INLINE ──
  statsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statsDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statsDetailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },

  // 4-card grid
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statsCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    alignItems: 'center',
    gap: 3,
    borderTopWidth: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statsIconBg: {
    width: 30, height: 30, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  statsValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.extrabold,
  },
  statsLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },

  // Funnel + device card
  statsCard2: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statsCard2Title: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },

  // Funnel
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  funnelItem: { alignItems: 'center', gap: 2 },
  funnelNum: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  funnelLbl: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  funnelTrack: {
    height: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  funnelFill: { height: '100%', borderRadius: 3, minWidth: 4 },

  // Device
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  deviceIconBg: {
    width: 30, height: 30, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  deviceLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  deviceCount: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  devicePct: {
    fontSize: 10,
    fontWeight: theme.fontWeight.regular,
    color: theme.colors.textSecondary,
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  activityIconBg: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  activityLbl: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  activityVal: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});

export default InvitationDetailScreen;

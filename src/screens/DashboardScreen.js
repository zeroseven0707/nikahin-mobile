import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { invitationService } from '../services/invitationService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDateShort = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

const getDaysLeft = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const DashboardScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadInvitations(); }, [token]));

  const loadInvitations = async () => {
    try {
      const response = await invitationService.getInvitations(token);
      setInvitations(response.invitations || response.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInvitations();
    setRefreshing(false);
  }, []);

  // ── Invitation Card ──
  const renderCard = ({ item }) => {
    const isPublished = item.status === 'published';
    const isPaid      = item.is_paid;
    const daysLeft    = getDaysLeft(item.reception_date);
    const dateShort   = formatDateShort(item.reception_date);

    const statusLabel = isPublished ? 'Live' : isPaid ? 'Siap Publish' : 'Draft';
    const statusColor = isPublished
      ? theme.colors.success
      : isPaid
        ? theme.colors.warning
        : theme.colors.textTertiary;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('InvitationDetail', { invitation: item })}
        activeOpacity={0.9}
      >
        {/* Names */}
        <Text style={styles.cardNames} numberOfLines={1}>
          {item.bride_name} & {item.groom_name}
        </Text>

        {/* Date + status */}
        <View style={styles.cardMeta}>
          {dateShort && (
            <View style={styles.cardMetaItem}>
              <Ionicons name="calendar-outline" size={12} color={theme.colors.textTertiary} />
              <Text style={styles.cardMetaText}>{dateShort}</Text>
            </View>
          )}
          <View style={[
            styles.statusPill,
            { borderColor: statusColor + '40', backgroundColor: statusColor + '0D' },
          ]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Stats */}
        <View style={styles.cardStats}>
          {[
            { val: item.views_count  || 0, label: 'Views' },
            { val: item.guests_count || 0, label: 'Tamu'  },
            { val: item.rsvps_count  || 0, label: 'RSVP'  },
          ].map((s, i) => (
            <View key={s.label} style={styles.cardStat}>
              {i > 0 && <View style={styles.cardStatDivider} />}
              <Text style={styles.cardStatVal}>{s.val}</Text>
              <Text style={styles.cardStatLabel}>{s.label}</Text>
            </View>
          ))}

          {daysLeft !== null && (
            <View style={styles.cardStat}>
              <View style={styles.cardStatDivider} />
              <Text style={[
                styles.cardStatVal,
                daysLeft > 0 && daysLeft <= 7 && { color: theme.colors.error },
              ]}>
                {daysLeft > 0 ? `${daysLeft}h` : '✓'}
              </Text>
              <Text style={styles.cardStatLabel}>{daysLeft > 0 ? 'Lagi' : 'Selesai'}</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          {/* Bayar — hanya jika belum bayar */}
          {!isPaid && (
            <TouchableOpacity
              style={styles.cardBtnPay}
              onPress={() => navigation.navigate('Payment', { invitation: item })}
              activeOpacity={0.85}
            >
              <Ionicons name="card-outline" size={14} color={theme.colors.warning} />
              <Text style={styles.cardBtnPayText}>Bayar Undangan</Text>
            </TouchableOpacity>
          )}

          {/* Kelola */}
          <TouchableOpacity
            style={[styles.cardBtnManage, !isPaid && styles.cardBtnManageSecondary]}
            onPress={() => navigation.navigate('InvitationDetail', { invitation: item })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isPaid ? theme.colors.gradient.primary : ['transparent', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardBtnManageGrad}
            >
              <Text style={[
                styles.cardBtnManageText,
                !isPaid && { color: theme.colors.primary },
              ]}>
                Kelola Undangan
              </Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={isPaid ? '#fff' : theme.colors.primary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Empty State ──
  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="heart-outline" size={40} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Belum ada undangan</Text>
      <Text style={styles.emptyText}>
        Buat undangan digital pertama Anda dan bagikan ke semua tamu.
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('CreateInvitation')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={theme.colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyBtnGrad}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.emptyBtnText}>Buat Undangan</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ── Header ──
  const renderHeader = () => {
    const published   = invitations.filter(i => i.status === 'published').length;
    const totalViews  = invitations.reduce((s, i) => s + (i.views_count  || 0), 0);
    const totalGuests = invitations.reduce((s, i) => s + (i.guests_count || 0), 0);

    return (
      <View>
        <LinearGradient
          colors={['#4C1D95', '#6B4CE6', '#8B6FF0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.heroTop}>
              <View style={styles.heroGreetWrap}>
                <Text style={styles.heroGreetSub}>{getGreeting()},</Text>
                <Text style={styles.heroGreetName} numberOfLines={1}>
                  {user?.name?.split(' ')[0] ?? 'Pengguna'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.heroAvatarBtn}
                onPress={() => navigation.navigate('ProfileTab')}
                activeOpacity={0.8}
              >
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroAvatarText}>
                    {(user?.name ?? 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {invitations.length > 0 && (
              <View style={styles.heroStrip}>
                {[
                  { num: invitations.length, label: 'Undangan'    },
                  { num: published,          label: 'Live'         },
                  { num: totalViews,         label: 'Total Views'  },
                  { num: totalGuests,        label: 'Total Tamu'   },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <View style={styles.heroStripDivider} />}
                    <View style={styles.heroStripItem}>
                      <Text style={styles.heroStripNum}>{s.num}</Text>
                      <Text style={styles.heroStripLabel}>{s.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>

        {invitations.length > 0 && (
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Undangan Saya</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={invitations}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading && renderEmpty()}
        showsVerticalScrollIndicator={false}
      />

      {/* Single FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateInvitation')}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={theme.colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // ── HERO ──
  hero: { paddingBottom: theme.spacing.lg },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  heroGreetWrap: { flex: 1 },
  heroGreetSub: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: theme.fontWeight.medium,
    marginBottom: 2,
  },
  heroGreetName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: '#fff',
  },
  heroAvatarBtn: { marginLeft: theme.spacing.md },
  heroAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroAvatarText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  heroStrip: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroStripItem: { flex: 1, alignItems: 'center' },
  heroStripNum: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    color: '#fff',
  },
  heroStripLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
    fontWeight: theme.fontWeight.medium,
  },
  heroStripDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },

  // Section
  sectionRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── LIST ──
  list: { flexGrow: 1, paddingBottom: 100 },

  // ── CARD ──
  card: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
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
    position: 'relative',
  },
  cardNames: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    letterSpacing: -0.3,
    marginBottom: theme.spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: theme.fontWeight.semibold },

  cardDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginBottom: theme.spacing.md,
  },

  // Stats
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: theme.colors.divider,
    marginRight: 6,
  },
  cardStatVal: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  cardStatLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },

  cardArrow: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
  },

  // Card action buttons
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  cardBtnPay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.warning + '50',
    backgroundColor: theme.colors.warning + '0D',
  },
  cardBtnPayText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.warning,
  },
  cardBtnManage: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  cardBtnManageSecondary: {
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    backgroundColor: theme.colors.primary + '08',
  },
  cardBtnManageGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  cardBtnManageText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },

  // ── EMPTY ──
  empty: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl + theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  emptyBtn: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  emptyBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#6B4CE6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  fabInner: {
    width: 58, height: 58,
    justifyContent: 'center', alignItems: 'center',
  },
});

export default DashboardScreen;

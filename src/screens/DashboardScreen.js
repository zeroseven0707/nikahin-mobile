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

const DashboardScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => { loadInvitations(); }, [token])
  );

  const loadInvitations = async () => {
    try {
      const response = await invitationService.getInvitations(token);
      setInvitations(response.invitations || response.data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInvitations();
    setRefreshing(false);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  // ── INVITATION CARD ──
  const renderCard = ({ item }) => {
    const isPublished = item.status === 'published';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('InvitationDetail', { invitation: item })}
        activeOpacity={0.88}
      >
        {/* Card header gradient strip */}
        <LinearGradient
          colors={isPublished
            ? [theme.colors.primary, theme.colors.primaryDark]
            : ['#8E8E9A', '#6B6B7A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardStrip}
        >
          <View style={styles.cardStripLeft}>
            <Ionicons name="heart" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.cardStripText}>Undangan Pernikahan</Text>
          </View>
          <View style={styles.cardStripBadge}>
            <View style={[styles.stripDot, { backgroundColor: isPublished ? '#4ADE80' : 'rgba(255,255,255,0.5)' }]} />
            <Text style={styles.cardStripBadgeText}>{isPublished ? 'Live' : 'Draft'}</Text>
          </View>
        </LinearGradient>

        {/* Card body */}
        <View style={styles.cardBody}>
          {/* Names */}
          <Text style={styles.cardNames} numberOfLines={1}>
            {item.bride_name} & {item.groom_name}
          </Text>

          {/* Date */}
          <View style={styles.cardDateRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.cardDate}>{formatDate(item.reception_date)}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.cardStats}>
            <View style={styles.cardStat}>
              <View style={[styles.cardStatIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="eye-outline" size={16} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.cardStatVal}>{item.views_count || 0}</Text>
                <Text style={styles.cardStatLabel}>Views</Text>
              </View>
            </View>

            <View style={styles.cardStatDivider} />

            <View style={styles.cardStat}>
              <View style={[styles.cardStatIcon, { backgroundColor: theme.colors.accent + '20' }]}>
                <Ionicons name="people-outline" size={16} color={theme.colors.accent} />
              </View>
              <View>
                <Text style={styles.cardStatVal}>{item.guests_count || 0}</Text>
                <Text style={styles.cardStatLabel}>Tamu</Text>
              </View>
            </View>

            <View style={styles.cardStatDivider} />

            <View style={styles.cardStat}>
              <View style={[styles.cardStatIcon, { backgroundColor: theme.colors.success + '15' }]}>
                <Ionicons name="chatbubble-outline" size={16} color={theme.colors.success} />
              </View>
              <View>
                <Text style={styles.cardStatVal}>{item.rsvps_count || 0}</Text>
                <Text style={styles.cardStatLabel}>RSVP</Text>
              </View>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.cardCta}
            onPress={() => navigation.navigate('InvitationDetail', { invitation: item })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={theme.colors.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardCtaGradient}
            >
              <Text style={styles.cardCtaText}>Kelola Undangan</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ── EMPTY STATE ──
  const renderEmpty = () => (
    <View style={styles.empty}>
      <LinearGradient
        colors={[theme.colors.primary + '20', theme.colors.primary + '06']}
        style={styles.emptyIconBg}
      >
        <Ionicons name="mail-open-outline" size={52} color={theme.colors.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Belum Ada Undangan</Text>
      <Text style={styles.emptyText}>
        Buat undangan digital pertama Anda dan bagikan momen spesial bersama orang-orang tercinta
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
          style={styles.emptyBtnGradient}
        >
          <Ionicons name="add-circle-outline" size={20} color={theme.colors.white} />
          <Text style={styles.emptyBtnText}>Buat Undangan Pertama</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ── HEADER ──
  const renderHeader = () => (
    <LinearGradient
      colors={theme.colors.gradient.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.headerInner}>
          {/* Left: greeting */}
          <View style={styles.headerLeft}>
            <Text style={styles.headerLabel}>Beranda</Text>
            <Text style={styles.headerGreeting}>Halo, {user?.name?.split(' ')[0]}! 👋</Text>
          </View>
          {/* Right: count badge */}
          {invitations.length > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeNum}>{invitations.length}</Text>
              <Text style={styles.headerBadgeLabel}>Undangan</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

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

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateInvitation')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={theme.colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <Ionicons name="add" size={30} color={theme.colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // ── HEADER ──
  header: {},
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerLeft: { flex: 1 },
  headerLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  headerGreeting: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  headerBadgeNum: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    lineHeight: 24,
  },
  headerBadgeLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: theme.fontWeight.medium,
  },

  // ── LIST ──
  list: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  // ── CARD ──
  card: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  // Strip
  cardStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  cardStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardStripText: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: theme.fontWeight.medium,
    letterSpacing: 0.3,
  },
  cardStripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  stripDot: { width: 6, height: 6, borderRadius: 3 },
  cardStripBadgeText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },

  // Body
  cardBody: {
    padding: theme.spacing.lg,
  },
  cardNames: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.lg,
  },
  cardDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  // Stats
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  cardStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  cardStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStatVal: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  cardStatLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  cardStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border,
  },

  // CTA
  cardCta: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  cardCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardCtaText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },

  // ── EMPTY ──
  empty: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconBg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  emptyBtn: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  emptyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  fabInner: {
    width: 62,
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;

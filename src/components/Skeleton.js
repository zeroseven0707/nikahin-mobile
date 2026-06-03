/**
 * Skeleton — reusable shimmer placeholder for loading states.
 *
 * Usage:
 *   <Skeleton width={200} height={20} borderRadius={8} />
 *   <Skeleton width="100%" height={120} borderRadius={16} style={{ marginBottom: 8 }} />
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../config/theme';

// Base shimmer color & highlight color
const BASE_COLOR      = theme.colors.border;       // #E5E7EB
const HIGHLIGHT_COLOR = theme.colors.surfaceVariant; // #F5F5F7

const Skeleton = ({ width = '100%', height = 16, borderRadius = 8, style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [BASE_COLOR, HIGHLIGHT_COLOR],
  });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor },
        style,
      ]}
    />
  );
};

// ── Preset layouts ────────────────────────────────────────────────────────────

/** Skeleton card untuk invitation di Dashboard */
export const InvitationCardSkeleton = () => (
  <View style={presets.card}>
    {/* Title */}
    <Skeleton width="65%" height={20} borderRadius={10} style={{ marginBottom: 10 }} />
    {/* Meta row */}
    <View style={presets.row}>
      <Skeleton width="40%" height={13} borderRadius={6} />
      <Skeleton width="20%" height={22} borderRadius={11} />
    </View>
    {/* Divider */}
    <Skeleton width="100%" height={1} borderRadius={0} style={{ marginVertical: 12 }} />
    {/* Stats row */}
    <View style={presets.statsRow}>
      <Skeleton width="18%" height={18} borderRadius={9} />
      <Skeleton width="18%" height={18} borderRadius={9} />
      <Skeleton width="18%" height={18} borderRadius={9} />
      <Skeleton width="18%" height={18} borderRadius={9} />
    </View>
    {/* Action buttons */}
    <View style={[presets.row, { marginTop: 14, gap: 8 }]}>
      <Skeleton width="48%" height={38} borderRadius={12} />
      <Skeleton width="48%" height={38} borderRadius={12} />
    </View>
  </View>
);

/** Skeleton untuk hero strip di Dashboard */
export const HeroStripSkeleton = () => (
  <View style={presets.heroStrip}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={presets.heroStripItem}>
        <Skeleton width={36} height={22} borderRadius={6} style={{ marginBottom: 4 }} />
        <Skeleton width={52} height={11} borderRadius={5} />
      </View>
    ))}
  </View>
);

/** Skeleton untuk grid foto galeri */
export const GalleryGridSkeleton = ({ cols = 3, rows = 3 }) => {
  const GAP    = 3;
  const items  = Array.from({ length: cols * rows });
  return (
    <View style={presets.galleryGrid}>
      {items.map((_, i) => (
        <Skeleton
          key={i}
          width={`${(100 / cols) - 0.5}%`}
          height={110}
          borderRadius={6}
          style={{ marginBottom: GAP }}
        />
      ))}
    </View>
  );
};

/** Skeleton untuk action grid di InvitationDetail */
export const ActionGridSkeleton = ({ count = 10 }) => (
  <View style={presets.actionGrid}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={presets.actionCell}>
        <Skeleton width={48} height={48} borderRadius={14} style={{ marginBottom: 6 }} />
        <Skeleton width={40} height={11} borderRadius={5} />
      </View>
    ))}
  </View>
);

/** Skeleton untuk section statistik */
export const StatsSkeleton = () => (
  <View style={{ gap: 8 }}>
    <View style={presets.statsGrid}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={presets.statsCard}>
          <Skeleton width={36} height={36} borderRadius={12} style={{ marginBottom: 8 }} />
          <Skeleton width={40} height={20} borderRadius={8} style={{ marginBottom: 4 }} />
          <Skeleton width={32} height={11} borderRadius={5} />
        </View>
      ))}
    </View>
    <Skeleton width="100%" height={70} borderRadius={16} />
  </View>
);

/** Skeleton untuk list guest */
export const GuestListSkeleton = ({ count = 5 }) => (
  <View style={{ gap: 10, paddingHorizontal: 16 }}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={presets.guestItem}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="55%" height={15} borderRadius={7} />
          <Skeleton width="35%" height={11} borderRadius={5} />
        </View>
        <Skeleton width={64} height={28} borderRadius={14} />
      </View>
    ))}
  </View>
);

/** Skeleton untuk profile screen */
export const ProfileSkeleton = () => (
  <View style={presets.profileWrap}>
    {/* Avatar */}
    <Skeleton width={88} height={88} borderRadius={44} style={{ alignSelf: 'center', marginBottom: 12 }} />
    <Skeleton width="45%" height={20} borderRadius={10} style={{ alignSelf: 'center', marginBottom: 6 }} />
    <Skeleton width="55%" height={13} borderRadius={6} style={{ alignSelf: 'center', marginBottom: 28 }} />
    {/* Menu items */}
    {[1, 2, 3, 4, 5].map((i) => (
      <View key={i} style={presets.menuItem}>
        <Skeleton width={40} height={40} borderRadius={12} />
        <View style={{ flex: 1, gap: 5 }}>
          <Skeleton width="50%" height={14} borderRadius={7} />
          <Skeleton width="70%" height={11} borderRadius={5} />
        </View>
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>
    ))}
  </View>
);

// ── Preset styles ─────────────────────────────────────────────────────────────
const presets = StyleSheet.create({
  // Card skeleton
  card: {
    marginHorizontal: 24,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Hero strip
  heroStrip: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 20,
  },
  heroStripItem: {
    flex: 1,
    alignItems: 'center',
  },

  // Gallery grid
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    padding: 3,
  },

  // Action grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionCell: {
    width: '23%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statsCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Guest item
  guestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Profile
  profileWrap: {
    padding: 24,
    paddingTop: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
});

export default Skeleton;

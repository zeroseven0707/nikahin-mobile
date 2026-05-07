import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/Card';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { rsvpService } from '../services/invitationService';

const ATTENDANCE_CONFIG = {
  hadir:       { label: 'Hadir',        color: theme.colors.success, icon: 'checkmark-circle' },
  tidak_hadir: { label: 'Tidak Hadir',  color: theme.colors.error,   icon: 'close-circle' },
  mungkin:     { label: 'Mungkin',      color: theme.colors.warning, icon: 'help-circle' },
};

const getInitials = (name) => {
  const parts = (name || '').trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (name || '?').substring(0, 2).toUpperCase();
};

const RsvpListScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadRsvps(); }, []);

  const loadRsvps = async () => {
    try {
      const response = await rsvpService.getRsvps(token, invitation.id);
      setRsvps(response.rsvps || response.data || []);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRsvps();
    setRefreshing(false);
  };

  // Summary counts
  const hadirCount = rsvps.filter(r => r.attendance === 'hadir').length;
  const tidakHadirCount = rsvps.filter(r => r.attendance === 'tidak_hadir').length;
  const mungkinCount = rsvps.filter(r => r.attendance === 'mungkin').length;

  const renderRsvp = ({ item, index }) => {
    const att = ATTENDANCE_CONFIG[item.attendance];
    const colors = [
      [theme.colors.primary, theme.colors.primaryLight],
      [theme.colors.success, '#34D399'],
      [theme.colors.accent, '#FBBF24'],
      [theme.colors.info, '#60A5FA'],
    ];
    const gradientColors = colors[index % colors.length];

    return (
      <Card style={styles.rsvpCard}>
        <View style={styles.rsvpRow}>
          {/* Avatar */}
          <LinearGradient colors={gradientColors} style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </LinearGradient>

          {/* Content */}
          <View style={styles.rsvpContent}>
            <View style={styles.rsvpTopRow}>
              <Text style={styles.rsvpName}>{item.name}</Text>
              {att && (
                <View style={[styles.attendanceBadge, { backgroundColor: att.color + '18' }]}>
                  <Ionicons name={att.icon} size={12} color={att.color} />
                  <Text style={[styles.attendanceText, { color: att.color }]}>{att.label}</Text>
                </View>
              )}
            </View>
            <Text style={styles.rsvpTime}>
              {new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
            {item.message ? (
              <View style={styles.messageContainer}>
                <Ionicons name="chatbubble-outline" size={12} color={theme.colors.textSecondary} />
                <Text style={styles.rsvpMessage} numberOfLines={3}>{item.message}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="chatbubbles-outline" size={52} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Belum Ada Ucapan</Text>
      <Text style={styles.emptyText}>
        Ucapan dan doa dari tamu akan muncul di sini setelah mereka mengisi RSVP
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
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
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>RSVP & Ucapan</Text>
              <Text style={styles.headerSubtitle}>{rsvps.length} balasan diterima</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Summary pills */}
          {rsvps.length > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryPill}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                <Text style={styles.summaryText}>{hadirCount} Hadir</Text>
              </View>
              <View style={styles.summaryPill}>
                <Ionicons name="close-circle" size={14} color={theme.colors.error} />
                <Text style={styles.summaryText}>{tidakHadirCount} Tidak Hadir</Text>
              </View>
              <View style={styles.summaryPill}>
                <Ionicons name="help-circle" size={14} color={theme.colors.warning} />
                <Text style={styles.summaryText}>{mungkinCount} Mungkin</Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={rsvps}
        renderItem={renderRsvp}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={!loading && renderEmpty()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: { paddingBottom: theme.spacing.md },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  headerButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
  headerSubtitle: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  summaryText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },

  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    flexGrow: 1,
  },

  // RSVP Card
  rsvpCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  rsvpRow: { flexDirection: 'row', gap: theme.spacing.md },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
  rsvpContent: { flex: 1 },
  rsvpTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: theme.spacing.sm,
  },
  rsvpName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  attendanceText: { fontSize: 10, fontWeight: theme.fontWeight.semibold },
  rsvpTime: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginBottom: 6 },
  messageContainer: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'flex-start',
  },
  rsvpMessage: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: theme.spacing.xxl },
  emptyIconBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.sm },
  emptyText: {
    fontSize: theme.fontSize.md, color: theme.colors.textSecondary,
    textAlign: 'center', paddingHorizontal: theme.spacing.xl, lineHeight: 22,
  },
});

export default RsvpListScreen;

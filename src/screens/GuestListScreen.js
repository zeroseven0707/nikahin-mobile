import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { guestService } from '../services/invitationService';
import { WEB_BASE_URL } from '../config/api';

const CATEGORY_CONFIG = {
  family:   { label: 'Keluarga',   color: theme.colors.primary,  bg: theme.colors.primary + '15',  icon: 'people' },
  friend:   { label: 'Teman',      color: theme.colors.success,  bg: theme.colors.success + '15',  icon: 'happy' },
  colleague:{ label: 'Rekan',      color: theme.colors.accent,   bg: theme.colors.accent + '20',   icon: 'briefcase' },
  other:    { label: 'Lainnya',    color: theme.colors.info,     bg: theme.colors.info + '15',     icon: 'ellipsis-horizontal' },
};

const GuestListScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();
  const [guests, setGuests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const handleExportPdf = () => {
    // Open PDF export URL in browser — browser will trigger download
    const url = `${WEB_BASE_URL}/api/invitations/${invitation.id}/guests/export-pdf`;
    // We need the auth token in the URL — use a web view or share the link
    // For simplicity, open in browser (user must be logged in via web, or we pass token as query)
    showAlert(
      'Export PDF',
      'PDF laporan akan dibuka di browser. Pastikan Anda terhubung ke jaringan yang sama.',
      'info',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Buka Browser',
          style: 'primary',
          onPress: () => Linking.openURL(url),
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => { loadGuests(); }, [])
  );

  useEffect(() => {
    applyFilter(guests, searchQuery, activeFilter);
  }, [guests, searchQuery, activeFilter]);

  const loadGuests = async () => {
    try {
      const response = await guestService.getGuests(token, invitation.id);
      setGuests(response.guests || response.data || []);
    } catch (error) {
      showAlert('Error', 'Gagal memuat daftar tamu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGuests();
    setRefreshing(false);
  };

  const applyFilter = (list, query, filter) => {
    let result = list;
    if (filter !== 'all') result = result.filter(g => g.category === filter);
    if (query.trim()) result = result.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
    setFiltered(result);
  };

  const handleDeleteGuest = (guest) => {
    showAlert(
      'Hapus Tamu',
      `Hapus "${guest.name}" dari daftar tamu?`,
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await guestService.deleteGuest(token, invitation.id, guest.id);
              showAlert('Berhasil', 'Tamu berhasil dihapus', 'success');
              loadGuests();
            } catch (error) {
              showAlert('Error', 'Gagal menghapus tamu', 'error');
            }
          },
        },
      ]
    );
  };

  // Count per category
  const counts = guests.reduce((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + 1;
    return acc;
  }, {});

  const filters = [
    { key: 'all', label: 'Semua', count: guests.length },
    { key: 'family', label: 'Keluarga', count: counts.family || 0 },
    { key: 'friend', label: 'Teman', count: counts.friend || 0 },
    { key: 'colleague', label: 'Rekan', count: counts.colleague || 0 },
    { key: 'other', label: 'Lainnya', count: counts.other || 0 },
  ];

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const renderGuest = ({ item }) => {
    const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('EditGuest', { invitation, guest: item })}
      >
        <Card style={styles.guestCard}>
          <View style={styles.guestRow}>
            {/* Avatar with initials */}
            <LinearGradient
              colors={[cat.color + 'CC', cat.color]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
            </LinearGradient>

            {/* Info */}
            <View style={styles.guestInfo}>
              <Text style={styles.guestName}>{item.name}</Text>
              <View style={styles.guestMeta}>
                <View style={[styles.categoryBadge, { backgroundColor: cat.bg }]}>
                  <Ionicons name={cat.icon} size={10} color={cat.color} />
                  <Text style={[styles.categoryBadgeText, { color: cat.color }]}>{cat.label}</Text>
                </View>
                {item.pax > 1 && (
                  <View style={styles.paxBadge}>
                    <Ionicons name="people-outline" size={10} color={theme.colors.textSecondary} />
                    <Text style={styles.paxText}>{item.pax} orang</Text>
                  </View>
                )}
              </View>
              {(item.phone || item.whatsapp_number) && (
                <Text style={styles.guestPhone} numberOfLines={1}>
                  {item.phone || item.whatsapp_number}
                </Text>
              )}
              {/* Check-in status indicator */}
              {item.checked_in_at && (
                <View style={styles.checkedInBadge}>
                  <Ionicons name="checkmark-circle" size={11} color={theme.colors.success} />
                  <Text style={styles.checkedInText}>
                    Check-in {new Date(item.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              )}
              {/* Souvenir status indicator */}
              {item.souvenir_taken_at && (
                <View style={styles.souvenirBadge}>
                  <Ionicons name="gift" size={11} color="#A855F7" />
                  <Text style={styles.souvenirText}>
                    Souvenir {new Date(item.souvenir_taken_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.guestActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.qrBtn]}
                onPress={() => navigation.navigate('GuestQr', { invitation, guest: item })}
              >
                <Ionicons name="qr-code-outline" size={18} color={theme.colors.info} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('EditGuest', { invitation, guest: item })}
              >
                <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDeleteGuest(item)}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="people-outline" size={52} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Belum Ada Tamu</Text>
      <Text style={styles.emptyText}>
        {searchQuery || activeFilter !== 'all'
          ? 'Tidak ada tamu yang sesuai filter'
          : 'Tambahkan tamu untuk mulai mengelola undangan'}
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
              <Text style={styles.headerTitle}>Daftar Tamu</Text>
              <Text style={styles.headerSubtitle}>{guests.length} tamu terdaftar</Text>
            </View>
            {/* Analytics + Scan QR buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate('ScanAnalytics', { invitation })}
              >
                <Ionicons name="analytics-outline" size={20} color={theme.colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate('QrScanner', { invitation })}
              >
                <Ionicons name="qr-code-outline" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={theme.colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama tamu..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={f => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
              {f.count > 0 && (
                <View style={[styles.filterCount, activeFilter === f.key && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, activeFilter === f.key && styles.filterCountTextActive]}>
                    {f.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Import / Export toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={() => navigation.navigate('ImportGuest', { invitation })}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={16} color={theme.colors.success} />
          <Text style={[styles.toolbarBtnText, { color: theme.colors.success }]}>Import Excel</Text>
        </TouchableOpacity>
        <View style={styles.toolbarDivider} />
        <TouchableOpacity
          style={styles.toolbarBtn}
          onPress={handleExportPdf}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={16} color={theme.colors.error} />
          <Text style={[styles.toolbarBtnText, { color: theme.colors.error }]}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Guest List */}
      <FlatList
        data={filtered}
        renderItem={renderGuest}
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

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddGuest', { invitation })}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={theme.colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={theme.colors.white} />
        </LinearGradient>
      </TouchableOpacity>

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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // Search
  searchWrapper: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },

  // Filter chips
  filterWrapper: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterList: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  filterChipTextActive: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },
  filterCount: {
    backgroundColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterCountText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.bold,
  },
  filterCountTextActive: {
    color: theme.colors.white,
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toolbarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  toolbarBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  toolbarDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },

  // List
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    flexGrow: 1,
  },

  // Guest Card
  guestCard: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  guestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    gap: 3,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
  },
  paxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  paxText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  guestPhone: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  checkedInText: {
    fontSize: 10,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.medium,
  },
  souvenirBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  souvenirText: {
    fontSize: 10,
    color: '#A855F7',
    fontWeight: theme.fontWeight.medium,
  },
  guestActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: theme.colors.error + '12',
  },
  qrBtn: {
    backgroundColor: theme.colors.info + '12',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
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
    paddingHorizontal: theme.spacing.xl,
    lineHeight: 22,
  },

  // FAB
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
  fabGradient: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GuestListScreen;

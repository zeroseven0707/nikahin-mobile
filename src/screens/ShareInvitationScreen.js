import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  FlatList,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Card from '../components/Card';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { guestService } from '../services/invitationService';
import { API_BASE_URL } from '../config/api';

const getInitials = (name) => {
  const parts = (name || '').trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (name || '?').substring(0, 2).toUpperCase();
};

const ShareInvitationScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();
  const [guests, setGuests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'success' });

  const baseUrl = API_BASE_URL.replace('/api', '');
  const generalUrl = `${baseUrl}/i/${invitation.unique_url}`;

  const showAlert = (title, message, type = 'success') =>
    setAlert({ visible: true, title, message, type });

  useEffect(() => { loadGuests(); }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFiltered(guests.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setFiltered(guests);
    }
  }, [searchQuery, guests]);

  const loadGuests = async () => {
    try {
      const response = await guestService.getGuests(token, invitation.id);
      const list = response.guests || response.data || [];
      setGuests(list);
      setFiltered(list);
    } catch (error) {
      console.error('Error loading guests:', error);
    }
  };

  const buildMessage = (guest = null) => {
    const url = guest?.qr_token
      ? `${generalUrl}?to=${encodeURIComponent(guest.qr_token)}`
      : generalUrl;
    const dateStr = new Date(invitation.reception_date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const greeting = guest ? `Kepada Yth.\n${guest.name}\n\n` : '';
    return `🎊 Undangan Pernikahan 🎊\n\n${greeting}${invitation.bride_name} & ${invitation.groom_name}\n\n📅 ${dateStr}\n\n🔗 ${url}\n\nKami mengundang Anda untuk hadir di acara pernikahan kami. Terima kasih! 💕`;
  };

  const handleShareGeneral = async () => {
    try {
      await Share.share({ message: buildMessage(), url: generalUrl, title: 'Undangan Pernikahan' });
    } catch (error) { console.error(error); }
  };

  const handleCopyGeneral = async () => {
    await Clipboard.setStringAsync(generalUrl);
    showAlert('Tersalin!', 'Link undangan berhasil disalin ke clipboard');
  };

  const handleShareToGuest = async (guest) => {
    try {
      await Share.share({
        message: buildMessage(guest),
        title: `Undangan untuk ${guest.name}`,
      });
    } catch (error) { console.error(error); }
  };

  const handleWhatsApp = async (guest) => {
    const guestUrl = guest.qr_token
      ? `${generalUrl}?to=${encodeURIComponent(guest.qr_token)}`
      : generalUrl;
    const msg = `🎊 *Undangan Pernikahan* 🎊\n\nKepada Yth.\n*${guest.name}*\n\n${invitation.bride_name} & ${invitation.groom_name}\n\n📅 ${new Date(invitation.reception_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n🔗 ${guestUrl}\n\nKami mengundang Bapak/Ibu/Saudara/i untuk hadir. Terima kasih! 💕`;
    const phone = guest.phone || guest.whatsapp_number || '';
    const waUrl = `whatsapp://send?text=${encodeURIComponent(msg)}${phone ? `&phone=${phone}` : ''}`;
    try {
      const canOpen = await Linking.canOpenURL(waUrl);
      if (canOpen) {
        await Linking.openURL(waUrl);
      } else {
        showAlert('WhatsApp Tidak Tersedia', 'WhatsApp tidak terinstall di perangkat ini', 'warning');
      }
    } catch (error) {
      showAlert('Error', 'Gagal membuka WhatsApp', 'error');
    }
  };

  const handleCopyGuest = async (guest) => {
    const guestUrl = guest.qr_token
      ? `${generalUrl}?to=${encodeURIComponent(guest.qr_token)}`
      : generalUrl;
    await Clipboard.setStringAsync(guestUrl);
    showAlert('Tersalin!', `Link untuk ${guest.name} berhasil disalin`);
  };

  const renderGuest = ({ item }) => (
    <Card style={styles.guestCard}>
      <View style={styles.guestRow}>
        <LinearGradient
          colors={[theme.colors.primary + 'CC', theme.colors.primary]}
          style={styles.guestAvatar}
        >
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </LinearGradient>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{item.name}</Text>
          {(item.phone || item.whatsapp_number) && (
            <Text style={styles.guestPhone}>{item.phone || item.whatsapp_number}</Text>
          )}
        </View>
      </View>

      <View style={styles.guestActionRow}>
        <TouchableOpacity style={styles.guestActionBtn} onPress={() => handleShareToGuest(item)} activeOpacity={0.7}>
          <View style={[styles.guestActionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="share-social-outline" size={18} color={theme.colors.primary} />
          </View>
          <Text style={[styles.guestActionText, { color: theme.colors.primary }]}>Share</Text>
        </TouchableOpacity>

        {(item.phone || item.whatsapp_number) && (
          <TouchableOpacity style={styles.guestActionBtn} onPress={() => handleWhatsApp(item)} activeOpacity={0.7}>
            <View style={[styles.guestActionIcon, { backgroundColor: '#25D36615' }]}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            </View>
            <Text style={[styles.guestActionText, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.guestActionBtn} onPress={() => handleCopyGuest(item)} activeOpacity={0.7}>
          <View style={[styles.guestActionIcon, { backgroundColor: theme.colors.textSecondary + '15' }]}>
            <Ionicons name="copy-outline" size={18} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.guestActionText, { color: theme.colors.textSecondary }]}>Salin</Text>
        </TouchableOpacity>
      </View>
    </Card>
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
              <Text style={styles.headerTitle}>Bagikan Undangan</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {invitation.bride_name} & {invitation.groom_name}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General Share Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link Umum</Text>
          <Card style={styles.generalCard}>
            <LinearGradient
              colors={[theme.colors.primary + '10', theme.colors.primary + '03']}
              style={styles.generalCardInner}
            >
              <View style={styles.generalIconBg}>
                <Ionicons name="link" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.generalTitle}>Undangan Tanpa Nama</Text>
              <Text style={styles.generalSubtitle}>
                Bagikan ke siapa saja tanpa menyebut nama tamu
              </Text>

              {/* URL display */}
              <View style={styles.urlBox}>
                <Ionicons name="globe-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.urlText} numberOfLines={1}>{generalUrl}</Text>
              </View>

              {/* Action buttons */}
              <View style={styles.generalActions}>
                <TouchableOpacity style={styles.generalActionBtn} onPress={handleShareGeneral} activeOpacity={0.8}>
                  <LinearGradient
                    colors={theme.colors.gradient.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.generalActionGradient}
                  >
                    <Ionicons name="share-social-outline" size={18} color={theme.colors.white} />
                    <Text style={styles.generalActionTextWhite}>Bagikan</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.generalActionBtn, styles.generalActionOutline]} onPress={handleCopyGeneral} activeOpacity={0.8}>
                  <Ionicons name="copy-outline" size={18} color={theme.colors.primary} />
                  <Text style={styles.generalActionTextPrimary}>Salin Link</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* Per-Guest Share */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Bagikan ke Tamu</Text>
            <Text style={styles.sectionCount}>{guests.length} tamu</Text>
          </View>

          {/* Search */}
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

          {filtered.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                  <Ionicons name="people-outline" size={40} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'Tamu tidak ditemukan' : 'Belum ada tamu'}
                </Text>
                {!searchQuery && (
                  <Text style={styles.emptyText}>
                    Tambahkan tamu terlebih dahulu untuk mengirim undangan personal
                  </Text>
                )}
              </View>
            </Card>
          ) : (
            <FlatList
              data={filtered}
              renderItem={renderGuest}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
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

  content: { flex: 1 },
  section: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.md },
  sectionCount: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },

  // General Card
  generalCard: { padding: 0, overflow: 'hidden' },
  generalCardInner: { padding: theme.spacing.xl, alignItems: 'center', borderRadius: theme.borderRadius.xl },
  generalIconBg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  generalTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  generalSubtitle: {
    fontSize: theme.fontSize.sm, color: theme.colors.textSecondary,
    textAlign: 'center', marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  urlText: { flex: 1, fontSize: theme.fontSize.xs, color: theme.colors.textSecondary },
  generalActions: { flexDirection: 'row', width: '100%', gap: theme.spacing.md },
  generalActionBtn: { flex: 1, borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
  generalActionGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.md, gap: theme.spacing.sm,
  },
  generalActionOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.md, gap: theme.spacing.sm,
    borderWidth: 2, borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  generalActionTextWhite: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.white },
  generalActionTextPrimary: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.primary },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    ...theme.shadows.xs,
  },
  searchInput: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },

  // Guest Card
  guestCard: { marginBottom: theme.spacing.sm, padding: theme.spacing.md },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  guestAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
  guestInfo: { flex: 1 },
  guestName: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  guestPhone: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2 },
  guestActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  guestActionBtn: { alignItems: 'center', gap: 4, paddingHorizontal: theme.spacing.sm },
  guestActionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  guestActionText: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.medium },

  // Empty
  emptyCard: { marginTop: 0 },
  emptyState: { alignItems: 'center', paddingVertical: theme.spacing.xl },
  emptyIconBg: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  emptyText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'center', paddingHorizontal: theme.spacing.lg },
});

export default ShareInvitationScreen;

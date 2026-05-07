import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { guestService } from '../services/invitationService';

const CATEGORY_CONFIG = {
  family:    { label: 'Keluarga', color: theme.colors.primary },
  friend:    { label: 'Teman',    color: theme.colors.success },
  colleague: { label: 'Rekan',    color: theme.colors.accent },
};

const GuestQrScreen = ({ route, navigation }) => {
  const { invitation, guest: initialGuest } = route.params;
  const { token } = useAuth();
  const [guest, setGuest] = useState(initialGuest);
  const [generating, setGenerating] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const cat = CATEGORY_CONFIG[guest.category] || CATEGORY_CONFIG.family;

  const handleGenerateQr = async () => {
    showAlert(
      'Generate QR Baru',
      guest.qr_token
        ? 'QR code lama akan tidak berlaku. Lanjutkan?'
        : 'Generate QR code untuk tamu ini?',
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            setGenerating(true);
            try {
              const response = await guestService.generateQr(token, invitation.id, guest.id);
              setGuest(response.guest);
              showAlert('Berhasil', 'QR code berhasil dibuat!', 'success');
            } catch (error) {
              showAlert('Error', 'Gagal membuat QR code', 'error');
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleResetCheckIn = () => {
    if (!guest.checked_in_at) return;
    showAlert(
      'Reset Check-in',
      `Reset status check-in untuk "${guest.name}"?`,
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await guestService.resetCheckIn(token, invitation.id, guest.id);
              setGuest(response.guest);
              showAlert('Berhasil', 'Status check-in berhasil direset.', 'success');
            } catch (error) {
              showAlert('Error', 'Gagal mereset check-in', 'error');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!guest.qr_token) {
      showAlert('Info', 'Generate QR code terlebih dahulu.', 'info');
      return;
    }
    try {
      await Share.share({
        message: `QR Check-in untuk ${guest.name}\nToken: ${guest.qr_token}`,
        title: `QR Code - ${guest.name}`,
      });
    } catch (error) {
      // user cancelled share
    }
  };

  const isCheckedIn = !!guest.checked_in_at;

  return (
    <View style={styles.container}>
      {/* Header */}
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
              <Text style={styles.headerTitle}>QR Code Tamu</Text>
              <Text style={styles.headerSubtitle}>Untuk check-in di acara</Text>
            </View>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Guest Info Card */}
        <View style={styles.guestCard}>
          <LinearGradient
            colors={[cat.color + 'CC', cat.color]}
            style={styles.guestAvatar}
          >
            <Text style={styles.guestAvatarText}>
              {guest.name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.guestName}>{guest.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: cat.color + '18' }]}>
            <Text style={[styles.categoryText, { color: cat.color }]}>{cat.label}</Text>
          </View>

          {/* Check-in status */}
          <View style={[
            styles.statusBadge,
            isCheckedIn
              ? { backgroundColor: theme.colors.success + '18' }
              : { backgroundColor: theme.colors.textSecondary + '15' },
          ]}>
            <Ionicons
              name={isCheckedIn ? 'checkmark-circle' : 'time-outline'}
              size={16}
              color={isCheckedIn ? theme.colors.success : theme.colors.textSecondary}
            />
            <Text style={[
              styles.statusText,
              { color: isCheckedIn ? theme.colors.success : theme.colors.textSecondary },
            ]}>
              {isCheckedIn
                ? `Check-in: ${new Date(guest.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                : 'Belum Check-in'}
            </Text>
          </View>
        </View>

        {/* QR Code Card */}
        <View style={styles.qrCard}>
          {guest.qr_token ? (
            <>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={guest.qr_token}
                  size={220}
                  color={theme.colors.text}
                  backgroundColor={theme.colors.surface}
                  logo={undefined}
                />
              </View>
              <Text style={styles.qrHint}>
                Tunjukkan QR ini ke panitia saat tiba di acara
              </Text>
              <Text style={styles.qrToken} numberOfLines={1}>
                {guest.qr_token}
              </Text>
            </>
          ) : (
            <View style={styles.noQrState}>
              <View style={styles.noQrIconBg}>
                <Ionicons name="qr-code-outline" size={52} color={theme.colors.primary} />
              </View>
              <Text style={styles.noQrTitle}>QR Belum Dibuat</Text>
              <Text style={styles.noQrText}>
                Tekan tombol di bawah untuk membuat QR code check-in untuk tamu ini.
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerateQr}
            disabled={generating}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={theme.colors.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateBtnGradient}
            >
              <Ionicons
                name={guest.qr_token ? 'refresh-outline' : 'qr-code-outline'}
                size={20}
                color={theme.colors.white}
              />
              <Text style={styles.generateBtnText}>
                {generating
                  ? 'Membuat...'
                  : guest.qr_token
                    ? 'Generate Ulang QR'
                    : 'Generate QR Code'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {isCheckedIn && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetCheckIn}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh-circle-outline" size={20} color={theme.colors.error} />
              <Text style={styles.resetBtnText}>Reset Check-in</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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

  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },

  // Guest card
  guestCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: theme.spacing.sm,
  },
  guestAvatar: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  guestAvatarText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  guestName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },

  // QR card
  qrCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  qrWrapper: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  qrHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  qrToken: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  noQrState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  noQrIconBg: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  noQrTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  noQrText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
  },

  // Actions
  actions: {
    gap: theme.spacing.sm,
  },
  generateBtn: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md + 2,
    gap: theme.spacing.sm,
  },
  generateBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.error + '50',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.error + '08',
  },
  resetBtnText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
});

export default GuestQrScreen;

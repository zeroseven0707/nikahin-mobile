import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../components/Input';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/invitationService';

const DELETED_ITEMS = [
  { icon: 'mail-outline',        text: 'Semua undangan yang dibuat' },
  { icon: 'people-outline',      text: 'Daftar tamu undangan' },
  { icon: 'chatbubbles-outline', text: 'RSVP dan ucapan tamu' },
  { icon: 'images-outline',      text: 'Foto galeri undangan' },
  { icon: 'stats-chart-outline', text: 'Statistik dan analitik' },
  { icon: 'person-outline',      text: 'Data profil dan akun' },
];

const DeleteAccountScreen = ({ navigation }) => {
  const { token, logout } = useAuth();
  const [loading, setLoading]       = useState(false);
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error', buttons: [] });

  const showAlert = (title, message, type = 'error', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const handleDelete = () => {
    if (!password) {
      showAlert('Perhatian', 'Masukkan password untuk konfirmasi', 'warning');
      return;
    }
    showAlert(
      'Hapus Akun Permanen?',
      'Semua data Anda akan dihapus selamanya dan tidak dapat dipulihkan. Lanjutkan?',
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Hapus', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await authService.deleteAccount(token, { password });
      showAlert(
        'Akun Dihapus',
        'Akun Anda telah berhasil dihapus. Terima kasih telah menggunakan Nikahin.',
        'success',
        [{ text: 'OK', style: 'primary', onPress: () => logout() }]
      );
    } catch (error) {
      showAlert('Gagal', error.response?.data?.message || 'Gagal menghapus akun. Periksa password Anda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7F1D1D', '#B91C1C', '#DC2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Hapus Akun</Text>
              <Text style={styles.headerSub}>Tindakan tidak dapat dibatalkan</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Warning banner */}
          <View style={styles.warningBanner}>
            <View style={styles.warningIconWrap}>
              <Ionicons name="warning" size={28} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Peringatan Serius</Text>
              <Text style={styles.warningText}>
                Menghapus akun adalah tindakan permanen. Semua data akan hilang selamanya.
              </Text>
            </View>
          </View>

          {/* What gets deleted */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: '#DC262615' }]}>
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </View>
              <Text style={styles.cardTitle}>Yang Akan Dihapus</Text>
            </View>
            <View style={styles.deleteGrid}>
              {DELETED_ITEMS.map(item => (
                <View key={item.text} style={styles.deleteItem}>
                  <View style={styles.deleteItemIcon}>
                    <Ionicons name={item.icon} size={14} color="#DC2626" />
                  </View>
                  <Text style={styles.deleteItemText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Confirm with password */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="lock-closed-outline" size={16} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Konfirmasi Identitas</Text>
            </View>
            <Text style={styles.confirmDesc}>
              Masukkan password Anda untuk memverifikasi sebelum menghapus akun.
            </Text>
            <Input
              label="Password"
              placeholder="Masukkan password Anda"
              value={password}
              onChangeText={setPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
              secureTextEntry={!showPass}
              onRightIconPress={() => setShowPass(p => !p)}
            />
            <View style={styles.infoBox}>
              <Ionicons name="time-outline" size={15} color="#DC2626" style={{ marginTop: 1 }} />
              <Text style={styles.infoText}>
                Data akan dihapus dalam 30 hari. Untuk membatalkan, hubungi{' '}
                <Text style={styles.infoEmail}>support@nikahin.app</Text>
              </Text>
            </View>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={[styles.deleteBtn, (!password || loading) && styles.deleteBtnDisabled]}
            onPress={handleDelete}
            disabled={!password || loading}
            activeOpacity={0.85}
          >
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.deleteBtnText}>
              {loading ? 'Menghapus...' : 'Hapus Akun Saya'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.cancelBtnText}>Batal, Kembali ke Profil</Text>
          </TouchableOpacity>

          <View style={{ height: theme.spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={() => setAlert(p => ({ ...p, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header: { paddingBottom: theme.spacing.md },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md },

  // Warning banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    backgroundColor: '#FEF2F2',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  warningIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#DC262615',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  warningTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#991B1B',
    marginBottom: 4,
  },
  warningText: {
    fontSize: theme.fontSize.sm,
    color: '#B91C1C',
    lineHeight: 20,
  },

  // Card
  card: {
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
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: theme.spacing.sm, marginBottom: theme.spacing.md,
  },
  cardIconBg: {
    width: 32, height: 32, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },

  // Delete grid
  deleteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  deleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    width: '47%',
  },
  deleteItemIcon: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: '#DC262610',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  deleteItemText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },

  // Confirm
  confirmDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: '#FEF2F2',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: theme.spacing.xs,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: '#B91C1C',
    lineHeight: 18,
  },
  infoEmail: {
    fontWeight: theme.fontWeight.semibold,
    textDecorationLine: 'underline',
  },

  // Delete button
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#DC2626',
    paddingVertical: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteBtnDisabled: {
    backgroundColor: theme.colors.textTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },

  // Cancel button
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  cancelBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
});

export default DeleteAccountScreen;

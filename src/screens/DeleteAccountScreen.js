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
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/invitationService';

const DANGER_RED = '#D32F2F';
const DANGER_LIGHT = '#FFEBEE';
const DANGER_BORDER = '#FFCDD2';

const DeleteAccountScreen = ({ navigation }) => {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error', buttons: [] });

  const showAlert = (title, message, type = 'error', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const handleDeleteAccount = () => {
    if (!password) {
      showAlert('Perhatian', 'Password harus diisi untuk konfirmasi', 'warning');
      return;
    }
    showAlert(
      'Hapus Akun Permanen?',
      'Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus selamanya. Lanjutkan?',
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Hapus Akun', style: 'destructive', onPress: confirmDelete },
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
      console.error('Error deleting account:', error);
      showAlert('Error', error.response?.data?.message || 'Gagal menghapus akun. Periksa password Anda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deletedItems = [
    { icon: 'mail-outline',         text: 'Semua undangan yang Anda buat' },
    { icon: 'people-outline',       text: 'Daftar tamu undangan' },
    { icon: 'chatbubbles-outline',  text: 'RSVP dan ucapan dari tamu' },
    { icon: 'stats-chart-outline',  text: 'Statistik dan analitik' },
    { icon: 'person-outline',       text: 'Data profil dan akun' },
  ];

  return (
    <View style={styles.container}>
      {/* Red danger header */}
      <LinearGradient
        colors={[DANGER_RED, '#B71C1C']}
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
              <Text style={styles.headerTitle}>Hapus Akun</Text>
              <Text style={styles.headerSubtitle}>Tindakan tidak dapat dibatalkan</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Warning Banner */}
          <View style={styles.section}>
            <View style={styles.warningBanner}>
              <View style={styles.warningIconBg}>
                <Ionicons name="warning" size={36} color={DANGER_RED} />
              </View>
              <Text style={styles.warningTitle}>Peringatan Serius!</Text>
              <Text style={styles.warningText}>
                Menghapus akun adalah tindakan permanen. Semua data Anda akan hilang selamanya dan tidak dapat dipulihkan.
              </Text>
            </View>
          </View>

          {/* What will be deleted */}
          <View style={styles.section}>
            <Card style={styles.deleteListCard}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIconBg, { backgroundColor: DANGER_RED + '15' }]}>
                  <Ionicons name="trash-outline" size={18} color={DANGER_RED} />
                </View>
                <Text style={styles.cardTitle}>Yang Akan Dihapus</Text>
              </View>
              {deletedItems.map((item) => (
                <View key={item.text} style={styles.deleteItem}>
                  <View style={styles.deleteItemIcon}>
                    <Ionicons name={item.icon} size={16} color={DANGER_RED} />
                  </View>
                  <Text style={styles.deleteItemText}>{item.text}</Text>
                </View>
              ))}
            </Card>
          </View>

          {/* Confirmation */}
          <View style={styles.section}>
            <Card>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIconBg, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Konfirmasi dengan Password</Text>
              </View>
              <Text style={styles.confirmText}>
                Masukkan password Anda untuk memverifikasi identitas sebelum menghapus akun:
              </Text>

              <Input
                label="Password"
                placeholder="Masukkan password Anda"
                value={password}
                onChangeText={setPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                secureTextEntry={!showPassword}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <View style={styles.infoBox}>
                <Ionicons name="time-outline" size={16} color={DANGER_RED} />
                <Text style={styles.infoText}>
                  Data Anda akan dihapus dalam 30 hari. Untuk membatalkan, hubungi{' '}
                  <Text style={styles.infoEmail}>support@nikahin.app</Text>
                </Text>
              </View>
            </Card>
          </View>

          {/* Delete Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.deleteButton, (!password || loading) && styles.deleteButtonDisabled]}
              onPress={handleDeleteAccount}
              disabled={loading || !password}
              activeOpacity={0.85}
            >
              <Ionicons name="trash" size={20} color={theme.colors.white} />
              <Text style={styles.deleteButtonText}>
                {loading ? 'Menghapus...' : 'Hapus Akun Saya Sekarang'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.deleteHint}>Tindakan ini tidak dapat dibatalkan</Text>
          </View>

          {/* Cancel */}
          <View style={styles.section}>
            <Button
              title="Batal, Kembali ke Profil"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="large"
              fullWidth
              icon="arrow-back-outline"
            />
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>

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

  keyboardView: { flex: 1 },
  content: { flex: 1 },
  section: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg },

  // Warning banner
  warningBanner: {
    backgroundColor: DANGER_LIGHT,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DANGER_BORDER,
  },
  warningIconBg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: DANGER_RED + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  warningTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: DANGER_RED, marginBottom: theme.spacing.sm },
  warningText: { fontSize: theme.fontSize.md, color: '#C62828', textAlign: 'center', lineHeight: 22 },

  // Card
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  cardIconBg: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },

  // Delete list
  deleteListCard: { borderWidth: 1, borderColor: DANGER_BORDER },
  deleteItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  deleteItemIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: DANGER_RED + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  deleteItemText: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.text },

  // Confirm
  confirmText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.md, lineHeight: 20 },
  infoBox: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: DANGER_LIGHT,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: DANGER_BORDER,
    marginTop: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: theme.fontSize.xs, color: '#C62828', lineHeight: 18 },
  infoEmail: { fontWeight: theme.fontWeight.semibold, textDecorationLine: 'underline' },

  // Delete button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: DANGER_RED,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: '#B71C1C',
    ...theme.shadows.md,
  },
  deleteButtonDisabled: { backgroundColor: theme.colors.textTertiary, borderColor: theme.colors.border, opacity: 0.6 },
  deleteButtonText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.white, letterSpacing: 0.3 },
  deleteHint: { fontSize: theme.fontSize.xs, color: DANGER_RED, textAlign: 'center', marginTop: theme.spacing.sm, fontStyle: 'italic' },
});

export default DeleteAccountScreen;

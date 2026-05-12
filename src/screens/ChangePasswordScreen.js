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

// ─── Password strength ────────────────────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 1, label: 'Lemah',       color: theme.colors.error   };
  if (score === 2) return { level: 2, label: 'Sedang',      color: theme.colors.warning };
  if (score === 3) return { level: 3, label: 'Kuat',        color: theme.colors.success };
  return              { level: 4, label: 'Sangat Kuat', color: theme.colors.primary };
};

const TIPS = [
  { icon: 'text-outline',          text: 'Minimal 8 karakter' },
  { icon: 'swap-vertical-outline', text: 'Kombinasi huruf besar & kecil' },
  { icon: 'keypad-outline',        text: 'Tambahkan angka (0–9)' },
  { icon: 'at-outline',            text: 'Gunakan simbol (!@#$%)' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
const ChangePasswordScreen = ({ navigation }) => {
  const { token, logout } = useAuth();
  const [loading, setLoading]       = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const strength = getStrength(form.new_password);
  const mismatch = form.new_password_confirmation.length > 0 &&
    form.new_password !== form.new_password_confirmation;

  const handleSubmit = async () => {
    if (!form.current_password) {
      showAlert('Perhatian', 'Password saat ini harus diisi', 'warning'); return;
    }
    if (form.new_password.length < 8) {
      showAlert('Perhatian', 'Password baru minimal 8 karakter', 'warning'); return;
    }
    if (mismatch || !form.new_password_confirmation) {
      showAlert('Perhatian', 'Konfirmasi password tidak sesuai', 'warning'); return;
    }

    setLoading(true);
    try {
      await authService.changePassword(token, form);
      showAlert(
        'Password Diubah',
        'Password berhasil diubah. Silakan masuk kembali dengan password baru.',
        'success',
        [{ text: 'OK', style: 'primary', onPress: () => logout() }]
      );
    } catch (error) {
      showAlert('Gagal', error.response?.data?.message || 'Gagal mengubah password', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Ubah Password</Text>
              <Text style={styles.headerSub}>Keamanan akun Anda</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Form card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBg}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Ganti Password</Text>
            </View>

            <Input
              label="Password Saat Ini"
              placeholder="Masukkan password saat ini"
              value={form.current_password}
              onChangeText={v => set('current_password', v)}
              leftIcon="lock-closed-outline"
              rightIcon={showCurrent ? 'eye-off-outline' : 'eye-outline'}
              secureTextEntry={!showCurrent}
              onRightIconPress={() => setShowCurrent(p => !p)}
            />

            <Input
              label="Password Baru"
              placeholder="Minimal 8 karakter"
              value={form.new_password}
              onChangeText={v => set('new_password', v)}
              leftIcon="lock-open-outline"
              rightIcon={showNew ? 'eye-off-outline' : 'eye-outline'}
              secureTextEntry={!showNew}
              onRightIconPress={() => setShowNew(p => !p)}
            />

            {/* Strength bar */}
            {strength && (
              <View style={styles.strengthWrap}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: i <= strength.level ? strength.color : theme.colors.border },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            <Input
              label="Konfirmasi Password Baru"
              placeholder="Ulangi password baru"
              value={form.new_password_confirmation}
              onChangeText={v => set('new_password_confirmation', v)}
              leftIcon="shield-checkmark-outline"
              rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              secureTextEntry={!showConfirm}
              onRightIconPress={() => setShowConfirm(p => !p)}
              error={mismatch ? 'Password tidak sesuai' : ''}
            />

            {/* Match indicator */}
            {form.new_password_confirmation.length > 0 && !mismatch && (
              <View style={styles.matchRow}>
                <Ionicons name="checkmark-circle" size={15} color={theme.colors.success} />
                <Text style={styles.matchText}>Password sesuai</Text>
              </View>
            )}

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.primary} style={{ marginTop: 1 }} />
              <Text style={styles.infoText}>
                Setelah berhasil, Anda akan diminta masuk kembali dengan password baru.
              </Text>
            </View>
          </View>

          {/* ── Tips ── */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={16} color={theme.colors.warning} />
              <Text style={styles.tipsTitle}>Tips Password Kuat</Text>
            </View>
            <View style={styles.tipsGrid}>
              {TIPS.map(t => (
                <View key={t.text} style={styles.tipItem}>
                  <View style={styles.tipIconBg}>
                    <Ionicons name={t.icon} size={14} color={theme.colors.success} />
                  </View>
                  <Text style={styles.tipText}>{t.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={theme.colors.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGrad}
            >
              {loading ? (
                <Text style={styles.submitText}>Menyimpan...</Text>
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                  <Text style={styles.submitText}>Ubah Password</Text>
                </>
              )}
            </LinearGradient>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: { paddingBottom: theme.spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Scroll
  scroll: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  // Form card
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  cardIconBg: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },

  // Strength
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    minWidth: 72,
    textAlign: 'right',
  },

  // Match
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  matchText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '08',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
    marginTop: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  // Tips card
  tipsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.warning + '30',
    backgroundColor: theme.colors.warning + '06',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  tipsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '47%',
  },
  tipIconBg: {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: theme.colors.success + '15',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  tipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },

  // Submit button
  submitBtn: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md + 2,
  },
  submitText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
});

export default ChangePasswordScreen;

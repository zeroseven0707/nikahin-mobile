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

const ChangePasswordScreen = ({ navigation }) => {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  // Password strength
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: theme.colors.border };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'Lemah', color: theme.colors.error };
    if (score === 2) return { level: 2, label: 'Sedang', color: theme.colors.warning };
    if (score === 3) return { level: 3, label: 'Kuat', color: theme.colors.success };
    return { level: 4, label: 'Sangat Kuat', color: theme.colors.primary };
  };

  const strength = getStrength(formData.new_password);

  const handleSubmit = async () => {
    if (!formData.current_password) {
      showAlert('Perhatian', 'Password saat ini harus diisi', 'warning');
      return;
    }
    if (!formData.new_password) {
      showAlert('Perhatian', 'Password baru harus diisi', 'warning');
      return;
    }
    if (formData.new_password.length < 8) {
      showAlert('Perhatian', 'Password baru minimal 8 karakter', 'warning');
      return;
    }
    if (formData.new_password !== formData.new_password_confirmation) {
      showAlert('Perhatian', 'Konfirmasi password tidak sesuai', 'warning');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(token, formData);
      showAlert(
        'Password Diubah!',
        'Password berhasil diubah. Silakan login kembali dengan password baru.',
        'success',
        [{ text: 'OK', style: 'primary', onPress: () => logout() }]
      );
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert('Error', error.response?.data?.message || 'Gagal mengubah password', 'error');
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
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Ubah Password</Text>
              <Text style={styles.headerSubtitle}>Keamanan akun Anda</Text>
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
          <View style={styles.section}>
            <Card>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBg}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Ganti Password</Text>
              </View>

              <Input
                label="Password Saat Ini"
                placeholder="Masukkan password saat ini"
                value={formData.current_password}
                onChangeText={(v) => update('current_password', v)}
                leftIcon="lock-closed-outline"
                rightIcon={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                secureTextEntry={!showCurrent}
                onRightIconPress={() => setShowCurrent(!showCurrent)}
              />

              <Input
                label="Password Baru"
                placeholder="Minimal 8 karakter"
                value={formData.new_password}
                onChangeText={(v) => update('new_password', v)}
                leftIcon="lock-open-outline"
                rightIcon={showNew ? 'eye-off-outline' : 'eye-outline'}
                secureTextEntry={!showNew}
                onRightIconPress={() => setShowNew(!showNew)}
              />

              {/* Password strength indicator */}
              {formData.new_password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i <= strength.level ? strength.color : theme.colors.border }
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
                value={formData.new_password_confirmation}
                onChangeText={(v) => update('new_password_confirmation', v)}
                leftIcon="lock-closed-outline"
                rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                secureTextEntry={!showConfirm}
                onRightIconPress={() => setShowConfirm(!showConfirm)}
                error={
                  formData.new_password_confirmation &&
                  formData.new_password !== formData.new_password_confirmation
                    ? 'Password tidak sesuai'
                    : ''
                }
              />

              {/* Info box */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  Setelah mengubah password, Anda akan diminta login kembali dengan password baru.
                </Text>
              </View>
            </Card>
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Card style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb-outline" size={18} color={theme.colors.secondary} />
                <Text style={styles.tipsTitle}>Tips Password Kuat</Text>
              </View>
              {[
                'Minimal 8 karakter',
                'Kombinasi huruf besar & kecil',
                'Tambahkan angka (0-9)',
                'Gunakan simbol (!@#$%)',
              ].map((tip) => (
                <View key={tip} style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </Card>
          </View>

          <View style={styles.section}>
            <Button
              title="Ubah Password"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              icon="shield-checkmark-outline"
              size="large"
              fullWidth
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

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  sectionIconBg: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },

  // Strength indicator
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.semibold, width: 70, textAlign: 'right' },

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
  infoText: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, lineHeight: 20 },

  // Tips card
  tipsCard: { backgroundColor: theme.colors.secondary + '08', borderWidth: 1, borderColor: theme.colors.secondary + '30' },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  tipsTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  tipItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  tipText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
});

export default ChangePasswordScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import CustomAlert from '../../components/CustomAlert';
import { theme } from '../../config/theme';
import { authService } from '../../services/invitationService';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
  const { login } = useAuth();

  const showAlert = (title, message, type = 'error') => {
    setAlert({ visible: true, title, message, type });
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirmation.trim()) {
      showAlert('Perhatian', 'Silakan isi semua field', 'warning');
      return;
    }
    if (password !== passwordConfirmation) {
      showAlert('Perhatian', 'Password dan konfirmasi password tidak sama', 'warning');
      return;
    }
    if (password.length < 8) {
      showAlert('Perhatian', 'Password minimal 8 karakter', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(
        name.trim(),
        email.trim(),
        password,
        passwordConfirmation
      );
      await login(response.user, response.token);
    } catch (error) {
      showAlert(
        'Registrasi Gagal',
        error.response?.data?.message || 'Terjadi kesalahan, silakan coba lagi'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={theme.colors.gradient.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            bounces={false}
          >
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
              </TouchableOpacity>
            </View>

            {/* Hero Section */}
            <View style={styles.hero}>
              <View style={styles.logoBackground}>
                <Ionicons name="person-add" size={44} color={theme.colors.white} />
              </View>
              <Text style={styles.appName}>Buat Akun</Text>
              <Text style={styles.tagline}>Mulai perjalanan undangan digital Anda</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Input
                label="Nama Lengkap"
                value={name}
                onChangeText={setName}
                leftIcon="person-outline"
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <Input
                label="Password (min. 8 karakter)"
                value={password}
                onChangeText={setPassword}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                returnKeyType="next"
              />

              <Input
                label="Konfirmasi Password"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showPasswordConfirmation}
                autoCapitalize="none"
                autoCorrect={false}
                rightIcon={showPasswordConfirmation ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              <Button
                title="Daftar Sekarang"
                onPress={handleRegister}
                loading={loading}
                size="large"
                fullWidth
                icon="checkmark-circle-outline"
                iconPosition="right"
                style={styles.registerButton}
              />

              {/* Privacy Policy & Terms */}
              <Text style={styles.termsText}>
                Dengan mendaftar, Anda menyetujui{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => Linking.openURL('https://nikahin.online/terms')}
                >
                  Syarat & Ketentuan
                </Text>
                {' '}dan{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => Linking.openURL('https://nikahin.online/privacy')}
                >
                  Kebijakan Privasi
                </Text>
                {' '}kami.
              </Text>

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Sudah punya akun? </Text>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}>Masuk</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.bottomPad} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  // Top Bar
  topBar: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  logoBackground: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: theme.spacing.md,
  },
  appName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.white,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },

  // Form Card
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // No elevation on Android — causes re-layout on state change inside card
  },
  registerButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  termsText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    textDecorationLine: 'underline',
  },

  bottomPad: {
    height: theme.spacing.xxl,
  },
});

export default RegisterScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
  const { login } = useAuth();

  const showAlert = (title, message, type = 'error') => {
    setAlert({ visible: true, title, message, type });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Perhatian', 'Silakan isi email dan password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email.trim(), password);
      await login(response.user, response.token);
    } catch (error) {
      showAlert(
        'Login Gagal',
        error.response?.data?.message || 'Email atau password salah'
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
            {/* Hero Section */}
            <View style={styles.hero}>
              <View style={styles.logoBackground}>
                <Ionicons name="mail-open" size={48} color={theme.colors.white} />
              </View>
              <Text style={styles.appName}>Nikahin</Text>
              <Text style={styles.tagline}>Undangan Digital Pernikahan</Text>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Ionicons name="heart" size={14} color="rgba(255,255,255,0.6)" />
                <View style={styles.dividerLine} />
              </View>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Masuk ke Akun</Text>
              <Text style={styles.formSubtitle}>Selamat datang kembali</Text>

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
                label="Password"
                value={password}
                onChangeText={setPassword}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <Button
                title="Masuk"
                onPress={handleLogin}
                loading={loading}
                size="large"
                fullWidth
                icon="log-in-outline"
                iconPosition="right"
                style={styles.loginButton}
              />

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Belum punya akun? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerLink}>Daftar Sekarang</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom padding so content isn't hidden behind keyboard on small screens */}
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
    paddingTop: theme.spacing.xl,
  },

  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: theme.spacing.md,
  },
  appName: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.white,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    width: 120,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
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
  formTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  formSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  loginButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  registerLink: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },

  bottomPad: {
    height: theme.spacing.xxl,
  },
});

export default LoginScreen;

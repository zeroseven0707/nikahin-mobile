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

const EditProfileScreen = ({ navigation }) => {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const getInitials = (name) => {
    const parts = (name || '').trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (name || '?').substring(0, 2).toUpperCase();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showAlert('Perhatian', 'Nama harus diisi', 'warning');
      return;
    }
    if (!formData.email.trim()) {
      showAlert('Perhatian', 'Email harus diisi', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.updateProfile(token, formData);
      updateUser(response.user);
      showAlert('Berhasil!', 'Profil berhasil diperbarui', 'success', [
        { text: 'OK', style: 'primary', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('Error', error.response?.data?.message || 'Gagal memperbarui profil', 'error');
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
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profil</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Avatar preview */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.2)']}
              style={styles.avatarBorder}
            >
              <LinearGradient
                colors={[theme.colors.primaryLight, theme.colors.primaryDark]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{getInitials(formData.name || user?.name)}</Text>
              </LinearGradient>
            </LinearGradient>
            <Text style={styles.avatarHint}>Inisial dari nama Anda</Text>
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
                  <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Informasi Pribadi</Text>
              </View>

              <Input
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChangeText={(v) => update('name', v)}
                leftIcon="person-outline"
              />
              <Input
                label="Email"
                placeholder="email@example.com"
                value={formData.email}
                onChangeText={(v) => update('email', v)}
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Card>
          </View>

          <View style={styles.section}>
            <Button
              title="Simpan Perubahan"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              icon="checkmark-circle-outline"
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

  header: { paddingBottom: theme.spacing.xl },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  headerButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.white },

  avatarSection: { alignItems: 'center', paddingBottom: theme.spacing.md },
  avatarBorder: {
    width: 88, height: 88, borderRadius: 44,
    padding: 3, justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 82, height: 82, borderRadius: 41,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
  avatarHint: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.75)' },

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
});

export default EditProfileScreen;

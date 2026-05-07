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
import { guestService } from '../services/invitationService';

const categories = [
  { value: 'family',    label: 'Keluarga',    icon: 'people',              color: theme.colors.primary },
  { value: 'friend',    label: 'Teman',       icon: 'happy-outline',       color: theme.colors.success },
  { value: 'colleague', label: 'Rekan Kerja', icon: 'briefcase-outline',   color: theme.colors.accent },
  { value: 'other',     label: 'Lainnya',     icon: 'ellipsis-horizontal', color: theme.colors.info },
];

const AddGuestScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    pax: '1',
    category: 'family',
  });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showAlert('Perhatian', 'Nama tamu harus diisi', 'warning');
      return;
    }
    if (!formData.pax || parseInt(formData.pax) < 1) {
      showAlert('Perhatian', 'Jumlah tamu minimal 1', 'warning');
      return;
    }

    setLoading(true);
    try {
      await guestService.addGuest(token, invitation.id, {
        ...formData,
        pax: parseInt(formData.pax),
      });
      showAlert('Berhasil!', 'Tamu berhasil ditambahkan', 'success', [
        { text: 'OK', style: 'primary', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error adding guest:', error);
      showAlert('Error', 'Gagal menambahkan tamu', 'error');
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
              <Text style={styles.headerTitle}>Tambah Tamu</Text>
              <Text style={styles.headerSubtitle}>{invitation.bride_name} & {invitation.groom_name}</Text>
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
          {/* Info Form */}
          <View style={styles.section}>
            <Card>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBg}>
                  <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Informasi Tamu</Text>
              </View>

              <Input
                label="Nama Lengkap *"
                placeholder="Masukkan nama tamu"
                value={formData.name}
                onChangeText={(v) => update('name', v)}
                leftIcon="person-outline"
              />
              <Input
                label="Nomor Telepon / WhatsApp"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChangeText={(v) => update('phone', v)}
                leftIcon="call-outline"
                keyboardType="phone-pad"
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
              <Input
                label="Alamat"
                placeholder="Alamat lengkap tamu"
                value={formData.address}
                onChangeText={(v) => update('address', v)}
                leftIcon="location-outline"
                multiline
                numberOfLines={3}
              />
              <Input
                label="Jumlah Tamu (Pax) *"
                placeholder="1"
                value={formData.pax}
                onChangeText={(v) => update('pax', v)}
                leftIcon="people-outline"
                keyboardType="number-pad"
                helperText="Jumlah orang dalam satu undangan"
              />
            </Card>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Card>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBg}>
                  <Ionicons name="pricetag-outline" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Kategori Tamu</Text>
              </View>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => {
                  const isActive = formData.category === cat.value;
                  return (
                    <TouchableOpacity
                      key={cat.value}
                      style={[styles.categoryItem, isActive && { borderColor: cat.color, backgroundColor: cat.color + '12' }]}
                      onPress={() => update('category', cat.value)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.categoryIconBg, { backgroundColor: isActive ? cat.color : cat.color + '20' }]}>
                        <Ionicons name={cat.icon} size={22} color={isActive ? theme.colors.white : cat.color} />
                      </View>
                      <Text style={[styles.categoryText, isActive && { color: cat.color, fontWeight: theme.fontWeight.semibold }]}>
                        {cat.label}
                      </Text>
                      {isActive && (
                        <View style={[styles.categoryCheck, { backgroundColor: cat.color }]}>
                          <Ionicons name="checkmark" size={10} color={theme.colors.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </View>

          {/* Submit */}
          <View style={styles.section}>
            <Button
              title="Tambah Tamu"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              icon="person-add-outline"
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

  keyboardView: { flex: 1 },
  content: { flex: 1 },
  section: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  sectionIconBg: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },

  // Category
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  categoryItem: {
    width: '47%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: theme.spacing.sm,
    position: 'relative',
  },
  categoryIconBg: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  categoryText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },
  categoryCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
});

export default AddGuestScreen;

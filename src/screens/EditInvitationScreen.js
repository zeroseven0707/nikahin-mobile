import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import WebViewModal from '../components/WebViewModal';
import { WEB_BASE_URL } from '../config/api';
import Button from '../components/Button';
import Card from '../components/Card';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { invitationService } from '../services/invitationService';

const EditInvitationScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Form state - initialize with existing data
  const [brideName, setBrideName] = useState(invitation.bride_name || '');
  const [brideFatherName, setBrideFatherName] = useState(invitation.bride_father_name || '');
  const [brideMotherName, setBrideMotherName] = useState(invitation.bride_mother_name || '');
  const [groomName, setGroomName] = useState(invitation.groom_name || '');
  const [groomFatherName, setGroomFatherName] = useState(invitation.groom_father_name || '');
  const [groomMotherName, setGroomMotherName] = useState(invitation.groom_mother_name || '');
  
  const [akadDate, setAkadDate] = useState(invitation.akad_date || '');
  const [akadTimeStart, setAkadTimeStart] = useState(invitation.akad_time_start || '');
  const [akadTimeEnd, setAkadTimeEnd] = useState(invitation.akad_time_end || '');
  const [akadLocation, setAkadLocation] = useState(invitation.akad_location || '');
  
  const [receptionDate, setReceptionDate] = useState(invitation.reception_date || '');
  const [receptionTimeStart, setReceptionTimeStart] = useState(invitation.reception_time_start || '');
  const [receptionTimeEnd, setReceptionTimeEnd] = useState(invitation.reception_time_end || '');
  const [receptionLocation, setReceptionLocation] = useState(invitation.reception_location || '');
  
  const [fullAddress, setFullAddress] = useState(invitation.full_address || '');
  const [latitude, setLatitude] = useState(invitation.latitude || '');
  const [longitude, setLongitude] = useState(invitation.longitude || '');

  const handleSubmit = async () => {
    if (!brideName || !groomName || !akadDate || !receptionDate) {
      Alert.alert('Error', 'Silakan isi semua field yang wajib');
      return;
    }

    setLoading(true);
    try {
      const data = {
        bride_name: brideName,
        bride_father_name: brideFatherName,
        bride_mother_name: brideMotherName,
        groom_name: groomName,
        groom_father_name: groomFatherName,
        groom_mother_name: groomMotherName,
        akad_date: akadDate,
        akad_time_start: akadTimeStart,
        akad_time_end: akadTimeEnd,
        akad_location: akadLocation,
        reception_date: receptionDate,
        reception_time_start: receptionTimeStart,
        reception_time_end: receptionTimeEnd,
        reception_location: receptionLocation,
        full_address: fullAddress,
        latitude: latitude,
        longitude: longitude,
      };

      await invitationService.updateInvitation(token, invitation.id, data);
      Alert.alert('Berhasil', 'Undangan berhasil diupdate', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Gagal mengupdate undangan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Undangan</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setPreviewUrl(`${WEB_BASE_URL}/i/${invitation.unique_url}`);
              setPreviewVisible(true);
            }}
          >
            <Ionicons name="eye-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Same form as CreateInvitationScreen but with pre-filled data */}
          {/* Mempelai Wanita */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mempelai Wanita</Text>
            <Card>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Lengkap *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nama mempelai wanita"
                  value={brideName}
                  onChangeText={setBrideName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Ayah</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nama ayah"
                  value={brideFatherName}
                  onChangeText={setBrideFatherName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Ibu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nama ibu"
                  value={brideMotherName}
                  onChangeText={setBrideMotherName}
                />
              </View>
            </Card>
          </View>

          {/* Mempelai Pria */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mempelai Pria</Text>
            <Card>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Lengkap *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nama mempelai pria"
                  value={groomName}
                  onChangeText={setGroomName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Ayah</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nama ayah"
                  value={groomFatherName}
                  onChangeText={setGroomFatherName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Ibu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nama ibu"
                  value={groomMotherName}
                  onChangeText={setGroomMotherName}
                />
              </View>
            </Card>
          </View>

          {/* Akad Nikah */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Akad Nikah</Text>
            <Card>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tanggal * (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-12-25"
                  value={akadDate}
                  onChangeText={setAkadDate}
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Waktu Mulai</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10:00"
                    value={akadTimeStart}
                    onChangeText={setAkadTimeStart}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Waktu Selesai</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="11:00"
                    value={akadTimeEnd}
                    onChangeText={setAkadTimeEnd}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lokasi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masjid Al-Ikhlas"
                  value={akadLocation}
                  onChangeText={setAkadLocation}
                />
              </View>
            </Card>
          </View>

          {/* Resepsi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resepsi</Text>
            <Card>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tanggal * (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-12-25"
                  value={receptionDate}
                  onChangeText={setReceptionDate}
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Waktu Mulai</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="18:00"
                    value={receptionTimeStart}
                    onChangeText={setReceptionTimeStart}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Waktu Selesai</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="21:00"
                    value={receptionTimeEnd}
                    onChangeText={setReceptionTimeEnd}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lokasi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Grand Ballroom Hotel XYZ"
                  value={receptionLocation}
                  onChangeText={setReceptionLocation}
                />
              </View>
            </Card>
          </View>

          {/* Lokasi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alamat Lengkap</Text>
            <Card>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Alamat</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
                  value={fullAddress}
                  onChangeText={setFullAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="-6.200000"
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="106.816666"
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </Card>
          </View>

          {/* Submit Button */}
          <View style={styles.section}>
            <Button
              title="Simpan Perubahan"
              onPress={handleSubmit}
              loading={loading}
              size="large"
            />
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <WebViewModal
        visible={previewVisible}
        url={previewUrl}
        title="Pratinjau Undangan"
        onClose={() => {
          setPreviewVisible(false);
          setPreviewUrl(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
});

export default EditInvitationScreen;

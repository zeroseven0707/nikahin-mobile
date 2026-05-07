import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WebViewModal from '../components/WebViewModal';
import Input from '../components/Input';
import Button from '../components/Button';
import DateTimePickerComponent from '../components/DateTimePicker';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { invitationService } from '../services/invitationService';
import api, { WEB_BASE_URL } from '../config/api';

const steps = [
  { number: 1, title: 'Template',  icon: 'images-outline',     color: theme.colors.primary },
  { number: 2, title: 'Wanita',    icon: 'woman-outline',      color: '#EC4899' },
  { number: 3, title: 'Pria',      icon: 'man-outline',        color: '#3B82F6' },
  { number: 4, title: 'Akad',      icon: 'heart-outline',      color: '#EF4444' },
  { number: 5, title: 'Resepsi',   icon: 'restaurant-outline', color: '#F59E0B' },
  { number: 6, title: 'Lokasi',    icon: 'location-outline',   color: '#10B981' },
];

const CreateInvitationWizardScreen = ({ navigation, route }) => {
  const { token } = useAuth();
  const selectedTemplateId = route?.params?.selectedTemplateId ?? null;

  const [currentStep, setCurrentStep] = useState(selectedTemplateId ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: 'info', title: '', message: '', buttons: [] });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [formData, setFormData] = useState({
    template_id: selectedTemplateId,
    bride_name: '', bride_father_name: '', bride_mother_name: '',
    groom_name: '', groom_father_name: '', groom_mother_name: '',
    akad_date: '', akad_time_start: '', akad_time_end: '', akad_location: '',
    reception_date: '', reception_time_start: '', reception_time_end: '', reception_location: '',
    full_address: '', latitude: '', longitude: '',
  });

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (currentStep === 1) loadTemplates(1, '');
  }, [currentStep]);

  const loadTemplates = async (page = 1, search = searchQuery) => {
    try {
      page === 1 ? setLoading(true) : setLoadingMore(true);
      const response = await api.get('/templates', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: 10, search },
      });
      const newTemplates = response.data.templates || [];
      const pagination = response.data.pagination || {};
      setTemplates(page === 1 ? newTemplates : prev => [...prev, ...newTemplates]);
      setCurrentPage(pagination.current_page || 1);
      setLastPage(pagination.last_page || 1);
      setTotalTemplates(pagination.total || 0);
    } catch {
      showAlert({ type: 'error', title: 'Error', message: 'Gagal memuat template.', buttons: [{ text: 'OK', style: 'primary' }] });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => loadTemplates(1, text), 500));
  };

  const showAlert = (config) => setAlertConfig({ visible: true, ...config });
  const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const handleSelectTemplate = (template) => {
    set('template_id', template.id);
    showAlert({
      type: 'confirm',
      title: 'Template Dipilih',
      message: `Template "${template.name}" dipilih. Lanjutkan?`,
      buttons: [
        { text: 'Batal', style: 'cancel' },
        { text: 'Lanjut', style: 'primary', onPress: () => handleNext() },
      ],
    });
  };

  const handlePreview = (templateId) => {
    setPreviewUrl(`${WEB_BASE_URL}/templates/${templateId}/preview`);
    setPreviewVisible(true);
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < 6) setCurrentStep(s => s + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
    else navigation.goBack();
  };

  const validateStep = () => {
    const warn = (msg) => { showAlert({ type: 'warning', title: 'Data Belum Lengkap', message: msg, buttons: [{ text: 'OK', style: 'primary' }] }); return false; };
    if (currentStep === 1 && !formData.template_id) return warn('Pilih template terlebih dahulu');
    if (currentStep === 2 && !formData.bride_name.trim()) return warn('Nama mempelai wanita harus diisi');
    if (currentStep === 3 && !formData.groom_name.trim()) return warn('Nama mempelai pria harus diisi');
    if (currentStep === 4 && (!formData.akad_date || !formData.akad_location.trim())) return warn('Tanggal dan lokasi akad harus diisi');
    if (currentStep === 5 && (!formData.reception_date || !formData.reception_location.trim())) return warn('Tanggal dan lokasi resepsi harus diisi');
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await invitationService.createInvitation(token, formData);
      showAlert({
        type: 'success',
        title: 'Undangan Dibuat!',
        message: 'Undangan berhasil dibuat. Anda akan diarahkan ke dashboard.',
        buttons: [{ text: 'OK', style: 'primary', onPress: () => navigation.navigate('Main', { screen: 'Dashboard' }) }],
      });
    } catch {
      showAlert({ type: 'error', title: 'Gagal', message: 'Terjadi kesalahan. Silakan coba lagi.', buttons: [{ text: 'OK', style: 'primary' }] });
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep - 1];
  const progress = (currentStep - 1) / (steps.length - 1);

  // ── STEP INDICATOR ──
  const renderStepIndicator = () => (
    <View style={styles.stepBar}>
      {/* Progress track */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Step dots */}
      <View style={styles.stepDots}>
        {steps.map((step) => {
          const done = currentStep > step.number;
          const active = currentStep === step.number;
          return (
            <View key={step.number} style={styles.stepDotWrap}>
              <View style={[
                styles.stepDot,
                done && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                active && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, transform: [{ scale: 1.2 }] },
              ]}>
                {done
                  ? <Ionicons name="checkmark" size={11} color={theme.colors.white} />
                  : <Ionicons name={step.icon} size={11} color={active ? theme.colors.white : theme.colors.textTertiary} />
                }
              </View>
              <Text style={[styles.stepDotLabel, active && styles.stepDotLabelActive]}>
                {step.title}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  // ── STEP HEADER (inside scroll) ──
  const renderStepHeader = (icon, title, subtitle, color) => (
    <View style={styles.stepHeader}>
      <View style={[styles.stepHeaderIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.stepHeaderText}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  // ── TEMPLATE STEP ──
  const renderTemplateStep = () => (
    <View>
      {renderStepHeader('images-outline', 'Pilih Template', 'Pilih desain yang sesuai tema pernikahan Anda', theme.colors.primary)}

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={theme.colors.primary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari template..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {totalTemplates > 0 && (
        <Text style={styles.templateCountText}>{totalTemplates} template tersedia</Text>
      )}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat template...</Text>
        </View>
      )}

      {!loading && templates.map((item) => {
        const isSelected = formData.template_id === item.id;
        return (
          <View key={item.id} style={[styles.templateCard, isSelected && styles.templateCardSelected]}>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.white} />
                <Text style={styles.selectedBadgeText}>Terpilih</Text>
              </View>
            )}
            <View style={styles.templateThumb}>
              {item.thumbnail_path ? (
                <Image source={{ uri: `${WEB_BASE_URL}/storage/${item.thumbnail_path}` }} style={styles.thumbImg} resizeMode="cover" />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Ionicons name="images-outline" size={28} color={theme.colors.primary} />
                </View>
              )}
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{item.name}</Text>
              <Text style={styles.templateDesc} numberOfLines={2}>{item.description || 'Template undangan elegan dan modern'}</Text>
              <View style={styles.templateBtns}>
                <TouchableOpacity style={styles.btnPreview} onPress={() => handlePreview(item.id)} activeOpacity={0.7}>
                  <Ionicons name="eye-outline" size={13} color={theme.colors.primary} />
                  <Text style={styles.btnPreviewText}>Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnSelect, isSelected && styles.btnSelectActive]}
                  onPress={() => handleSelectTemplate(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={isSelected ? 'checkmark-circle' : 'add-circle-outline'} size={13} color={isSelected ? theme.colors.white : theme.colors.primary} />
                  <Text style={[styles.btnSelectText, isSelected && styles.btnSelectTextActive]}>
                    {isSelected ? 'Terpilih' : 'Pilih'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}

      {!loading && currentPage < lastPage && (
        <TouchableOpacity style={styles.loadMoreBtn} onPress={() => loadTemplates(currentPage + 1)} disabled={loadingMore}>
          {loadingMore
            ? <ActivityIndicator size="small" color={theme.colors.primary} />
            : <><Ionicons name="chevron-down-outline" size={18} color={theme.colors.primary} /><Text style={styles.loadMoreText}>Muat Lebih Banyak</Text></>
          }
        </TouchableOpacity>
      )}

      {!loading && templates.length === 0 && (
        <View style={styles.emptyBox}>
          <Ionicons name="search-outline" size={40} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>Tidak ada template ditemukan</Text>
        </View>
      )}
    </View>
  );

  // ── FORM STEPS ──
  const renderBrideStep = () => (
    <View>
      {renderStepHeader('woman-outline', 'Mempelai Wanita', 'Isi informasi lengkap mempelai wanita', '#EC4899')}
      <Input label="Nama Lengkap *" placeholder="Contoh: Siti Nurhaliza" value={formData.bride_name} onChangeText={v => set('bride_name', v)} leftIcon="woman-outline" />
      <Input label="Nama Ayah" placeholder="Nama ayah kandung" value={formData.bride_father_name} onChangeText={v => set('bride_father_name', v)} leftIcon="person-outline" />
      <Input label="Nama Ibu" placeholder="Nama ibu kandung" value={formData.bride_mother_name} onChangeText={v => set('bride_mother_name', v)} leftIcon="person-outline" />
    </View>
  );

  const renderGroomStep = () => (
    <View>
      {renderStepHeader('man-outline', 'Mempelai Pria', 'Isi informasi lengkap mempelai pria', '#3B82F6')}
      <Input label="Nama Lengkap *" placeholder="Contoh: Ahmad Dhani" value={formData.groom_name} onChangeText={v => set('groom_name', v)} leftIcon="man-outline" />
      <Input label="Nama Ayah" placeholder="Nama ayah kandung" value={formData.groom_father_name} onChangeText={v => set('groom_father_name', v)} leftIcon="person-outline" />
      <Input label="Nama Ibu" placeholder="Nama ibu kandung" value={formData.groom_mother_name} onChangeText={v => set('groom_mother_name', v)} leftIcon="person-outline" />
    </View>
  );

  const renderAkadStep = () => (
    <View>
      {renderStepHeader('heart-outline', 'Akad Nikah', 'Waktu dan tempat pelaksanaan akad nikah', '#EF4444')}
      <DateTimePickerComponent label="Tanggal Akad *" value={formData.akad_date} onChange={v => set('akad_date', v)} mode="date" leftIcon="calendar-outline" />
      <DateTimePickerComponent label="Waktu Mulai" value={formData.akad_time_start} onChange={v => set('akad_time_start', v)} mode="time" leftIcon="time-outline" />
      <DateTimePickerComponent label="Waktu Selesai" value={formData.akad_time_end} onChange={v => set('akad_time_end', v)} mode="time" leftIcon="time-outline" />
      <Input label="Lokasi Akad *" placeholder="Nama gedung / masjid" value={formData.akad_location} onChangeText={v => set('akad_location', v)} leftIcon="location-outline" />
    </View>
  );

  const renderReceptionStep = () => (
    <View>
      {renderStepHeader('restaurant-outline', 'Resepsi Pernikahan', 'Waktu dan tempat pelaksanaan resepsi', '#F59E0B')}
      <DateTimePickerComponent label="Tanggal Resepsi *" value={formData.reception_date} onChange={v => set('reception_date', v)} mode="date" leftIcon="calendar-outline" />
      <DateTimePickerComponent label="Waktu Mulai" value={formData.reception_time_start} onChange={v => set('reception_time_start', v)} mode="time" leftIcon="time-outline" />
      <DateTimePickerComponent label="Waktu Selesai" value={formData.reception_time_end} onChange={v => set('reception_time_end', v)} mode="time" leftIcon="time-outline" />
      <Input label="Lokasi Resepsi *" placeholder="Nama gedung / tempat" value={formData.reception_location} onChangeText={v => set('reception_location', v)} leftIcon="location-outline" />
    </View>
  );

  const renderLocationStep = () => (
    <View>
      {renderStepHeader('location-outline', 'Alamat Lengkap', 'Informasi alamat detail (opsional)', '#10B981')}
      <Input label="Alamat Lengkap" placeholder="Jalan, nomor, kota, provinsi" value={formData.full_address} onChangeText={v => set('full_address', v)} leftIcon="map-outline" multiline numberOfLines={3} />
      <Input label="Latitude (Opsional)" placeholder="-6.200000" value={formData.latitude} onChangeText={v => set('latitude', v)} leftIcon="navigate-outline" keyboardType="numeric" />
      <Input label="Longitude (Opsional)" placeholder="106.816666" value={formData.longitude} onChangeText={v => set('longitude', v)} leftIcon="navigate-outline" keyboardType="numeric" />
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.infoText}>Koordinat GPS membantu tamu menemukan lokasi via Google Maps</Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderTemplateStep();
      case 2: return renderBrideStep();
      case 3: return renderGroomStep();
      case 4: return renderAkadStep();
      case 5: return renderReceptionStep();
      case 6: return renderLocationStep();
      default: return null;
    }
  };

  const isLastStep = currentStep === 6;

  return (
    <View style={styles.container}>
      <CustomAlert visible={alertConfig.visible} onClose={hideAlert} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} buttons={alertConfig.buttons} />

      {/* ── HEADER ── */}
      <LinearGradient colors={theme.colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Buat Undangan</Text>
              <Text style={styles.headerSub}>Langkah {currentStep} / {steps.length}</Text>
            </View>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── STEP INDICATOR ── */}
      {renderStepIndicator()}

      {/* ── CONTENT ── */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView style={styles.flex} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={styles.scrollContent}>

          {/* Step card */}
          <View style={styles.stepCard}>
            {renderStepContent()}
          </View>

          {/* Navigation buttons */}
          <View style={styles.navRow}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.btnBack} onPress={handleBack} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
                <Text style={styles.btnBackText}>Kembali</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.btnNext, currentStep === 1 && styles.btnNextFull]}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={theme.colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnNextGradient}
              >
                {loading
                  ? <ActivityIndicator size="small" color={theme.colors.white} />
                  : <>
                      <Text style={styles.btnNextText}>{isLastStep ? 'Buat Undangan' : 'Lanjut'}</Text>
                      <Ionicons name={isLastStep ? 'checkmark-circle-outline' : 'arrow-forward'} size={18} color={theme.colors.white} />
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <WebViewModal
        visible={previewVisible}
        url={previewUrl}
        title="Pratinjau Template"
        onClose={() => {
          setPreviewVisible(false);
          setPreviewUrl(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },

  // ── HEADER ──
  header: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // ── STEP BAR ──
  stepBar: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepDotWrap: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.colors.background,
    borderWidth: 2, borderColor: theme.colors.border,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  stepDotLabel: {
    fontSize: 9,
    color: theme.colors.textTertiary,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  stepDotLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },

  // ── SCROLL ──
  scrollContent: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  // ── STEP CARD ──
  stepCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: theme.spacing.lg,
  },

  // ── STEP HEADER ──
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  stepHeaderIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  stepHeaderText: { flex: 1 },
  stepTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  // ── SEARCH ──
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  templateCountText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },

  // ── LOADING / EMPTY ──
  loadingBox: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyBox: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },

  // ── TEMPLATE CARD ──
  templateCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  templateCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '04',
  },
  selectedBadge: {
    position: 'absolute', top: 0, right: 0, zIndex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm, paddingVertical: 4,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  selectedBadgeText: {
    fontSize: 10, color: theme.colors.white, fontWeight: theme.fontWeight.semibold,
  },
  templateThumb: {
    width: 80, height: 110,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  templateInfo: { flex: 1 },
  templateName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  templateBtns: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 'auto',
  },
  btnPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5, borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  btnPreviewText: {
    fontSize: theme.fontSize.xs, color: theme.colors.primary, fontWeight: theme.fontWeight.semibold,
  },
  btnSelect: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5, borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  btnSelectActive: {
    backgroundColor: theme.colors.primary, borderColor: theme.colors.primary,
  },
  btnSelectText: {
    fontSize: theme.fontSize.xs, color: theme.colors.primary, fontWeight: theme.fontWeight.semibold,
  },
  btnSelectTextActive: { color: theme.colors.white },

  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5, borderColor: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  loadMoreText: {
    fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: theme.fontWeight.semibold,
  },

  // ── INFO BOX ──
  infoBox: {
    flexDirection: 'row', gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '08',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: theme.colors.primary + '20',
    marginTop: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1, fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary, lineHeight: 20,
  },

  // ── NAV BUTTONS ──
  navRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  btnBack: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2, borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  btnBackText: {
    fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: theme.fontWeight.semibold,
  },
  btnNext: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  btnNextFull: { flex: 1 },
  btnNextGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  btnNextText: {
    fontSize: theme.fontSize.md, color: theme.colors.white, fontWeight: theme.fontWeight.semibold,
  },
});

export default CreateInvitationWizardScreen;

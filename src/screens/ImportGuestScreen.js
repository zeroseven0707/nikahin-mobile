import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { guestService } from '../services/invitationService';
import { WEB_BASE_URL } from '../config/api';

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                           // .xls
  'text/csv',                                                           // .csv
  'text/comma-separated-values',
];

const ImportGuestScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();

  const [file, setFile]           = useState(null);   // picked file asset
  const [importing, setImporting] = useState(false);
  const [result, setResult]       = useState(null);   // import result
  const [alert, setAlert]         = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  // ── Pick file ──────────────────────────────────────────────────────────────
  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_TYPES,
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;

      const asset = res.assets?.[0];
      if (!asset) return;

      // Validate extension
      const ext = asset.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext)) {
        showAlert('Format Tidak Didukung', 'Pilih file .xlsx, .xls, atau .csv', 'warning');
        return;
      }

      setFile(asset);
      setResult(null);
    } catch (err) {
      showAlert('Error', 'Gagal memilih file', 'error');
    }
  };

  // ── Import ─────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!file) {
      showAlert('Perhatian', 'Pilih file terlebih dahulu', 'warning');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const mimeType = file.mimeType || 'application/octet-stream';
      const res = await guestService.importGuests(token, invitation.id, file.uri, file.name, mimeType);
      setResult(res);
      setFile(null);
    } catch (error) {
      const errData = error?.response?.data;
      showAlert(
        'Import Gagal',
        errData?.message || 'Terjadi kesalahan saat mengimport file.',
        'error'
      );
    } finally {
      setImporting(false);
    }
  };

  // ── Download template ──────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const url = `${WEB_BASE_URL}/api/guests/import-template`;
    Linking.openURL(url);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Import Tamu</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {invitation.bride_name} & {invitation.groom_name}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Format guide ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: theme.colors.info + '18' }]}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.info} />
            </View>
            <Text style={styles.cardTitle}>Format File</Text>
          </View>
          <Text style={styles.cardDesc}>
            File Excel (.xlsx/.xls) atau CSV dengan kolom berikut:
          </Text>

          {/* Column table */}
          <View style={styles.colTable}>
            <View style={styles.colRow}>
              <View style={styles.colHeader}><Text style={styles.colHeaderText}>Kolom</Text></View>
              <View style={styles.colHeader}><Text style={styles.colHeaderText}>Nilai</Text></View>
              <View style={styles.colHeader}><Text style={styles.colHeaderText}>Wajib</Text></View>
            </View>
            {[
              ['nama / name', 'Nama lengkap tamu', '✓'],
              ['kategori / category', 'family / friend / colleague\natau keluarga / teman / rekan', '✓'],
              ['whatsapp / telepon', 'Nomor HP', '—'],
            ].map(([col, val, req]) => (
              <View key={col} style={styles.colRow}>
                <View style={styles.colCell}><Text style={styles.colCode}>{col}</Text></View>
                <View style={styles.colCell}><Text style={styles.colVal}>{val}</Text></View>
                <View style={styles.colCell}>
                  <Text style={[styles.colReq, req === '✓' && { color: theme.colors.success }]}>{req}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Download template */}
          <TouchableOpacity style={styles.templateBtn} onPress={handleDownloadTemplate} activeOpacity={0.8}>
            <Ionicons name="download-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.templateBtnText}>Unduh Template CSV</Text>
          </TouchableOpacity>
        </View>

        {/* ── File picker ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: theme.colors.accent + '18' }]}>
              <Ionicons name="document-outline" size={20} color={theme.colors.accent} />
            </View>
            <Text style={styles.cardTitle}>Pilih File</Text>
          </View>

          <TouchableOpacity
            style={[styles.dropzone, file && styles.dropzoneActive]}
            onPress={handlePickFile}
            activeOpacity={0.8}
          >
            {file ? (
              <View style={styles.fileInfo}>
                <View style={styles.fileIconWrap}>
                  <Ionicons name="document-text" size={32} color={theme.colors.success} />
                </View>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={2}>{file.name}</Text>
                  <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
                </View>
                <TouchableOpacity onPress={() => setFile(null)} style={styles.fileRemove}>
                  <Ionicons name="close-circle" size={22} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.dropzoneEmpty}>
                <View style={styles.dropzoneIconBg}>
                  <Ionicons name="cloud-upload-outline" size={36} color={theme.colors.primary} />
                </View>
                <Text style={styles.dropzoneTitle}>Ketuk untuk memilih file</Text>
                <Text style={styles.dropzoneHint}>.xlsx · .xls · .csv · maks 5 MB</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Import button ── */}
        <TouchableOpacity
          style={[styles.importBtn, (!file || importing) && styles.importBtnDisabled]}
          onPress={handleImport}
          disabled={!file || importing}
          activeOpacity={0.85}
        >
          {importing ? (
            <View style={styles.importBtnInner}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.importBtnText}>Mengimport...</Text>
            </View>
          ) : (
            <LinearGradient
              colors={file ? theme.colors.gradient.primary : ['#9ca3af', '#9ca3af']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.importBtnInner}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.importBtnText}>Import Sekarang</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        {/* ── Result ── */}
        {result && (
          <View style={[
            styles.resultCard,
            result.success ? styles.resultCardSuccess : styles.resultCardError,
          ]}>
            <View style={styles.resultHeader}>
              <Ionicons
                name={result.success ? 'checkmark-circle' : 'warning'}
                size={24}
                color={result.success ? theme.colors.success : theme.colors.error}
              />
              <Text style={[styles.resultTitle, { color: result.success ? theme.colors.success : theme.colors.error }]}>
                {result.success ? 'Import Berhasil' : 'Import Selesai dengan Peringatan'}
              </Text>
            </View>

            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <Text style={[styles.resultStatNum, { color: theme.colors.success }]}>{result.imported}</Text>
                <Text style={styles.resultStatLabel}>Berhasil</Text>
              </View>
              <View style={styles.resultStatDivider} />
              <View style={styles.resultStat}>
                <Text style={[styles.resultStatNum, { color: theme.colors.warning }]}>{result.skipped}</Text>
                <Text style={styles.resultStatLabel}>Dilewati</Text>
              </View>
            </View>

            {result.errors?.length > 0 && (
              <View style={styles.errorList}>
                <Text style={styles.errorListTitle}>Detail error:</Text>
                {result.errors.slice(0, 5).map((err, i) => (
                  <Text key={i} style={styles.errorItem}>• {err}</Text>
                ))}
                {result.errors.length > 5 && (
                  <Text style={styles.errorMore}>...dan {result.errors.length - 5} error lainnya</Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.resultDoneBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.resultDoneBtnText}>Lihat Daftar Tamu</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: theme.spacing.xxxl }} />
      </ScrollView>

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
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  scrollContent: { padding: theme.spacing.lg, gap: theme.spacing.lg },

  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: theme.spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  cardIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  cardDesc: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, lineHeight: 20 },

  // Column table
  colTable: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  colRow: { flexDirection: 'row' },
  colHeader: {
    flex: 1, backgroundColor: theme.colors.primary + '12',
    padding: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  colHeaderText: { fontSize: 10, fontWeight: theme.fontWeight.bold, color: theme.colors.primary, textTransform: 'uppercase' },
  colCell: {
    flex: 1, padding: 8,
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
    borderRightWidth: 1, borderRightColor: theme.colors.divider,
  },
  colCode: { fontSize: 10, fontFamily: 'monospace', color: theme.colors.primary },
  colVal: { fontSize: 10, color: theme.colors.textSecondary, lineHeight: 15 },
  colReq: { fontSize: 11, fontWeight: theme.fontWeight.bold, color: theme.colors.textTertiary, textAlign: 'center' },

  // Template button
  templateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md, paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5, borderColor: theme.colors.primary + '40',
    backgroundColor: theme.colors.primary + '08',
  },
  templateBtnText: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },

  // Dropzone
  dropzone: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    minHeight: 120,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  dropzoneActive: {
    borderColor: theme.colors.success,
    borderStyle: 'solid',
    backgroundColor: theme.colors.success + '06',
  },
  dropzoneEmpty: { alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.xl },
  dropzoneIconBg: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  dropzoneTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  dropzoneHint: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary },

  // File info
  fileInfo: {
    flexDirection: 'row', alignItems: 'center',
    gap: theme.spacing.md, padding: theme.spacing.md, width: '100%',
  },
  fileIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: theme.colors.success + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  fileDetails: { flex: 1 },
  fileName: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  fileSize: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2 },
  fileRemove: { padding: 4 },

  // Import button
  importBtn: { borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
  importBtnDisabled: { opacity: 0.6 },
  importBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.md + 2, gap: theme.spacing.sm,
  },
  importBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },

  // Result card
  resultCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1.5,
  },
  resultCardSuccess: {
    backgroundColor: theme.colors.success + '08',
    borderColor: theme.colors.success + '30',
  },
  resultCardError: {
    backgroundColor: theme.colors.warning + '08',
    borderColor: theme.colors.warning + '30',
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  resultTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  resultStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  resultStat: { flex: 1, alignItems: 'center' },
  resultStatNum: { fontSize: theme.fontSize.xxxl, fontWeight: theme.fontWeight.bold },
  resultStatLabel: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2 },
  resultStatDivider: { width: 1, height: 40, backgroundColor: theme.colors.border },
  errorList: {
    backgroundColor: theme.colors.error + '08',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: 4,
  },
  errorListTitle: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, color: theme.colors.error, marginBottom: 4 },
  errorItem: { fontSize: theme.fontSize.xs, color: theme.colors.error, lineHeight: 18 },
  errorMore: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  resultDoneBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: theme.spacing.sm,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  resultDoneBtnText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.primary },
});

export default ImportGuestScreen;

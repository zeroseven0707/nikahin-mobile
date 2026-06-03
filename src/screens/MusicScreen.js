import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { musicService } from '../services/invitationService';
import CustomAlert from '../components/CustomAlert';

// ── Format file size ────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Animated pulse dot ──────────────────────────────────────────────────────
const PulseDot = ({ color }) => {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.5, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.pulseDot,
        { backgroundColor: color, transform: [{ scale: anim }] },
      ]}
    />
  );
};

// ── Pre-built music suggestions ─────────────────────────────────────────────
const MUSIC_SUGGESTIONS = [
  { icon: 'musical-notes-outline', label: 'Romantis', desc: 'Cocok untuk suasana pernikahan mewah' },
  { icon: 'leaf-outline',          label: 'Akustik',  desc: 'Melodi gitar yang hangat & intim'    },
  { icon: 'flower-outline',        label: 'Klasik',   desc: 'Orkestra elegan untuk kesan megah'   },
  { icon: 'sunny-outline',         label: 'Modern',   desc: 'Pop/R&B untuk nuansa segar & muda'   },
];

const ACCEPTED_FORMATS = ['mp3', 'm4a', 'aac', 'ogg', 'wav'];

// ── Main Screen ─────────────────────────────────────────────────────────────
const MusicScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();

  const [music, setMusic]           = useState(null);   // { music_url, music_path }
  const [hasMusic, setHasMusic]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [pickedFile, setPickedFile] = useState(null);   // selected but not yet uploaded
  const [alert, setAlert]           = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  const uploadProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadMusic(); }, []);

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  const loadMusic = async () => {
    try {
      const res = await musicService.getMusic(token, invitation.id);
      setHasMusic(res.has_music);
      setMusic(res.has_music ? { music_url: res.music_url, music_path: res.music_path } : null);
    } catch {
      showAlert('Error', 'Gagal memuat data musik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      const ext  = file.name.split('.').pop().toLowerCase();

      if (!ACCEPTED_FORMATS.includes(ext)) {
        showAlert('Format Tidak Didukung', `Gunakan format: ${ACCEPTED_FORMATS.join(', ').toUpperCase()}`, 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showAlert('File Terlalu Besar', 'Ukuran maksimal musik adalah 10 MB', 'error');
        return;
      }
      setPickedFile(file);
    } catch {
      showAlert('Error', 'Gagal memilih file', 'error');
    }
  };

  const handleUpload = async () => {
    if (!pickedFile) return;
    setUploading(true);

    // Animate fake progress
    Animated.timing(uploadProgress, {
      toValue: 0.85,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    try {
      const ext      = pickedFile.name.split('.').pop().toLowerCase();
      const mimeMap  = { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', wav: 'audio/wav' };
      const mimeType = mimeMap[ext] || 'audio/mpeg';

      await musicService.uploadMusic(token, invitation.id, pickedFile.uri, pickedFile.name, mimeType);

      // Finish progress
      Animated.timing(uploadProgress, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      setPickedFile(null);
      await loadMusic();
      showAlert('Berhasil', 'Musik undangan berhasil diupload', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal mengupload musik';
      showAlert('Upload Gagal', msg, 'error');
    } finally {
      setUploading(false);
      uploadProgress.setValue(0);
    }
  };

  const handleDelete = () => {
    showAlert(
      'Hapus Musik?',
      'Musik akan dihapus dari undangan dan tidak bisa dipulihkan.',
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await musicService.deleteMusic(token, invitation.id);
              setHasMusic(false);
              setMusic(null);
              showAlert('Berhasil', 'Musik berhasil dihapus', 'success');
            } catch {
              showAlert('Error', 'Gagal menghapus musik', 'error');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelPick = () => setPickedFile(null);

  const musicFileName = music?.music_path?.split('/').pop();

  // ── Render ─────────────────────────────────────────────────────────────────
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
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Musik Undangan</Text>
              <Text style={styles.headerSub}>
                {invitation.bride_name} & {invitation.groom_name}
              </Text>
            </View>
            <View style={styles.backBtn} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat data musik...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── STATUS CARD ── */}
          <View style={styles.section}>
            <View style={[
              styles.statusCard,
              hasMusic ? styles.statusCardActive : styles.statusCardEmpty,
            ]}>
              <View style={[
                styles.statusIconWrap,
                { backgroundColor: hasMusic ? theme.colors.primary + '18' : theme.colors.border + '80' },
              ]}>
                {hasMusic
                  ? <PulseDot color={theme.colors.primary} />
                  : null}
                <Ionicons
                  name={hasMusic ? 'musical-notes' : 'musical-notes-outline'}
                  size={28}
                  color={hasMusic ? theme.colors.primary : theme.colors.textTertiary}
                />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[
                  styles.statusTitle,
                  { color: hasMusic ? theme.colors.text : theme.colors.textSecondary },
                ]}>
                  {hasMusic ? 'Musik Terpasang' : 'Belum Ada Musik'}
                </Text>
                <Text style={styles.statusDesc}>
                  {hasMusic
                    ? musicFileName
                    : 'Upload musik agar undangan lebih berkesan saat dibuka tamu.'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── CURRENT MUSIC (if has music) ── */}
          {hasMusic && music && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Musik Saat Ini</Text>
              <View style={styles.musicCard}>
                {/* Waveform decorative */}
                <View style={styles.waveWrap}>
                  {[8, 14, 20, 16, 24, 18, 12, 22, 10, 18, 16, 20, 14, 24, 8].map((h, i) => (
                    <View
                      key={i}
                      style={[styles.waveBar, {
                        height: h,
                        backgroundColor: theme.colors.primary,
                        opacity: 0.3 + (i % 3) * 0.2,
                      }]}
                    />
                  ))}
                </View>

                <View style={styles.musicInfo}>
                  <View style={styles.musicIconWrap}>
                    <Ionicons name="musical-note" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.musicMeta}>
                    <Text style={styles.musicFileName} numberOfLines={1}>{musicFileName}</Text>
                    <Text style={styles.musicDesc}>Akan diputar otomatis saat undangan dibuka</Text>
                  </View>
                </View>

                <View style={styles.musicActions}>
                  {/* Ganti */}
                  <TouchableOpacity
                    style={styles.musicActionBtn}
                    onPress={handlePickFile}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="swap-horizontal-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.musicActionText, { color: theme.colors.primary }]}>Ganti</Text>
                  </TouchableOpacity>

                  <View style={styles.musicActionDivider} />

                  {/* Hapus */}
                  <TouchableOpacity
                    style={styles.musicActionBtn}
                    onPress={handleDelete}
                    disabled={deleting}
                    activeOpacity={0.75}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color={theme.colors.error} />
                    ) : (
                      <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                    )}
                    <Text style={[styles.musicActionText, { color: theme.colors.error }]}>
                      {deleting ? 'Menghapus...' : 'Hapus'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ── PICKED FILE (preview before upload) ── */}
          {pickedFile && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>File Dipilih</Text>
              <View style={styles.pickedCard}>
                <View style={styles.pickedIconWrap}>
                  <Ionicons name="document-attach-outline" size={24} color={theme.colors.accent} />
                </View>
                <View style={styles.pickedMeta}>
                  <Text style={styles.pickedName} numberOfLines={1}>{pickedFile.name}</Text>
                  <Text style={styles.pickedSize}>{formatBytes(pickedFile.size)}</Text>
                </View>
                <TouchableOpacity onPress={handleCancelPick} style={styles.pickedClose}>
                  <Ionicons name="close-circle" size={22} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {/* Upload progress bar */}
              {uploading && (
                <View style={styles.progressWrap}>
                  <Animated.View
                    style={[styles.progressBar, {
                      width: uploadProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }]}
                  />
                </View>
              )}

              {/* Upload button */}
              <TouchableOpacity
                style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
                onPress={handleUpload}
                disabled={uploading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={uploading ? ['#aaa', '#aaa'] : theme.colors.gradient.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.uploadBtnGrad}
                >
                  {uploading ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.uploadBtnText}>Mengupload...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                      <Text style={styles.uploadBtnText}>Upload Musik</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ── UPLOAD AREA (no file picked, no music OR has music but want to replace) ── */}
          {!pickedFile && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{hasMusic ? 'Ganti Musik' : 'Upload Musik'}</Text>
              <TouchableOpacity
                style={styles.dropZone}
                onPress={handlePickFile}
                activeOpacity={0.75}
              >
                <View style={styles.dropZoneIcon}>
                  <Ionicons name="cloud-upload-outline" size={36} color={theme.colors.primary} />
                </View>
                <Text style={styles.dropZoneTitle}>Pilih File Musik</Text>
                <Text style={styles.dropZoneDesc}>
                  Format: {ACCEPTED_FORMATS.join(', ').toUpperCase()}
                </Text>
                <Text style={styles.dropZoneDesc}>Ukuran maksimal 10 MB</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── INFO ── */}
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle-outline" size={18} color={theme.colors.info} />
                <Text style={styles.infoTitle}>Tentang Fitur Musik</Text>
              </View>
              {[
                'Musik akan diputar otomatis saat tamu membuka undangan.',
                'Tamu bisa mematikan/menyalakan musik dari undangan.',
                'Gunakan lagu instrumental yang sesuai tema pernikahan.',
                'Pastikan hak cipta lagu yang digunakan sudah sesuai.',
              ].map((tip, i) => (
                <View key={i} style={styles.infoRow}>
                  <View style={[styles.infoDot, { backgroundColor: theme.colors.info }]} />
                  <Text style={styles.infoText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── SUGGESTIONS ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rekomendasi Genre</Text>
            <View style={styles.suggestGrid}>
              {MUSIC_SUGGESTIONS.map((s) => (
                <View key={s.label} style={styles.suggestCard}>
                  <View style={styles.suggestIconWrap}>
                    <Ionicons name={s.icon} size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.suggestLabel}>{s.label}</Text>
                  <Text style={styles.suggestDesc}>{s.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

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

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: theme.colors.background },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },

  // Header
  header: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub:    { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingTop: theme.spacing.lg },
  section:       { paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg },
  sectionTitle:  {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.md,
  },

  // Status card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
  },
  statusCardActive: {
    backgroundColor: theme.colors.primary + '08',
    borderColor: theme.colors.primary + '30',
  },
  statusCardEmpty: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  statusIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative', flexShrink: 0,
  },
  pulseDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
  },
  statusInfo:  { flex: 1 },
  statusTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, marginBottom: 3 },
  statusDesc:  { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, lineHeight: 16 },

  // Music card
  musicCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  waveWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  waveBar: { width: 4, borderRadius: 2 },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  musicIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  musicMeta:     { flex: 1 },
  musicFileName: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  musicDesc:     { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2 },
  musicActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  musicActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
  },
  musicActionDivider: { width: 1, backgroundColor: theme.colors.divider, marginVertical: 8 },
  musicActionText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold },

  // Picked file card
  pickedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.accent + '40',
    marginBottom: theme.spacing.md,
  },
  pickedIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: theme.colors.accent + '15',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  pickedMeta: { flex: 1 },
  pickedName: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  pickedSize: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2 },
  pickedClose: { padding: 4 },

  // Progress
  progressWrap: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },

  // Upload button
  uploadBtn:         { borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
  uploadBtnDisabled: { opacity: 0.7 },
  uploadBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 14,
  },
  uploadBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },

  // Drop zone
  dropZone: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary + '40',
    backgroundColor: theme.colors.primary + '05',
    gap: 6,
  },
  dropZoneIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  dropZoneTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  dropZoneDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },

  // Info card
  infoCard: {
    backgroundColor: theme.colors.info + '08',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.info + '25',
    padding: theme.spacing.md,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.info,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoDot: {
    width: 5, height: 5, borderRadius: 3,
    marginTop: 6, flexShrink: 0,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },

  // Suggestions grid
  suggestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  suggestCard: {
    width: '47.5%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 4,
  },
  suggestIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  suggestLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  suggestDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },
});

export default MusicScreen;

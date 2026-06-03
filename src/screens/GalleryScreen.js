import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import CustomAlert from '../components/CustomAlert';
import { GalleryGridSkeleton } from '../components/Skeleton';
import { optimizeImage, optimizeImages, formatFileSize, needsOptimization } from '../utils/imageOptimizer';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { galleryService } from '../services/invitationService';

const { width: SCREEN_W } = Dimensions.get('window');
const COLS   = 3;
const GAP    = 3;
const CELL_W = (SCREEN_W - GAP * (COLS + 1)) / COLS;

// ── Upload progress banner ────────────────────────────────────────────────────
const UploadBanner = ({ current, total, sizeInfo }) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const barAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.uploadBanner}>
      <View style={styles.uploadBannerRow}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.uploadBannerText}>
            Mengupload foto {current}/{total}
          </Text>
          {sizeInfo ? (
            <Text style={styles.uploadBannerSub}>{sizeInfo}</Text>
          ) : null}
        </View>
        <Text style={styles.uploadBannerPct}>{pct}%</Text>
      </View>
      {/* Progress track */}
      <View style={styles.uploadTrack}>
        <Animated.View
          style={[
            styles.uploadFill,
            {
              width: barAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const GalleryScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();

  const [photos, setPhotos]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [uploadCurrent, setUploadCurrent] = useState(0);
  const [uploadTotal, setUploadTotal]   = useState(0);
  const [uploadSizeInfo, setUploadSizeInfo] = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [alert, setAlert]               = useState({
    visible: false, title: '', message: '', type: 'info', buttons: [],
  });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  // ── Load photos ──
  useFocusEffect(useCallback(() => { loadPhotos(); }, []));

  const loadPhotos = async () => {
    try {
      const res = await galleryService.getPhotos(token, invitation.id);
      setPhotos(res.photos || []);
    } catch {
      showAlert('Error', 'Gagal memuat galeri', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Pick & upload dengan optimisasi ──
  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Izin Diperlukan', 'Aplikasi membutuhkan akses ke galeri foto.', 'warning', [
        { text: 'OK', style: 'primary' },
      ]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,          // ambil original, kita optimize sendiri
      selectionLimit: 10,
      exif: false,
    });

    if (result.canceled || !result.assets?.length) return;

    await uploadAssets(result.assets);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Izin Diperlukan', 'Aplikasi membutuhkan akses kamera.', 'warning', [
        { text: 'OK', style: 'primary' },
      ]);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1, exif: false });
    if (result.canceled || !result.assets?.length) return;

    await uploadAssets(result.assets);
  };

  /**
   * Core upload pipeline:
   * 1. Optimize images that need it
   * 2. Upload one by one with progress
   */
  const uploadAssets = async (assets) => {
    setUploading(true);
    setUploadTotal(assets.length);
    setUploadCurrent(0);

    let successCount = 0;
    let failCount    = 0;
    let savedBytes   = 0;

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      setUploadCurrent(i + 1);

      try {
        let uploadUri  = asset.uri;
        let fileName   = asset.fileName || `photo_${Date.now()}.jpg`;
        let mimeType   = asset.mimeType || 'image/jpeg';

        // ── Optimization step ──
        if (needsOptimization(asset)) {
          const originalSize = asset.fileSize || 0;
          const optimized = await optimizeImage(asset.uri, {
            maxWidth:  1280,
            maxHeight: 1280,
            quality:   0.82,
          });
          uploadUri = optimized.uri;
          fileName  = optimized.fileName;
          mimeType  = optimized.mimeType;

          // Show size saving info in banner
          if (originalSize > 0) {
            // We can't easily get optimized file size without extra stat call,
            // so just show "optimized" label
            setUploadSizeInfo(`Mengoptimasi foto ${i + 1}/${assets.length}...`);
          }
        } else {
          setUploadSizeInfo(`Mengupload foto ${i + 1}/${assets.length}`);
        }

        await galleryService.uploadPhoto(token, invitation.id, uploadUri, fileName, mimeType);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setUploading(false);
    setUploadSizeInfo(null);
    setUploadCurrent(0);
    setUploadTotal(0);
    await loadPhotos();

    if (failCount === 0) {
      showAlert('Berhasil', `${successCount} foto berhasil diupload.`, 'success');
    } else {
      showAlert('Selesai', `${successCount} berhasil, ${failCount} gagal.`, 'warning');
    }
  };

  // ── Pilih sumber foto ──
  const handleAdd = () => {
    showAlert(
      'Tambah Foto',
      'Pilih sumber foto',
      'info',
      [
        { text: 'Batal',  style: 'cancel' },
        { text: 'Kamera', style: 'primary', onPress: handleTakePhoto },
        { text: 'Galeri', style: 'primary', onPress: handleAddPhoto },
      ]
    );
  };

  // ── Delete ──
  const handleDelete = (photo) => {
    showAlert(
      'Hapus Foto',
      'Foto ini akan dihapus permanen. Lanjutkan?',
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await galleryService.deletePhoto(token, invitation.id, photo.id);
              setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
            } catch {
              showAlert('Error', 'Gagal menghapus foto.', 'error');
            }
          },
        },
      ]
    );
  };

  // ── Reorder ──
  const handleMove = async (index, direction) => {
    const newPhotos  = [...photos];
    const swapIndex  = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newPhotos.length) return;

    [newPhotos[index], newPhotos[swapIndex]] = [newPhotos[swapIndex], newPhotos[index]];
    const reordered = newPhotos.map((p, i) => ({ ...p, order: i + 1 }));
    setPhotos(reordered);

    try {
      await galleryService.reorderPhotos(
        token, invitation.id,
        reordered.map((p) => ({ id: p.id, order: p.order }))
      );
    } catch {
      loadPhotos();
    }
  };

  // ── Render photo cell ──
  const renderPhoto = ({ item, index }) => (
    <View style={styles.cell}>
      <Image source={{ uri: item.photo_url }} style={styles.cellImage} resizeMode="cover" />

      {/* Order badge */}
      <View style={styles.orderBadge}>
        <Text style={styles.orderText}>{index + 1}</Text>
      </View>

      {/* Overlay actions */}
      <View style={styles.cellOverlay}>
        {index > 0 && (
          <TouchableOpacity style={styles.cellBtn} onPress={() => handleMove(index, 'up')}>
            <Ionicons name="chevron-up" size={14} color="#fff" />
          </TouchableOpacity>
        )}
        {index < photos.length - 1 && (
          <TouchableOpacity style={styles.cellBtn} onPress={() => handleMove(index, 'down')}>
            <Ionicons name="chevron-down" size={14} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.cellBtn, styles.cellBtnDelete]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Empty state ──
  const renderEmpty = () => (
    !loading && (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="images-outline" size={52} color={theme.colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Belum Ada Foto</Text>
        <Text style={styles.emptyText}>
          Tambahkan foto untuk mempercantik undangan Anda
        </Text>
        <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAdd} activeOpacity={0.85}>
          <LinearGradient
            colors={theme.colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emptyAddBtnGrad}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyAddBtnText}>Tambah Foto</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  );

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
              <Text style={styles.headerTitle}>Galeri Foto</Text>
              <Text style={styles.headerSub}>
                {photos.length} foto · {invitation.bride_name} & {invitation.groom_name}
              </Text>
            </View>
            <TouchableOpacity style={styles.headerBtn} onPress={handleAdd} disabled={uploading}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Upload progress banner */}
      {uploading && (
        <UploadBanner
          current={uploadCurrent}
          total={uploadTotal}
          sizeInfo={uploadSizeInfo}
        />
      )}

      {/* Info bar */}
      {photos.length > 0 && !loading && (
        <View style={styles.infoBar}>
          <Ionicons name="information-circle-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            Foto pertama akan menjadi cover undangan. Ketuk ▲▼ untuk mengubah urutan.
          </Text>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={{ paddingTop: 12 }}>
          <GalleryGridSkeleton cols={3} rows={3} />
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id.toString()}
          numColumns={COLS}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          columnWrapperStyle={styles.row}
        />
      )}

      {/* FAB */}
      {photos.length > 0 && !uploading && (
        <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.85}>
          <LinearGradient
            colors={theme.colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGrad}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  headerCenter:  { flex: 1, alignItems: 'center' },
  headerTitle:   { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub:     { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Upload banner
  uploadBanner: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 10,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 8,
  },
  uploadBannerText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  uploadBannerSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  uploadBannerPct: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    minWidth: 36,
    textAlign: 'right',
  },
  uploadTrack: {
    height: 3,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 0,
  },
  uploadFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },

  // Info bar
  infoBar: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    paddingHorizontal: theme.spacing.lg, paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  infoText: { flex: 1, fontSize: 11, color: theme.colors.textSecondary, lineHeight: 16 },

  // Grid
  grid: { padding: GAP, flexGrow: 1 },
  row:  { gap: GAP, marginBottom: GAP },

  // Cell
  cell: {
    width: CELL_W, height: CELL_W,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.border,
  },
  cellImage: { width: '100%', height: '100%' },

  // Order badge
  orderBadge: {
    position: 'absolute', top: 4, left: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },
  orderText: { fontSize: 9, color: '#fff', fontWeight: theme.fontWeight.bold },

  // Cell overlay
  cellOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'flex-end',
    padding: 4, gap: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cellBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  cellBtnDelete: { backgroundColor: 'rgba(239,68,68,0.75)' },

  // Empty
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md },
  emptyIconBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle:      { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  emptyText:       { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyAddBtn:     { borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginTop: theme.spacing.sm },
  emptyAddBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl, gap: theme.spacing.sm,
  },
  emptyAddBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },

  // FAB
  fab: {
    position: 'absolute', bottom: theme.spacing.xl, right: theme.spacing.lg,
    borderRadius: 32, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 10,
  },
  fabGrad: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
});

export default GalleryScreen;

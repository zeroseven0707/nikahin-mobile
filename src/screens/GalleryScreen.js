import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import CustomAlert from '../components/CustomAlert';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { galleryService } from '../services/invitationService';

const { width: SCREEN_W } = Dimensions.get('window');
const COLS    = 3;
const GAP     = 3;
const CELL_W  = (SCREEN_W - GAP * (COLS + 1)) / COLS;

// ─── Component ───────────────────────────────────────────────────────────────
const GalleryScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();

  const [photos, setPhotos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert]         = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  // ── Load photos ──
  useFocusEffect(useCallback(() => { loadPhotos(); }, []));

  const loadPhotos = async () => {
    try {
      const res = await galleryService.getPhotos(token, invitation.id);
      setPhotos(res.photos || []);
    } catch (_) {
      showAlert('Error', 'Gagal memuat galeri', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Pick & upload ──
  const handleAddPhoto = async () => {
    // Request permission
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
      quality: 0.85,
      selectionLimit: 10,
    });

    if (result.canceled || !result.assets?.length) return;

    setUploading(true);
    let successCount = 0;
    let failCount    = 0;

    for (const asset of result.assets) {
      try {
        const ext      = asset.uri.split('.').pop() || 'jpg';
        const mimeType = asset.mimeType || `image/${ext}`;
        const fileName = asset.fileName || `photo_${Date.now()}.${ext}`;

        await galleryService.uploadPhoto(token, invitation.id, asset.uri, fileName, mimeType);
        successCount++;
      } catch (_) {
        failCount++;
      }
    }

    setUploading(false);
    await loadPhotos();

    if (failCount === 0) {
      showAlert('Berhasil', `${successCount} foto berhasil diupload.`, 'success');
    } else {
      showAlert('Selesai', `${successCount} berhasil, ${failCount} gagal.`, 'warning');
    }
  };

  // ── Take photo ──
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Izin Diperlukan', 'Aplikasi membutuhkan akses kamera.', 'warning', [
        { text: 'OK', style: 'primary' },
      ]);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset    = result.assets[0];
    const ext      = asset.uri.split('.').pop() || 'jpg';
    const mimeType = asset.mimeType || `image/${ext}`;
    const fileName = `photo_${Date.now()}.${ext}`;

    setUploading(true);
    try {
      await galleryService.uploadPhoto(token, invitation.id, asset.uri, fileName, mimeType);
      await loadPhotos();
      showAlert('Berhasil', 'Foto berhasil diupload.', 'success');
    } catch (_) {
      showAlert('Error', 'Gagal mengupload foto.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // ── Show add options ──
  const handleAdd = () => {
    showAlert(
      'Tambah Foto',
      'Pilih sumber foto',
      'info',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Kamera', style: 'primary', onPress: handleTakePhoto },
        { text: 'Galeri', style: 'primary', onPress: handleAddPhoto },
      ]
    );
  };

  // ── Delete photo ──
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
              setPhotos(prev => prev.filter(p => p.id !== photo.id));
            } catch (_) {
              showAlert('Error', 'Gagal menghapus foto.', 'error');
            }
          },
        },
      ]
    );
  };

  // ── Move photo (simple up/down reorder) ──
  const handleMove = async (index, direction) => {
    const newPhotos = [...photos];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newPhotos.length) return;

    // Swap
    [newPhotos[index], newPhotos[swapIndex]] = [newPhotos[swapIndex], newPhotos[index]];

    // Reassign order values
    const reordered = newPhotos.map((p, i) => ({ ...p, order: i + 1 }));
    setPhotos(reordered);

    try {
      await galleryService.reorderPhotos(
        token,
        invitation.id,
        reordered.map(p => ({ id: p.id, order: p.order }))
      );
    } catch (_) {
      // Revert on failure
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

      {/* Action overlay */}
      <View style={styles.cellOverlay}>
        {/* Move up */}
        {index > 0 && (
          <TouchableOpacity style={styles.cellBtn} onPress={() => handleMove(index, 'up')}>
            <Ionicons name="chevron-up" size={14} color="#fff" />
          </TouchableOpacity>
        )}
        {/* Move down */}
        {index < photos.length - 1 && (
          <TouchableOpacity style={styles.cellBtn} onPress={() => handleMove(index, 'down')}>
            <Ionicons name="chevron-down" size={14} color="#fff" />
          </TouchableOpacity>
        )}
        {/* Delete */}
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

      {/* Upload progress */}
      {uploading && (
        <View style={styles.uploadBanner}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.uploadBannerText}>Mengupload foto...</Text>
        </View>
      )}

      {/* Info bar */}
      {photos.length > 0 && (
        <View style={styles.infoBar}>
          <Ionicons name="information-circle-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            Foto pertama akan menjadi cover undangan. Ketuk ▲▼ untuk mengubah urutan.
          </Text>
        </View>
      )}

      {/* Grid */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={item => item.id.toString()}
          numColumns={COLS}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          columnWrapperStyle={styles.row}
        />
      )}

      {/* FAB — only when photos exist */}
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Upload banner
  uploadBanner: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '12',
    paddingHorizontal: theme.spacing.lg, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: theme.colors.primary + '20',
  },
  uploadBannerText: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: theme.fontWeight.medium },

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
  row: { gap: GAP, marginBottom: GAP },

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

  // Cell overlay (action buttons)
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

  // Loading
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Empty
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md },
  emptyIconBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyAddBtn: { borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginTop: theme.spacing.sm },
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

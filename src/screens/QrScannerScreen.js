import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { guestService } from '../services/invitationService';

// ─── Scan mode config ────────────────────────────────────────────────────────
const ALL_MODES = {
  checkin: {
    key:          'checkin',
    label:        'Check-in',
    icon:         'enter-outline',
    iconActive:   'enter',
    color:        theme.colors.success,
    gradient:     ['#059669', '#10B981'],
    hint:         'Scan QR untuk check-in tamu',
    successTitle: 'Check-in Berhasil!',
    dupTitle:     'Sudah Check-in',
    dupIcon:      'time-outline',
    dupColor:     theme.colors.warning,
    dupPrefix:    'Sudah check-in pada',
    successPrefix:'Check-in pada',
  },
  souvenir: {
    key:          'souvenir',
    label:        'Souvenir',
    icon:         'gift-outline',
    iconActive:   'gift',
    color:        '#A855F7',
    gradient:     ['#7C3AED', '#A855F7'],
    hint:         'Scan QR untuk pengambilan souvenir',
    successTitle: 'Souvenir Tercatat!',
    dupTitle:     'Sudah Ambil Souvenir',
    dupIcon:      'time-outline',
    dupColor:     theme.colors.warning,
    dupPrefix:    'Sudah ambil souvenir pada',
    successPrefix:'Souvenir diambil pada',
  },
  checkout: {
    key:          'checkout',
    label:        'Check-out',
    icon:         'exit-outline',
    iconActive:   'exit',
    color:        theme.colors.warning,
    gradient:     ['#D97706', '#F59E0B'],
    hint:         'Scan QR untuk check-out tamu',
    successTitle: 'Check-out Berhasil!',
    dupTitle:     'Sudah Check-out',
    dupIcon:      'time-outline',
    dupColor:     theme.colors.textSecondary,
    dupPrefix:    'Sudah check-out pada',
    successPrefix:'Check-out pada',
  },
};

const CATEGORY_LABELS = { family: 'Keluarga', friend: 'Teman', colleague: 'Rekan' };

// ─── Component ───────────────────────────────────────────────────────────────
const QrScannerScreen = ({ route, navigation }) => {
  const { invitation, activeModes, multiSouvenir } = route.params;
  const { token } = useAuth();

  // Build MODES object from activeModes param (or default to checkin+souvenir)
  const enabledKeys = activeModes && activeModes.length > 0
    ? activeModes.filter(k => ALL_MODES[k])
    : ['checkin', 'souvenir'];
  const MODES = Object.fromEntries(enabledKeys.map(k => [k, ALL_MODES[k]]));

  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode]           = useState(enabledKeys[0]);
  const [scanned, setScanned]     = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult]       = useState(null);
  const [torch, setTorch]         = useState(false);

  // Animated scan line
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  // Mode switch animation
  const modeSwitchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const currentMode = MODES[mode];

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setScanned(false);
    setResult(null);
    Animated.spring(modeSwitchAnim, {
      toValue: newMode === 'souvenir' ? 1 : 0,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);
    Vibration.vibrate(80);

    try {
      let response;
      if (mode === 'checkin') {
        response = await guestService.checkIn(token, invitation.id, data);
        setResult({ success: true, guest: response.guest, timestamp: response.checked_in_at });
      } else if (mode === 'souvenir') {
        response = await guestService.souvenirScan(token, invitation.id, data);
        setResult({ success: true, guest: response.guest, timestamp: response.souvenir_taken_at });
      } else if (mode === 'checkout') {
        response = await guestService.checkOut(token, invitation.id, data);
        setResult({ success: true, guest: response.guest, timestamp: response.checked_out_at });
      }
    } catch (error) {
      const errData = error?.response?.data;
      const isDup   = errData?.already_checked_in || errData?.already_taken || errData?.already_checked_out;
      if (isDup) {
        // Souvenir mode + multiSouvenir enabled → coba souvenir ke-2
        if (mode === 'souvenir' && multiSouvenir && errData?.already_taken) {
          try {
            const res2 = await guestService.souvenirScan2(token, invitation.id, data);
            setResult({
              success: true,
              isSecondSouvenir: true,
              guest: res2.guest,
              timestamp: res2.souvenir2_taken_at,
            });
          } catch (err2) {
            const e2 = err2?.response?.data;
            if (e2?.already_taken) {
              setResult({ success: false, duplicate: true, guest: e2.guest, timestamp: e2.souvenir2_taken_at, dupLabel: 'Souvenir ke-2 sudah diambil' });
            } else {
              setResult({ success: false, message: e2?.message || 'Gagal mencatat souvenir ke-2.' });
            }
          }
        } else {
          const ts = errData.checked_in_at || errData.souvenir_taken_at || errData.checked_out_at;
          setResult({ success: false, duplicate: true, guest: errData.guest, timestamp: ts });
        }
      } else {
        setResult({ success: false, message: errData?.message || 'QR code tidak valid.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleScanAgain = () => { setScanned(false); setResult(null); };

  // ── Permission not determined ──
  if (!permission) return <View style={styles.container} />;

  // ── Permission denied ──
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={theme.colors.gradient.primary} style={styles.permHeader}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Scan QR</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.permBody}>
          <View style={styles.permIconBg}>
            <Ionicons name="camera-outline" size={56} color={theme.colors.primary} />
          </View>
          <Text style={styles.permTitle}>Izin Kamera Diperlukan</Text>
          <Text style={styles.permText}>Aplikasi membutuhkan akses kamera untuk memindai QR code tamu.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <LinearGradient colors={theme.colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.permBtnGrad}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.permBtnText}>Izinkan Kamera</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main scanner ──
  return (
    <View style={styles.container}>
      {/* Camera */}
      {!scanned && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}

      {/* Dark overlay with viewfinder */}
      {!scanned && (
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.viewfinder}>
              {/* Corner brackets — color matches mode */}
              {['TL','TR','BL','BR'].map(pos => (
                <View key={pos} style={[styles.corner, styles[`corner${pos}`], { borderColor: currentMode.color }]} />
              ))}
              {/* Scan line */}
              <Animated.View style={[styles.scanLine, { backgroundColor: currentMode.color, transform: [{ translateY: scanLineTranslate }] }]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.scanHint}>{currentMode.hint}</Text>
          </View>
        </View>
      )}

      {/* ── Header ── */}
      <SafeAreaView edges={['top']} style={styles.headerOverlay}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Scan QR</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {invitation.bride_name} & {invitation.groom_name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.headerBtn, torch && styles.headerBtnActive]}
            onPress={() => setTorch(t => !t)}
          >
            <Ionicons name={torch ? 'flashlight' : 'flashlight-outline'} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Mode Selector ── */}
        <View style={styles.modeBar}>
          {Object.values(MODES).map(m => {
            const active = mode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeBtn, active && { backgroundColor: m.color + '30', borderColor: m.color }]}
                onPress={() => switchMode(m.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={active ? m.iconActive : m.icon} size={18} color={active ? m.color : 'rgba(255,255,255,0.55)'} />
                <Text style={[styles.modeBtnText, active && { color: m.color, fontWeight: theme.fontWeight.bold }]}>
                  {m.label}
                </Text>
                {active && <View style={[styles.modeActiveDot, { backgroundColor: m.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      {/* ── Result popup ── */}
      {scanned && result && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            {/* Icon circle */}
            <View style={[
              styles.resultIconBg,
              {
                backgroundColor: result.success
                  ? currentMode.color + '20'
                  : result.duplicate
                    ? theme.colors.warning + '20'
                    : theme.colors.error + '20',
              },
            ]}>
              <Ionicons
                name={
                  result.success
                    ? (mode === 'checkin' ? 'checkmark-circle' : 'gift')
                    : result.duplicate
                      ? currentMode.dupIcon
                      : 'close-circle'
                }
                size={64}
                color={
                  result.success
                    ? currentMode.color
                    : result.duplicate
                      ? theme.colors.warning
                      : theme.colors.error
                }
              />
            </View>

            {/* Status title */}
            <Text style={[
              styles.resultTitle,
              {
                color: result.success
                  ? currentMode.color
                  : result.duplicate
                    ? theme.colors.warning
                    : theme.colors.error,
              },
            ]}>
              {result.success
                ? (result.isSecondSouvenir ? 'Souvenir Ke-2 Tercatat!' : currentMode.successTitle)
                : result.duplicate
                  ? (result.dupLabel || currentMode.dupTitle)
                  : 'QR Tidak Valid'}
            </Text>

            {/* Guest info card */}
            {result.guest && (
              <View style={styles.guestInfoCard}>
                <View style={styles.guestInfoRow}>
                  <View style={[styles.guestAvatar, { backgroundColor: currentMode.color + '25' }]}>
                    <Text style={[styles.guestAvatarText, { color: currentMode.color }]}>
                      {result.guest.name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.guestInfoText}>
                    <Text style={styles.guestName}>{result.guest.name}</Text>
                    <Text style={styles.guestCategory}>
                      {CATEGORY_LABELS[result.guest.category] || result.guest.category}
                    </Text>
                  </View>
                </View>
                {result.timestamp && (
                  <View style={styles.timestampRow}>
                    <Ionicons name="time-outline" size={13} color={theme.colors.textSecondary} />
                    <Text style={styles.timestampText}>
                      {result.success ? currentMode.successPrefix : currentMode.dupPrefix}
                      {' '}
                      {new Date(result.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                )}
                {/* Souvenir status badge when in check-in mode */}
                {mode === 'checkin' && result.success && result.guest.souvenir_taken_at && (
                  <View style={styles.souvenirBadge}>
                    <Ionicons name="gift" size={12} color="#A855F7" />
                    <Text style={styles.souvenirBadgeText}>Souvenir sudah diambil</Text>
                  </View>
                )}
              </View>
            )}

            {/* Invalid QR message */}
            {!result.guest && (
              <Text style={styles.invalidMsg}>{result.message}</Text>
            )}

            {/* Action buttons */}
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.scanAgainBtn} onPress={handleScanAgain} activeOpacity={0.85}>
                <LinearGradient
                  colors={currentMode.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scanAgainGrad}
                >
                  <Ionicons name="qr-code-outline" size={20} color="#fff" />
                  <Text style={styles.scanAgainText}>Scan Lagi</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.doneBtnText}>Selesai</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Processing spinner */}
      {processing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <Ionicons name="hourglass-outline" size={32} color={currentMode.color} />
            <Text style={styles.processingText}>Memverifikasi...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Constants ───────────────────────────────────────────────────────────────
const VF = 260;
const CS = 28;
const CT = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // Header
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  headerBtnActive: { backgroundColor: theme.colors.primary + 'AA', borderColor: theme.colors.primary },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Mode selector
  modeBar: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: 'transparent',
    position: 'relative',
  },
  modeBtnText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium, color: 'rgba(255,255,255,0.55)' },
  modeActiveDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },

  // Overlay
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 5 },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  overlayMiddle: { flexDirection: 'row', height: VF },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  viewfinder: { width: VF, height: VF, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', paddingTop: theme.spacing.xl },
  scanHint: { color: 'rgba(255,255,255,0.8)', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium, textAlign: 'center', paddingHorizontal: theme.spacing.xl },

  // Corners
  corner: { position: 'absolute', width: CS, height: CS },
  cornerTL: { top: 0, left: 0, borderTopWidth: CT, borderLeftWidth: CT, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CT, borderRightWidth: CT, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CT, borderLeftWidth: CT, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CT, borderRightWidth: CT, borderBottomRightRadius: 4 },

  // Scan line
  scanLine: {
    position: 'absolute', left: 8, right: 8, height: 2, borderRadius: 1, opacity: 0.9,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },

  // Result overlay
  resultOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center', alignItems: 'center', zIndex: 20, padding: theme.spacing.xl,
  },
  resultCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl, alignItems: 'center', width: '100%', maxWidth: 380,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 18,
  },
  resultIconBg: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  resultTitle: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, marginBottom: theme.spacing.md, textAlign: 'center' },

  // Guest info inside result
  guestInfoCard: {
    width: '100%', backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg, padding: theme.spacing.md,
    marginBottom: theme.spacing.lg, gap: theme.spacing.sm,
  },
  guestInfoRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  guestAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  guestAvatarText: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  guestInfoText: { flex: 1 },
  guestName: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  guestCategory: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
  timestampRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timestampText: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontStyle: 'italic' },
  souvenirBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#A855F715', borderRadius: theme.borderRadius.full,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  souvenirBadgeText: { fontSize: 11, color: '#A855F7', fontWeight: theme.fontWeight.semibold },

  invalidMsg: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg, lineHeight: 22 },

  // Action buttons
  resultActions: { width: '100%', gap: theme.spacing.sm },
  scanAgainBtn: { borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
  scanAgainGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.md, gap: theme.spacing.sm },
  scanAgainText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },
  doneBtn: { paddingVertical: theme.spacing.md, alignItems: 'center', borderRadius: theme.borderRadius.lg, borderWidth: 1.5, borderColor: theme.colors.border },
  doneBtnText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium },

  // Processing
  processingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 25 },
  processingCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  processingText: { fontSize: theme.fontSize.md, color: theme.colors.text, fontWeight: theme.fontWeight.medium },

  // Permission
  permHeader: { paddingBottom: theme.spacing.md },
  permBody: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl },
  permIconBg: { width: 110, height: 110, borderRadius: 55, backgroundColor: theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.xl },
  permTitle: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.sm, textAlign: 'center' },
  permText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: theme.spacing.xl },
  permBtn: { borderRadius: theme.borderRadius.lg, overflow: 'hidden', width: '100%' },
  permBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.md, gap: theme.spacing.sm },
  permBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },
});

export default QrScannerScreen;

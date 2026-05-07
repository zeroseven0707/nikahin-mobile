import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from '../components/CustomAlert';
import WebViewModal from '../components/WebViewModal';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { paymentService, invitationService } from '../services/invitationService';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// ─── Component ───────────────────────────────────────────────────────────────
const PaymentScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();

  const [loading, setLoading]       = useState(false);
  const [checking, setChecking]     = useState(true);
  const [isPaid, setIsPaid]         = useState(false);
  const [amount, setAmount]         = useState(50000);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentType, setPaymentType]     = useState(null);
  const [snapUrl, setSnapUrl]       = useState(null);   // WebView URL
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [alert, setAlert]           = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  // ── Check payment status on mount ──
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await paymentService.getStatus(token, invitation.id);
      
      // Check if paid from multiple sources
      const paidStatuses = ['paid', 'success', 'completed'];
      const isPaidFromStatus = res.payment_status && paidStatuses.includes(res.payment_status.toLowerCase());
      const isPaidFromFlag = res.is_paid === true;
      
      setIsPaid(isPaidFromFlag || isPaidFromStatus);
      setAmount(res.amount || 50000);
      setPaymentStatus(res.payment_status);
      setPaymentType(res.payment_type);
    } catch (_) {}
    finally { setChecking(false); }
  };

  // ── Start payment ──
  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await paymentService.createTransaction(token, invitation.id);

      if (res.already_paid) {
        setIsPaid(true);
        return;
      }

      if (!res.snap_token) {
        showAlert('Error', 'Gagal mendapatkan token pembayaran.', 'error');
        return;
      }

      // Build Midtrans Snap URL and open as in-app WebView modal
      const isProduction = res.is_production;
      const snapBaseUrl  = isProduction
        ? 'https://app.midtrans.com/snap/v2/vtweb/'
        : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/';

      setSnapUrl(`${snapBaseUrl}${res.snap_token}`);
      setWebViewVisible(true);
    } catch (error) {
      const errData = error?.response?.data;
      showAlert('Error', errData?.message || 'Gagal memproses pembayaran.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle WebView navigation — detect Midtrans finish/cancel URLs ──
  const handleWebViewNav = async (navState) => {
    const url = navState.url || '';

    // Midtrans redirects to finish/unfinish/error after payment
    const isFinish   = url.includes('/finish') || url.includes('transaction_status=settlement') || url.includes('transaction_status=capture');
    const isUnfinish = url.includes('/unfinish') || url.includes('transaction_status=pending');
    const isError    = url.includes('/error') || url.includes('transaction_status=deny') || url.includes('transaction_status=cancel') || url.includes('transaction_status=expire');

    if (isFinish || isUnfinish || isError) {
      setWebViewVisible(false);
      setSnapUrl(null);

      // Check actual payment status from backend
      setChecking(true);
      try {
        const statusRes = await paymentService.getStatus(token, invitation.id);
        
        // Check if paid from multiple sources
        const paidStatuses = ['paid', 'success', 'completed'];
        const isPaidFromStatus = statusRes.payment_status && paidStatuses.includes(statusRes.payment_status.toLowerCase());
        const isPaidFromFlag = statusRes.is_paid === true;
        
        if (isPaidFromFlag || isPaidFromStatus) {
          setIsPaid(true);
          setPaymentStatus(statusRes.payment_status);
          setPaymentType(statusRes.payment_type);
          showAlert(
            'Pembayaran Berhasil!',
            'Undangan Anda telah dibayar dan siap dipublikasikan.',
            'success',
            [{ text: 'Sip!', style: 'primary' }]
          );
        } else if (isUnfinish) {
          showAlert('Pembayaran Tertunda', 'Pembayaran Anda sedang diproses. Silakan cek kembali nanti.', 'warning');
        } else if (isError) {
          showAlert('Pembayaran Dibatalkan', 'Pembayaran tidak berhasil. Silakan coba lagi.', 'error');
        }
      } catch (error) {
        showAlert('Info', 'Pembayaran selesai. Silakan cek status di halaman utama.', 'info');
      } finally {
        setChecking(false);
      }
    }
  };

  // ── After paid: View invitation ──
  const handleViewInvitation = () => {
    navigation.goBack();
  };

  // ── Close WebView modal ──
  const handleCloseWebView = () => {
    showAlert(
      'Batalkan Pembayaran?',
      'Proses pembayaran akan dihentikan.',
      'confirm',
      [
        { text: 'Lanjutkan Bayar', style: 'cancel' },
        {
          text: 'Batalkan',
          style: 'destructive',
          onPress: () => {
            setWebViewVisible(false);
            setSnapUrl(null);
          },
        },
      ]
    );
  };

  // ── Loading state ──
  if (checking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
              <Text style={styles.headerTitle}>Pembayaran</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {invitation.bride_name} & {invitation.groom_name}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        {isPaid ? (
          /* ── Already paid ── */
          <View style={styles.paidState}>
            <View style={styles.paidIconBg}>
              <Ionicons name="checkmark-circle" size={72} color={theme.colors.success} />
            </View>
            <Text style={styles.paidTitle}>Pembayaran Berhasil!</Text>
            <Text style={styles.paidDesc}>
              Terima kasih! Pembayaran Anda telah berhasil diproses. Undangan digital Anda sudah aktif dan siap dibagikan kepada tamu.
            </Text>
            
            {/* Payment info card */}
            <View style={styles.paymentInfoCard}>
              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentInfoLabel}>Status Pembayaran</Text>
                <View style={styles.paymentStatusBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                  <Text style={styles.paymentStatusText}>Lunas</Text>
                </View>
              </View>
              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentInfoLabel}>Jumlah Dibayar</Text>
                <Text style={styles.paymentInfoValue}>{formatRupiah(amount)}</Text>
              </View>
              {paymentType && (
                <View style={styles.paymentInfoRow}>
                  <Text style={styles.paymentInfoLabel}>Metode Pembayaran</Text>
                  <Text style={styles.paymentInfoValue}>
                    {paymentType.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentInfoLabel}>Undangan</Text>
                <Text style={styles.paymentInfoValue} numberOfLines={1}>
                  {invitation.bride_name} & {invitation.groom_name}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.paidBtn} onPress={handleViewInvitation} activeOpacity={0.85}>
              <LinearGradient
                colors={theme.colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.paidBtnGrad}
              >
                <Ionicons name="eye-outline" size={20} color="#fff" />
                <Text style={styles.paidBtnText}>Lihat Undangan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Payment form ── */
          <>
            {/* Product card */}
            <View style={styles.productCard}>
              <View style={styles.productIconBg}>
                <Ionicons name="heart" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.productName}>Undangan Digital Premium</Text>
              <Text style={styles.productDesc}>
                Publikasikan undangan {invitation.bride_name} & {invitation.groom_name} dan bagikan ke semua tamu Anda.
              </Text>

              <View style={styles.divider} />

              {/* Price breakdown */}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Undangan Digital</Text>
                <Text style={styles.priceValue}>{formatRupiah(amount)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Biaya Layanan</Text>
                <Text style={styles.priceValue}>Gratis</Text>
              </View>
              <View style={[styles.priceRow, styles.priceTotalRow]}>
                <Text style={styles.priceTotalLabel}>Total</Text>
                <Text style={styles.priceTotalValue}>{formatRupiah(amount)}</Text>
              </View>
            </View>

            {/* Features list */}
            <View style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>Yang Anda dapatkan:</Text>
              {[
                'Undangan digital selamanya',
                'Semua fitur manajemen tamu',
                'QR check-in & souvenir tracking',
                'Analitik & statistik lengkap',
                'Layar sapa di gerbang acara',
              ].map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Payment methods note */}
            <View style={styles.methodsNote}>
              <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.methodsText}>
                Pembayaran aman via Midtrans · Transfer Bank, GoPay, OVO, QRIS, Kartu Kredit
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Bottom CTA */}
      {!isPaid && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomTotal}>
            <Text style={styles.bottomTotalLabel}>Total Pembayaran</Text>
            <Text style={styles.bottomTotalValue}>{formatRupiah(amount)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.payBtn, loading && styles.payBtnDisabled]}
            onPress={handlePay}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.payBtnInner}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.payBtnText}>Memproses...</Text>
              </View>
            ) : (
              <LinearGradient
                colors={theme.colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.payBtnInner}
              >
                <Ionicons name="card-outline" size={20} color="#fff" />
                <Text style={styles.payBtnText}>Bayar Sekarang</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ── Midtrans Snap WebView Modal ── */}
      <WebViewModal
        visible={webViewVisible}
        url={snapUrl}
        title="Pembayaran Aman"
        secure={true}
        onClose={handleCloseWebView}
        onNavigationStateChange={handleWebViewNav}
      />

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
  centered: { justifyContent: 'center', alignItems: 'center' },

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

  content: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md },

  // Product card
  productCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    gap: theme.spacing.sm,
  },
  productIconBg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  productName: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text, textAlign: 'center' },
  productDesc: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  divider: { width: '100%', height: 1, backgroundColor: theme.colors.divider, marginVertical: theme.spacing.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 3 },
  priceLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  priceValue: { fontSize: theme.fontSize.sm, color: theme.colors.text, fontWeight: theme.fontWeight.medium },
  priceTotalRow: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, marginTop: theme.spacing.xs },
  priceTotalLabel: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  priceTotalValue: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },

  // Features
  featuresCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  featuresTitle: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },

  // Methods note
  methodsNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  methodsText: { flex: 1, fontSize: 11, color: theme.colors.textSecondary, lineHeight: 16 },

  // Bottom bar
  bottomBar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  bottomTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottomTotalLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  bottomTotalValue: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
  payBtn: { borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
  payBtnDisabled: { opacity: 0.6 },
  payBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.md + 2, gap: theme.spacing.sm,
  },
  payBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold },

  // Paid state
  paidState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  paidIconBg: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: theme.colors.success + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  paidTitle: { fontSize: theme.fontSize.xxxl, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  paidDesc: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: theme.spacing.xl },
  paidBtn: { borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginTop: theme.spacing.md, width: '100%' },
  paidBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: theme.spacing.md + 2, gap: theme.spacing.sm,
  },
  paidBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },

  // Payment info card
  paymentInfoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '100%',
    gap: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginTop: theme.spacing.sm,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  paymentInfoValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.success + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
  },
  paymentStatusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default PaymentScreen;

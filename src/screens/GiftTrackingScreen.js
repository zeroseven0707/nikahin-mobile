import React, { useState, useCallback } from 'react';

import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, Switch, TextInput, Modal,
  RefreshControl, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { invitationService } from '../services/invitationService';
import CustomAlert from '../components/CustomAlert';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n ?? 0);

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PAYMENT_STATUS = {
  paid:      { label: 'Lunas',      color: theme.colors.success },
  pending:   { label: 'Pending',    color: theme.colors.warning },
  cancelled: { label: 'Dibatalkan', color: theme.colors.error   },
  expired:   { label: 'Kadaluarsa', color: theme.colors.textTertiary },
};

const OWNER_LABELS = { bride: 'Pengantin Wanita', groom: 'Pengantin Pria', other: 'Bersama' };
const BANK_COLORS  = {
  bride: ['#be185d', '#ec4899'],
  groom: ['#1d4ed8', '#3b82f6'],
  other: ['#374151', '#6b7280'],
};

// ─── Bank Card ────────────────────────────────────────────────────────────────
const BankCard = ({ account, onDelete }) => {
  const colors = BANK_COLORS[account.owner] ?? BANK_COLORS.other;
  const masked = (account.account_number ?? '').replace(/(\d{4})(?=\d)/g, '$1 ');
  return (
    <View style={styles.bankCardWrap}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bankCard}>
        <View style={styles.bankChip} />
        <Text style={styles.bankNumber}>{masked}</Text>
        <View style={styles.bankBottom}>
          <View>
            <Text style={styles.bankHolder}>{account.account_holder}</Text>
            <Text style={styles.bankName}>{account.bank_name?.toUpperCase()}</Text>
          </View>
          <View style={styles.bankOwnerBadge}>
            <Text style={styles.bankOwnerText}>{OWNER_LABELS[account.owner] ?? 'Bersama'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bankDeleteBtn} onPress={() => onDelete(account)} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={14} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ item }) => {
  const st = PAYMENT_STATUS[item.status] ?? PAYMENT_STATUS.pending;
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderTop}>
        <View style={styles.orderProductIcon}>
          <Ionicons name="gift-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderProductName} numberOfLines={1}>{item.product_name}</Text>
          <Text style={styles.orderCode}>{item.order_code}</Text>
        </View>
        <View style={[styles.orderBadge, { backgroundColor: st.color + '18', borderColor: st.color + '40' }]}>
          <Text style={[styles.orderBadgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <View style={styles.orderDivider} />
      <View style={styles.orderBuyerRow}>
        <View style={styles.orderAvatar}>
          <Text style={styles.orderAvatarText}>{(item.buyer_name ?? 'T').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderBuyerName}>{item.buyer_name}</Text>
          {item.buyer_message ? (
            <Text style={styles.orderBuyerMsg} numberOfLines={2}>"{item.buyer_message}"</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>{formatRupiah(item.amount)}</Text>
        {item.paid_at && (
          <View style={styles.orderDateRow}>
            <Ionicons name="calendar-outline" size={11} color={theme.colors.textTertiary} />
            <Text style={styles.orderDate}>{formatDate(item.paid_at)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const GiftTrackingScreen = ({ route, navigation }) => {
  const { invitation } = route.params;
  const { token } = useAuth();

  // ── State ──
  const [activeTab,    setActiveTab]    = useState('orders');   // 'orders' | 'banks'
  const [giftEnabled,  setGiftEnabled]  = useState(false);
  const [toggling,     setToggling]     = useState(false);
  const [orders,       setOrders]       = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidCount,    setPaidCount]    = useState(0);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [filter,       setFilter]       = useState('all');
  const [refreshing,   setRefreshing]   = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [showAddBank,  setShowAddBank]  = useState(false);
  const [bankForm,     setBankForm]     = useState({ bank_name: '', account_number: '', account_holder: '', owner: 'groom' });
  const [savingBank,   setSavingBank]   = useState(false);
  const [alert,        setAlert]        = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  const showAlert = (title, message, type = 'info', buttons = []) =>
    setAlert({ visible: true, title, message, type, buttons });

  useFocusEffect(useCallback(() => { loadAll(); }, [token, invitation.id]));

  const loadAll = async () => {
    setLoading(true);
    try {
      const [giftsRes, banksRes] = await Promise.all([
        invitationService.getGifts(token, invitation.id),
        invitationService.getBankAccounts(token, invitation.id),
      ]);
      setOrders(giftsRes.orders ?? []);
      setTotalRevenue(giftsRes.total_revenue ?? 0);
      setPaidCount(giftsRes.paid_count ?? 0);
      setBankAccounts(banksRes.bank_accounts ?? []);
      setGiftEnabled(banksRes.gift_enabled ?? false);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const onRefresh = async () => { setRefreshing(true); await loadAll(); setRefreshing(false); };

  const handleToggleGift = async (val) => {
    setToggling(true);
    try {
      const res = await invitationService.toggleGift(token, invitation.id, val);
      setGiftEnabled(res.gift_enabled);
    } catch (_) {
      showAlert('Error', 'Gagal mengubah pengaturan hadiah', 'error');
    } finally { setToggling(false); }
  };

  const handleDeleteBank = (account) => {
    showAlert(
      'Hapus Rekening',
      `Hapus rekening ${account.bank_name} - ${account.account_holder}?`,
      'confirm',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus', style: 'destructive',
          onPress: async () => {
            try {
              await invitationService.deleteBankAccount(token, invitation.id, account.id);
              setBankAccounts(prev => prev.filter(b => b.id !== account.id));
            } catch (_) {
              showAlert('Error', 'Gagal menghapus rekening', 'error');
            }
          },
        },
      ]
    );
  };

  const handleAddBank = async () => {
    if (!bankForm.bank_name.trim() || !bankForm.account_number.trim() || !bankForm.account_holder.trim()) {
      showAlert('Perhatian', 'Semua field harus diisi', 'warning');
      return;
    }
    setSavingBank(true);
    try {
      const res = await invitationService.addBankAccount(token, invitation.id, bankForm);
      setBankAccounts(prev => [...prev, res.bank_account]);
      setShowAddBank(false);
      setBankForm({ bank_name: '', account_number: '', account_holder: '', owner: 'groom' });
    } catch (_) {
      showAlert('Error', 'Gagal menambahkan rekening', 'error');
    } finally { setSavingBank(false); }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all')     return true;
    if (filter === 'paid')    return o.status === 'paid';
    if (filter === 'pending') return o.status === 'pending';
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  // ── Header ──
  const renderHeader = () => (
    <LinearGradient colors={['#4C1D95', '#6B4CE6', '#8B6FF0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
      <SafeAreaView edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Hadiah & Rekening</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{invitation.bride_name} & {invitation.groom_name}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        {/* Hero strip */}
        <View style={styles.heroStrip}>
          <View style={styles.heroItem}>
            <Text style={styles.heroNum}>{formatRupiah(totalRevenue)}</Text>
            <Text style={styles.heroLabel}>Total Hadiah</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroItem}>
            <Text style={styles.heroNum}>{paidCount}</Text>
            <Text style={styles.heroLabel}>Lunas</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroItem}>
            <Text style={styles.heroNum}>{pendingCount}</Text>
            <Text style={styles.heroLabel}>Pending</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
      >
        {/* ── Toggle ── */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIconBg, { backgroundColor: giftEnabled ? theme.colors.primary + '18' : theme.colors.border }]}>
              <Ionicons name="gift-outline" size={20} color={giftEnabled ? theme.colors.primary : theme.colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.toggleTitle}>Aktifkan Fitur Hadiah</Text>
              <Text style={styles.toggleDesc}>Tampilkan section hadiah di undangan</Text>
            </View>
          </View>
          <Switch
            value={giftEnabled}
            onValueChange={handleToggleGift}
            disabled={toggling}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '60' }}
            thumbColor={giftEnabled ? theme.colors.primary : theme.colors.textTertiary}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        {/* ── Tab bar ── */}
        <View style={styles.tabBar}>
          {[
            { key: 'orders', label: 'Produk', icon: 'gift-outline' },
            { key: 'banks',  label: 'Rekening', icon: 'card-outline' },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(t.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={t.icon} size={16} color={activeTab === t.key ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.tabBtnText, activeTab === t.key && styles.tabBtnTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab: Orders ── */}
        {activeTab === 'orders' && (
          <View>
            {/* Filter chips */}
            <View style={styles.filterRow}>
              {[
                { key: 'all',     label: 'Semua'   },
                { key: 'paid',    label: 'Lunas'   },
                { key: 'pending', label: 'Pending' },
              ].map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                  onPress={() => setFilter(f.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredOrders.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="gift-outline" size={36} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Belum ada hadiah</Text>
                <Text style={styles.emptyText}>Hadiah dari tamu akan muncul di sini setelah mereka melakukan pembelian.</Text>
              </View>
            ) : (
              filteredOrders.map(item => <OrderCard key={item.id} item={item} />)
            )}
          </View>
        )}

        {/* ── Tab: Banks ── */}
        {activeTab === 'banks' && (
          <View>
            {bankAccounts.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="card-outline" size={36} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Belum ada rekening</Text>
                <Text style={styles.emptyText}>Tambahkan rekening bank untuk menerima transfer hadiah dari tamu.</Text>
              </View>
            ) : (
              bankAccounts.map(acc => (
                <BankCard key={acc.id} account={acc} onDelete={handleDeleteBank} />
              ))
            )}

            <TouchableOpacity style={styles.addBankBtn} onPress={() => setShowAddBank(true)} activeOpacity={0.85}>
              <LinearGradient colors={theme.colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBankGrad}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.addBankText}>Tambah Rekening</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Add Bank Modal ── */}
      <Modal visible={showAddBank} animationType="slide" transparent onRequestClose={() => setShowAddBank(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowAddBank(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Rekening Bank</Text>
              <TouchableOpacity onPress={() => setShowAddBank(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {[
                { key: 'bank_name',      label: 'Nama Bank *',       placeholder: 'BCA, BRI, Mandiri, dll', keyboard: 'default' },
                { key: 'account_number', label: 'Nomor Rekening *',   placeholder: '1234567890',             keyboard: 'numeric' },
                { key: 'account_holder', label: 'Atas Nama *',        placeholder: 'Nama pemilik rekening',  keyboard: 'default' },
              ].map(f => (
                <View key={f.key} style={styles.formGroup}>
                  <Text style={styles.formLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder={f.placeholder}
                    placeholderTextColor={theme.colors.textTertiary}
                    value={bankForm[f.key]}
                    onChangeText={v => setBankForm(prev => ({ ...prev, [f.key]: v }))}
                    keyboardType={f.keyboard}
                  />
                </View>
              ))}

              {/* Owner selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Milik *</Text>
                <View style={styles.ownerRow}>
                  {[
                    { key: 'groom', label: 'Pengantin Pria',   color: '#1d4ed8' },
                    { key: 'bride', label: 'Pengantin Wanita', color: '#be185d' },
                    { key: 'other', label: 'Bersama',          color: '#374151' },
                  ].map(o => (
                    <TouchableOpacity
                      key={o.key}
                      style={[styles.ownerBtn, bankForm.owner === o.key && { borderColor: o.color, backgroundColor: o.color + '12' }]}
                      onPress={() => setBankForm(prev => ({ ...prev, owner: o.key }))}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.ownerBtnText, bankForm.owner === o.key && { color: o.color, fontWeight: theme.fontWeight.bold }]}>{o.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, savingBank && { opacity: 0.6 }]}
                onPress={handleAddBank}
                disabled={savingBank}
                activeOpacity={0.85}
              >
                <LinearGradient colors={theme.colors.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtnGrad}>
                  {savingBank
                    ? <Text style={styles.saveBtnText}>Menyimpan...</Text>
                    : <><Ionicons name="checkmark-circle-outline" size={18} color="#fff" /><Text style={styles.saveBtnText}>Simpan Rekening</Text></>
                  }
                </LinearGradient>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: { paddingBottom: theme.spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm, gap: theme.spacing.md },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: '#fff' },
  headerSub: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Hero strip
  heroStrip: { flexDirection: 'row', marginHorizontal: theme.spacing.lg, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: theme.borderRadius.xl, paddingVertical: theme.spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  heroItem: { flex: 1, alignItems: 'center' },
  heroNum: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.extrabold, color: '#fff' },
  heroLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: theme.fontWeight.medium },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  scrollContent: { padding: theme.spacing.lg, gap: theme.spacing.md },

  // Toggle card
  toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 },
  toggleIconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  toggleTitle: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  toggleDesc: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2 },

  // Tab bar
  tabBar: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 4, borderWidth: 1, borderColor: theme.colors.border, gap: 4 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: 'transparent' },
  tabBtnActive: { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary + '30' },
  tabBtnText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium, color: theme.colors.textSecondary },
  tabBtnTextActive: { color: theme.colors.primary, fontWeight: theme.fontWeight.bold },

  // Filter chips
  filterRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  filterChip: { paddingHorizontal: theme.spacing.md, paddingVertical: 6, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterChipText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },
  filterChipTextActive: { color: '#fff', fontWeight: theme.fontWeight.semibold },

  // Order card
  orderCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm },
  orderProductIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primary + '12', justifyContent: 'center', alignItems: 'center' },
  orderInfo: { flex: 1 },
  orderProductName: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  orderCode: { fontSize: theme.fontSize.xs, color: theme.colors.textTertiary, marginTop: 2 },
  orderBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.borderRadius.full, borderWidth: 1 },
  orderBadgeText: { fontSize: 11, fontWeight: theme.fontWeight.semibold },
  orderDivider: { height: 1, backgroundColor: theme.colors.divider, marginVertical: theme.spacing.sm },
  orderBuyerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  orderAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary + '25' },
  orderAvatarText: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
  orderBuyerName: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, color: theme.colors.text },
  orderBuyerMsg: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  orderFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderAmount: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.extrabold, color: theme.colors.text },
  orderDateRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  orderDate: { fontSize: 10, color: theme.colors.textTertiary },

  // Bank card
  bankCardWrap: { marginBottom: theme.spacing.sm },
  bankCard: { borderRadius: 16, padding: theme.spacing.lg, minHeight: 130, justifyContent: 'space-between', position: 'relative' },
  bankChip: { width: 32, height: 24, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: theme.spacing.md },
  bankNumber: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: '#fff', letterSpacing: 2, fontFamily: 'monospace', marginBottom: theme.spacing.sm },
  bankBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  bankHolder: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  bankName: { fontSize: theme.fontSize.xs, color: 'rgba(255,255,255,0.75)', fontWeight: theme.fontWeight.bold, marginTop: 2 },
  bankOwnerBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  bankOwnerText: { fontSize: 10, color: '#fff', fontWeight: theme.fontWeight.semibold },
  bankDeleteBtn: { position: 'absolute', top: theme.spacing.md, right: theme.spacing.md, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 6 },

  // Add bank button
  addBankBtn: { borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginTop: theme.spacing.sm },
  addBankGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.md },
  addBankText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: theme.spacing.xxl },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.primary + '20' },
  emptyTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.sm },
  emptyText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: theme.colors.surface, borderRadius: 24, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, maxHeight: '85%' },
  modalHandle: { width: 36, height: 4, backgroundColor: theme.colors.border, borderRadius: 2, margin: 12, alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
  modalTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text },
  modalBody: { padding: theme.spacing.lg },

  // Form
  formGroup: { marginBottom: theme.spacing.md },
  formLabel: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  formInput: { borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: 10, fontSize: theme.fontSize.md, color: theme.colors.text, backgroundColor: theme.colors.background },
  ownerRow: { flexDirection: 'row', gap: theme.spacing.sm },
  ownerBtn: { flex: 1, paddingVertical: 8, borderRadius: theme.borderRadius.lg, borderWidth: 1.5, borderColor: theme.colors.border, alignItems: 'center' },
  ownerBtnText: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium, textAlign: 'center' },
  saveBtn: { borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginTop: theme.spacing.sm },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.md },
  saveBtnText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },
});

export default GiftTrackingScreen;

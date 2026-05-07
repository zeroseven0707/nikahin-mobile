import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../components/Card';
import { theme } from '../config/theme';

const ALL_FAQS = [
  {
    id: 1,
    category: 'Undangan',
    question: 'Bagaimana cara membuat undangan baru?',
    answer: 'Klik tombol "+" di halaman Dashboard, lalu isi semua informasi yang diperlukan seperti nama pengantin, tanggal, dan lokasi acara. Setelah selesai, klik "Buat Undangan".',
  },
  {
    id: 2,
    category: 'Tamu',
    question: 'Bagaimana cara menambahkan tamu undangan?',
    answer: 'Buka detail undangan, pilih menu "Daftar Tamu", lalu klik tombol "Tambah Tamu". Isi nama dan informasi tamu, kemudian simpan.',
  },
  {
    id: 3,
    category: 'Berbagi',
    question: 'Bagaimana cara membagikan undangan?',
    answer: 'Ada dua cara: 1) Bagikan link umum untuk semua tamu, atau 2) Bagikan link personal untuk setiap tamu. Pilih menu "Bagikan Undangan" di detail undangan.',
  },
  {
    id: 4,
    category: 'Undangan',
    question: 'Apa perbedaan status Draft dan Published?',
    answer: 'Draft: Undangan masih dalam tahap pembuatan dan belum bisa diakses tamu. Published: Undangan sudah dipublikasikan dan bisa diakses oleh tamu melalui link yang dibagikan.',
  },
  {
    id: 5,
    category: 'Statistik',
    question: 'Bagaimana cara melihat siapa saja yang sudah membuka undangan?',
    answer: 'Buka detail undangan, lalu pilih menu "Statistik". Di sana Anda bisa melihat jumlah views, device yang digunakan, dan waktu terakhir undangan dibuka.',
  },
  {
    id: 6,
    category: 'RSVP',
    question: 'Bagaimana cara melihat RSVP dari tamu?',
    answer: 'Pilih menu "RSVP & Ucapan" di detail undangan. Anda akan melihat daftar tamu yang sudah konfirmasi kehadiran beserta ucapan mereka.',
  },
  {
    id: 7,
    category: 'Undangan',
    question: 'Apakah bisa mengedit undangan setelah dipublikasikan?',
    answer: 'Ya, Anda bisa mengedit undangan kapan saja. Perubahan akan langsung terlihat oleh tamu yang membuka undangan.',
  },
  {
    id: 8,
    category: 'Tamu',
    question: 'Berapa maksimal jumlah tamu yang bisa ditambahkan?',
    answer: 'Tidak ada batasan jumlah tamu. Anda bisa menambahkan sebanyak yang Anda butuhkan.',
  },
  {
    id: 9,
    category: 'Teknis',
    question: 'Apakah undangan bisa diakses tanpa internet?',
    answer: 'Aplikasi memerlukan koneksi internet untuk membuat dan mengelola undangan. Namun, tamu yang sudah membuka undangan bisa melihatnya secara offline.',
  },
  {
    id: 10,
    category: 'Undangan',
    question: 'Bagaimana cara menghapus undangan?',
    answer: 'Buka detail undangan, klik ikon menu, lalu pilih "Hapus Undangan". Konfirmasi penghapusan. Perhatian: Data yang sudah dihapus tidak bisa dikembalikan.',
  },
  {
    id: 11,
    category: 'Keamanan',
    question: 'Apakah data saya aman?',
    answer: 'Ya, semua data Anda dienkripsi dan disimpan dengan aman. Kami tidak membagikan data Anda kepada pihak ketiga. Baca Kebijakan Privasi kami untuk informasi lebih lanjut.',
  },
  {
    id: 12,
    category: 'Bantuan',
    question: 'Bagaimana cara menghubungi customer support?',
    answer: 'Anda bisa menghubungi kami melalui email di support@nikahin.app atau melalui tombol "Hubungi Support" di bawah halaman ini.',
  },
];

const CATEGORIES = ['Semua', 'Undangan', 'Tamu', 'Berbagi', 'RSVP', 'Statistik', 'Teknis', 'Keamanan', 'Bantuan'];

const FaqItem = ({ faq, isExpanded, onToggle }) => (
  <View style={faqStyles.item}>
    <TouchableOpacity
      style={faqStyles.header}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={faqStyles.questionRow}>
        <View style={[faqStyles.numberBadge, isExpanded && faqStyles.numberBadgeActive]}>
          <Text style={[faqStyles.numberText, isExpanded && faqStyles.numberTextActive]}>
            {faq.id}
          </Text>
        </View>
        <Text style={[faqStyles.question, isExpanded && faqStyles.questionActive]}>
          {faq.question}
        </Text>
      </View>
      <View style={[faqStyles.chevronBg, isExpanded && faqStyles.chevronBgActive]}>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={isExpanded ? theme.colors.white : theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>

    {isExpanded && (
      <View style={faqStyles.answer}>
        <View style={faqStyles.answerAccent} />
        <Text style={faqStyles.answerText}>{faq.answer}</Text>
      </View>
    )}
  </View>
);

const faqStyles = StyleSheet.create({
  item: {
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  questionRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm },
  numberBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0, marginTop: 1,
  },
  numberBadgeActive: { backgroundColor: theme.colors.primary },
  numberText: { fontSize: 10, fontWeight: theme.fontWeight.bold, color: theme.colors.primary },
  numberTextActive: { color: theme.colors.white },
  question: { flex: 1, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, color: theme.colors.text, lineHeight: 22 },
  questionActive: { color: theme.colors.primary },
  chevronBg: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.colors.background,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  chevronBgActive: { backgroundColor: theme.colors.primary },
  answer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.md,
  },
  answerAccent: { width: 3, borderRadius: 2, backgroundColor: theme.colors.primary + '60', flexShrink: 0 },
  answerText: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, lineHeight: 22 },
});

const HelpScreen = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filtered = ALL_FAQS.filter((faq) => {
    const matchCat = activeCategory === 'Semua' || faq.category === activeCategory;
    const matchSearch = !searchQuery.trim() ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

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
              <Text style={styles.headerTitle}>Bantuan & FAQ</Text>
              <Text style={styles.headerSubtitle}>{ALL_FAQS.length} pertanyaan tersedia</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Search bar in header */}
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari pertanyaan..."
                placeholderTextColor={theme.colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Category filter */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryChipText, activeCategory === cat && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAQ List */}
        <View style={styles.section}>
          {filtered.length > 0 ? (
            <>
              <Text style={styles.resultCount}>{filtered.length} pertanyaan ditemukan</Text>
              {filtered.map((faq) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  isExpanded={expandedId === faq.id}
                  onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="search-outline" size={40} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Tidak Ditemukan</Text>
              <Text style={styles.emptyText}>Coba kata kunci atau kategori lain</Text>
            </View>
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Card style={styles.supportCard}>
            <LinearGradient
              colors={[theme.colors.primary + '10', theme.colors.primary + '03']}
              style={styles.supportCardInner}
            >
              <View style={styles.supportIconBg}>
                <Ionicons name="headset-outline" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.supportTitle}>Masih Butuh Bantuan?</Text>
              <Text style={styles.supportText}>Tim support kami siap membantu Anda</Text>
              <TouchableOpacity
                style={styles.supportEmailBtn}
                onPress={() => Linking.openURL('mailto:support@nikahin.app')}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.supportEmail}>support@nikahin.app</Text>
              </TouchableOpacity>
              <Text style={styles.supportResponse}>Respons dalam 1×24 jam</Text>
            </LinearGradient>
          </Card>
        </View>

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header: { paddingBottom: theme.spacing.md },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
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

  searchWrapper: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },

  // Category
  categoryWrapper: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryList: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, gap: theme.spacing.sm },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  categoryChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryChipText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },
  categoryChipTextActive: { color: theme.colors.white, fontWeight: theme.fontWeight.semibold },

  content: { flex: 1 },
  section: { paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.lg },
  resultCount: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: theme.spacing.xxl },
  emptyIconBg: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },

  // Support card
  supportCard: { padding: 0, overflow: 'hidden' },
  supportCardInner: { padding: theme.spacing.xl, alignItems: 'center', borderRadius: theme.borderRadius.xl },
  supportIconBg: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  supportTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  supportText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  supportEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '12',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  supportEmail: { fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },
  supportResponse: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, fontStyle: 'italic' },
});

export default HelpScreen;

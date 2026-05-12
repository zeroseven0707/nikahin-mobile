import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WebViewModal from '../components/WebViewModal';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import api, { WEB_BASE_URL } from '../config/api';

const TemplateScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Use ref to always have latest search value in async callbacks
  const searchRef = useRef('');
  const searchTimerRef = useRef(null);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    loadTemplates(1, '');
  }, []);

  const loadTemplates = async (page, search) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
        isLoadingMoreRef.current = true;
      }

      const response = await api.get('/templates', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: 12, search },
      });

      const data = response.data.templates || [];
      const pagination = response.data.pagination || {};

      if (page === 1) {
        setTemplates(data);
      } else {
        setTemplates(prev => [...prev, ...data]);
      }

      setCurrentPage(pagination.current_page || 1);
      setLastPage(pagination.last_page || 1);
      setTotal(pagination.total || 0);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      isLoadingMoreRef.current = false;
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    searchRef.current = text; // keep ref in sync immediately

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      loadTemplates(1, text); // use text directly, not state
    }, 500);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTemplates(1, searchRef.current);
  };

  const handleLoadMore = () => {
    if (!isLoadingMoreRef.current && currentPage < lastPage) {
      loadTemplates(currentPage + 1, searchRef.current);
    }
  };

  const handlePreview = (template) => {
    setPreviewUrl(`${WEB_BASE_URL}/templates/${template.id}/preview`);
    setPreviewVisible(true);
  };

  const handleUse = (template) => {
    navigation.navigate('CreateInvitation', { selectedTemplateId: template.id });
  };

  const renderTemplate = ({ item }) => (
    <View style={styles.card}>
      {/* Thumbnail */}
      <TouchableOpacity
        style={styles.thumbWrap}
        onPress={() => handlePreview(item)}
        activeOpacity={0.9}
      >
        {item.thumbnail_path ? (
          <Image
            source={{ uri: `${WEB_BASE_URL}/storage/${item.thumbnail_path}` }}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Ionicons name="images-outline" size={32} color={theme.colors.primary} />
          </View>
        )}

        {/* Preview overlay */}
        <View style={styles.thumbOverlay}>
          <View style={styles.previewPill}>
            <Ionicons name="eye-outline" size={12} color={theme.colors.white} />
            <Text style={styles.previewPillText}>Preview</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={styles.cardBtns}>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => handlePreview(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={15} color={theme.colors.primary} />
            <Text style={styles.previewBtnText}>Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.useBtn}
            onPress={() => handleUse(item)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={theme.colors.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.useBtnGradient}
            >
              <Text style={styles.useBtnText}>Gunakan</Text>
              <Ionicons name="arrow-forward" size={13} color={theme.colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (templates.length === 0) return null;
    return (
      <View style={styles.footer}>
        {loadingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.footerText}>Memuat lebih banyak...</Text>
          </View>
        ) : currentPage < lastPage ? (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore} activeOpacity={0.8}>
            <Ionicons name="chevron-down-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.loadMoreText}>Muat Lebih Banyak</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.footerEnd}>
            <View style={styles.footerEndLine} />
            <Text style={styles.footerEndText}>Semua {total} template ditampilkan</Text>
            <View style={styles.footerEndLine} />
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="images-outline" size={44} color={theme.colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'Template tidak ditemukan' : 'Belum ada template'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery ? 'Coba kata kunci lain' : 'Template akan muncul di sini'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header selalu di luar FlatList agar TextInput tidak unmount */}
      <LinearGradient
        colors={['#2D1B69', '#4C1D95', '#6B4CE6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          {/* Top row */}
          <View style={styles.headerInner}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerEyebrow}>PILIH DESAIN</Text>
              <Text style={styles.headerTitle}>Template</Text>
              <Text style={styles.headerTagline}>Undangan Digital Premium</Text>
            </View>
            {total > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeNum}>{total}</Text>
                <Text style={styles.headerBadgeLabel}>Template</Text>
              </View>
            )}
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={17} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari template..."
                placeholderTextColor={theme.colors.textTertiary}
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={17} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Loading state awal */}
      {loading && templates.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Memuat template...</Text>
        </View>
      ) : (
        <FlatList
          data={templates}
          renderItem={renderTemplate}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        />
      )}
      
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

  // ── HEADER ──
  header: {},
  headerInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerLeft: { flex: 1 },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.white,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  headerTagline: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 3,
    fontWeight: theme.fontWeight.medium,
    letterSpacing: 0.3,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 64,
  },
  headerBadgeNum: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.white,
    lineHeight: 28,
  },
  headerBadgeLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  searchWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },

  // ── LIST ──
  list: {
    paddingBottom: theme.spacing.xxl,
  },

  // ── CARD ── horizontal layout
  card: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbWrap: {
    width: 110,
    height: 150,
    position: 'relative',
    flexShrink: 0,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbOverlay: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  previewPillText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },

  cardBody: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    flex: 1,
    marginBottom: theme.spacing.md,
  },
  cardBtns: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  previewBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  useBtn: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  useBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
  },
  useBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },

  // ── LOADING ──
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  loadMoreText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  footerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  footerEndLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  footerEndText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  // ── EMPTY ──
  empty: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default TemplateScreen;

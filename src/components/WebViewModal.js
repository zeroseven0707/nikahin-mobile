import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

const WebViewModal = ({
  visible,
  url,
  title = 'Pratinjau',
  onClose,
  secure = false,
  onNavigationStateChange,
}) => {
  const [progress, setProgress] = useState(0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Modal header */}
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              {secure && (
                <Ionicons name="lock-closed" size={14} color={theme.colors.success} />
              )}
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* WebView */}
        {url && (
          <View style={{ flex: 1 }}>
            {progress < 1 && (
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            )}
            <WebView
              source={{ uri: url }}
              style={styles.webView}
              onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
              onNavigationStateChange={onNavigationStateChange}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Memuat halaman...</Text>
                </View>
              )}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.divider,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  closeBtn: { padding: 4 },
  webView: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  progressBar: {
    height: 3,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
});

export default WebViewModal;

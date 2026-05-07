import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Button from '../components/Button';
import Card from '../components/Card';
import { theme } from '../config/theme';
import { useInvitation } from '../context/InvitationContext';
import { invitationService } from '../services/invitationService';

const RsvpScreen = ({ navigation }) => {
  const { invitation } = useInvitation();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rsvps, setRsvps] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (invitation) {
      loadRsvps();
    }
  }, [invitation]);

  const loadRsvps = async () => {
    try {
      const data = await invitationService.getLatestRsvps(invitation.unique_url);
      setRsvps(data.rsvps || []);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRsvps();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) {
      Alert.alert('Error', 'Silakan isi nama dan ucapan Anda');
      return;
    }

    setLoading(true);
    try {
      const response = await invitationService.submitRsvp(invitation.unique_url, {
        name: name.trim(),
        message: message.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Terima Kasih!',
        'Ucapan Anda telah berhasil dikirim',
        [
          {
            text: 'OK',
            onPress: () => {
              setName('');
              setMessage('');
              loadRsvps();
            },
          },
        ]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Gagal mengirim ucapan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Button
            title=""
            onPress={() => navigation.goBack()}
            variant="text"
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Button>
          <Text style={styles.headerTitle}>Ucapan & Doa</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Form Section */}
          <View style={styles.section}>
            <Card>
              <Text style={styles.formTitle}>Kirim Ucapan & Doa</Text>
              <Text style={styles.formSubtitle}>
                Berikan ucapan dan doa terbaik untuk mempelai
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nama</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama Anda"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  maxLength={255}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ucapan & Doa</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tulis ucapan dan doa Anda..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{message.length}/500</Text>
              </View>

              <Button
                title="Kirim Ucapan"
                onPress={handleSubmit}
                loading={loading}
                size="large"
              />
            </Card>
          </View>

          {/* RSVPs List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Ucapan dari Tamu ({rsvps.length})
            </Text>

            {rsvps.length === 0 ? (
              <Card>
                <View style={styles.emptyState}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={64}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.emptyText}>
                    Belum ada ucapan. Jadilah yang pertama!
                  </Text>
                </View>
              </Card>
            ) : (
              rsvps.map((rsvp) => (
                <Card key={rsvp.id} style={styles.rsvpCard}>
                  <View style={styles.rsvpHeader}>
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.rsvpInfo}>
                      <Text style={styles.rsvpName}>{rsvp.name}</Text>
                      <Text style={styles.rsvpTime}>{rsvp.created_at}</Text>
                    </View>
                  </View>
                  <Text style={styles.rsvpMessage}>{rsvp.message}</Text>
                </Card>
              ))
            )}
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  formTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  formSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: theme.spacing.md,
  },
  charCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  rsvpCard: {
    marginBottom: theme.spacing.md,
  },
  rsvpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  rsvpInfo: {
    flex: 1,
  },
  rsvpName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  rsvpTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  rsvpMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default RsvpScreen;

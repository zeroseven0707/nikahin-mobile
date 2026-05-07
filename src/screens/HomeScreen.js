import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { theme } from '../config/theme';
import { invitationService } from '../services/invitationService';
import { useInvitation } from '../context/InvitationContext';

const HomeScreen = ({ navigation }) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { setInvitation } = useInvitation();

  const handleOpenInvitation = async () => {
    if (!invitationCode.trim()) {
      Alert.alert('Error', 'Silakan masukkan kode undangan');
      return;
    }

    setLoading(true);
    try {
      const data = await invitationService.getInvitation(invitationCode.trim());
      setInvitation(data);
      navigation.navigate('InvitationDetail');
    } catch (error) {
      Alert.alert(
        'Error',
        'Undangan tidak ditemukan. Pastikan kode undangan benar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.gradient.start, theme.colors.gradient.end]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="mail-open" size={80} color={theme.colors.white} />
              <Text style={styles.title}>Digital Invitation</Text>
              <Text style={styles.subtitle}>
                Masukkan kode undangan untuk melihat detail acara
              </Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="ticket-outline"
                  size={24}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan kode undangan"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={invitationCode}
                  onChangeText={setInvitationCode}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Button
                title="Buka Undangan"
                onPress={handleOpenInvitation}
                loading={loading}
                size="large"
                style={styles.button}
              />
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle" size={20} color={theme.colors.white} />
                <Text style={styles.infoText}>
                  Kode undangan dapat ditemukan di link yang dikirimkan kepada Anda
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: theme.spacing.lg,
  },
  inputSection: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.white,
  },
  infoSection: {
    marginTop: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  infoText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    lineHeight: 20,
  },
});

export default HomeScreen;

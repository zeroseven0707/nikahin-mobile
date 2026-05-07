import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { theme } from '../config/theme';
import { useInvitation } from '../context/InvitationContext';

const LocationScreen = ({ navigation }) => {
  const { invitation } = useInvitation();

  if (!invitation) {
    return null;
  }

  const latitude = parseFloat(invitation.latitude);
  const longitude = parseFloat(invitation.longitude);

  const openInMaps = () => {
    if (invitation.google_maps_url) {
      Linking.openURL(invitation.google_maps_url);
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const openInWaze = () => {
    const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lokasi Acara</Text>
        <View style={styles.backButton} />
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={invitation.reception_location}
          description={invitation.full_address}
        />
      </MapView>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={24} color={theme.colors.primary} />
          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>
              {invitation.reception_location}
            </Text>
            <Text style={styles.locationAddress}>
              {invitation.full_address}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Buka di Google Maps"
            onPress={openInMaps}
            size="large"
            style={styles.button}
          />
          <Button
            title="Buka di Waze"
            onPress={openInWaze}
            variant="outline"
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
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
  map: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  locationInfo: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  locationText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  locationTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  locationAddress: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
});

export default LocationScreen;

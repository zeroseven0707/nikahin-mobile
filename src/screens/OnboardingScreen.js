// onboarding

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../config/theme';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    icon: 'mail',
    iconBg: ['#6B4CE6', '#8B6FF0'],
    title: 'Undangan Digital\nyang Elegan',
    desc: 'Buat undangan pernikahan digital yang indah dengan berbagai pilihan template premium.',
    accent: '#6B4CE6',
  },
  {
    key: '2',
    icon: 'people',
    iconBg: ['#10B981', '#34D399'],
    title: 'Kelola Tamu\ndengan Mudah',
    desc: 'Tambahkan tamu, generate QR code, dan pantau check-in secara real-time di hari H.',
    accent: '#10B981',
  },
  {
    key: '3',
    icon: 'qr-code',
    iconBg: ['#7C3AED', '#A855F7'],
    title: 'Scan QR &\nTracking Hadir',
    desc: 'Sistem check-in modern dengan QR code. Pantau kehadiran tamu secara langsung.',
    accent: '#7C3AED',
  },
  {
    key: '4',
    icon: 'gift',
    iconBg: ['#EC4899', '#F472B6'],
    title: 'Terima Hadiah\nDari Tamu',
    desc: 'Tamu bisa mengirim hadiah produk atau transfer rekening langsung dari undangan.',
    accent: '#EC4899',
  },
  {
    key: '5',
    icon: 'stats-chart',
    iconBg: ['#F59E0B', '#FCD34D'],
    title: 'Analitik\nLengkap',
    desc: 'Lihat statistik views, RSVP, dan aktivitas tamu dalam satu dashboard yang informatif.',
    accent: '#F59E0B',
  },
];

const OnboardingScreen = ({ onDone }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleDone();
    }
  };

  const handleSkip = () => handleDone();

  const handleDone = async () => {
    await AsyncStorage.setItem('onboarding_done', '1');
    onDone?.();
  };

  const isLast = currentIndex === SLIDES.length - 1;

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width: W }]}>
      <LinearGradient
        colors={item.iconBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconCircle}
      >
        <Ionicons name={item.icon} size={64} color="#fff" />
      </LinearGradient>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDesc}>{item.desc}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Skip */}
        {!isLast && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / W);
          setCurrentIndex(idx);
        }}
        style={styles.flatList}
      />

      {/* Bottom */}
      <SafeAreaView edges={['bottom']} style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * W, i * W, (i + 1) * W];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity, backgroundColor: SLIDES[currentIndex].accent },
                ]}
              />
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: SLIDES[currentIndex].accent }]}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? 'Mulai Sekarang' : 'Lanjut'}
          </Text>
          <Ionicons
            name={isLast ? 'checkmark-circle-outline' : 'arrow-forward'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        {isLast && (
          <TouchableOpacity onPress={handleDone} activeOpacity={0.7} style={styles.loginHint}>
            <Text style={styles.loginHintText}>
              Sudah punya akun?{' '}
              <Text style={[styles.loginHintLink, { color: SLIDES[currentIndex].accent }]}>
                Masuk
              </Text>
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { paddingHorizontal: theme.spacing.lg, alignItems: 'flex-end' },
  skipBtn: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
  skipText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium },

  flatList: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl + theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  slideTitle: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: theme.spacing.lg,
  },
  slideDesc: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },

  bottom: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    width: '100%',
    paddingVertical: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextBtnText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  loginHint: { paddingVertical: theme.spacing.xs },
  loginHintText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  loginHintLink: { fontWeight: theme.fontWeight.semibold },
});

export default OnboardingScreen;

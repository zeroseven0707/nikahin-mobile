import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

const SplashScreen = () => {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(16)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Text entrance after logo
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Loading dots pulse loop
    const pulseDot = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();

    pulseDot(dotOpacity1, 0);
    pulseDot(dotOpacity2, 200);
    pulseDot(dotOpacity3, 400);
  }, []);

  return (
    <LinearGradient
      colors={theme.colors.gradient.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoRing}>
          <View style={styles.logoInner}>
            <Ionicons name="mail-open" size={44} color={theme.colors.white} />
          </View>
        </View>
      </Animated.View>

      {/* App name + tagline */}
      <Animated.View style={[styles.textWrap, { opacity: textOpacity, transform: [{ translateY: textTranslate }] }]}>
        <Text style={styles.appName}>Nikahin</Text>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Ionicons name="heart" size={12} color="rgba(255,255,255,0.5)" />
          <View style={styles.dividerLine} />
        </View>
        <Text style={styles.tagline}>Undangan Digital Pernikahan</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        {[dotOpacity1, dotOpacity2, dotOpacity3].map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logo
  logoWrap: {
    marginBottom: theme.spacing.xl,
  },
  logoRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text
  textWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: theme.colors.white,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    width: 140,
    marginBottom: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
    fontWeight: '400',
  },

  // Loading dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    bottom: 80,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
  },

  // Version
  version: {
    position: 'absolute',
    bottom: 48,
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;

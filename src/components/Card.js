import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

const Card = ({ children, style, variant = 'elevated', padding = 'default' }) => {
  return (
    <View style={[
      styles.card,
      styles[`card_${variant}`],
      styles[`padding_${padding}`],
      style,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  card_elevated: {
    ...theme.shadows.md,
  },
  card_outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  card_flat: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: theme.spacing.sm,
  },
  padding_default: {
    padding: theme.spacing.lg,
  },
  padding_large: {
    padding: theme.spacing.xl,
  },
});

export default Card;

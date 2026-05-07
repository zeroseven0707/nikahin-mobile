import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonContent = () => (
    <View style={styles.contentContainer}>
      {icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white}
          style={styles.iconLeft}
        />
      )}
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white} 
        />
      ) : (
        <Text style={[
          styles.text,
          styles[`text_${variant}`],
          styles[`text_${size}`],
          disabled && styles.textDisabled,
          textStyle,
        ]}>
          {title}
        </Text>
      )}
      {icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white}
          style={styles.iconRight}
        />
      )}
    </View>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        <LinearGradient
          colors={theme.colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            styles[`button_${size}`],
            disabled && styles.buttonDisabled,
          ]}
        >
          {getButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <View style={[
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        disabled && styles.buttonDisabled,
      ]}>
        {getButtonContent()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  button: {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  button_primary: {
    backgroundColor: theme.colors.primary,
  },
  button_secondary: {
    backgroundColor: theme.colors.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  button_medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  button_large: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: theme.fontWeight.semibold,
  },
  text_primary: {
    color: theme.colors.white,
  },
  text_secondary: {
    color: theme.colors.text,
  },
  text_outline: {
    color: theme.colors.primary,
  },
  text_ghost: {
    color: theme.colors.primary,
  },
  text_small: {
    fontSize: theme.fontSize.sm,
  },
  text_medium: {
    fontSize: theme.fontSize.md,
  },
  text_large: {
    fontSize: theme.fontSize.lg,
  },
  textDisabled: {
    opacity: 0.7,
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
});

export default Button;

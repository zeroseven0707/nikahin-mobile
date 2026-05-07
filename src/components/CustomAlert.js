import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

const CustomAlert = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  buttons = [],
  icon,
}) => {
  const getIconConfig = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: theme.colors.success };
      case 'error':
        return { name: 'close-circle', color: theme.colors.error };
      case 'warning':
        return { name: 'warning', color: theme.colors.warning };
      case 'confirm':
        return { name: 'help-circle', color: theme.colors.primary };
      default:
        return { name: 'information-circle', color: theme.colors.info };
    }
  };

  const iconConfig = getIconConfig();

  const defaultButtons = buttons.length > 0 ? buttons : [
    { text: 'OK', onPress: onClose, style: 'primary' }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.alertContainer}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: iconConfig.color + '15' }]}>
            <Ionicons name={iconConfig.name} size={56} color={iconConfig.color} />
          </View>

          {/* Title */}
          {title && <Text style={styles.title}>{title}</Text>}

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {defaultButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.buttonCancel,
                  button.style === 'destructive' && styles.buttonDestructive,
                  defaultButtons.length === 1 && styles.buttonFull,
                ]}
                onPress={() => {
                  button.onPress && button.onPress();
                  onClose();
                }}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'cancel' && styles.buttonTextCancel,
                  button.style === 'destructive' && styles.buttonTextDestructive,
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  buttonCancel: {
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonDestructive: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
  buttonTextCancel: {
    color: theme.colors.text,
  },
  buttonTextDestructive: {
    color: theme.colors.white,
  },
});

export default CustomAlert;

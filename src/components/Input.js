import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  helperText,
  secureTextEntry,
  keyboardType,
  multiline,
  numberOfLines,
  editable = true,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {/* Static label above input — no animation, no re-layout */}
      {label && (
        <Text style={[styles.label, isFocused && styles.labelFocused, error && styles.labelError]}>
          {label}
        </Text>
      )}

      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        !editable && styles.inputContainerDisabled,
      ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          {...props}
        />

        {rightIcon && (
          onRightIconPress ? (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ) : (
            <Ionicons
              name={rightIcon}
              size={20}
              color={error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.textSecondary}
              style={styles.rightIcon}
            />
          )
        )}
      </View>

      {(error || helperText) && (
        <View style={styles.helperContainer}>
          {error && (
            <Ionicons name="alert-circle" size={14} color={theme.colors.error} style={styles.helperIcon} />
          )}
          <Text style={[styles.helperText, error && styles.errorText]}>
            {error || helperText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginLeft: 2,
  },
  labelFocused: {
    color: theme.colors.primary,
  },
  labelError: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    minHeight: 52,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  inputContainerDisabled: {
    backgroundColor: theme.colors.surfaceVariant,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.xs,
  },
  inputMultiline: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
  },
  rightIconButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  helperIcon: {
    marginRight: 4,
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
  },
});

export default Input;

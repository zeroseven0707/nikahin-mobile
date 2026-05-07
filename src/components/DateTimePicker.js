import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 50;

const DateTimePickerComponent = ({
  label,
  value,
  onChange,
  mode = 'date', // 'date' or 'time'
  leftIcon,
  error,
  style,
}) => {
  const [show, setShow] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);

  const yearScrollRef = useRef(null);
  const monthScrollRef = useRef(null);
  const dayScrollRef = useRef(null);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // Initialize values when modal opens
  useEffect(() => {
    if (show) {
      if (mode === 'date') {
        if (value) {
          const [year, month, day] = value.split('-');
          setSelectedYear(parseInt(year));
          setSelectedMonth(parseInt(month));
          setSelectedDay(parseInt(day));
        } else {
          const today = new Date();
          setSelectedYear(today.getFullYear());
          setSelectedMonth(today.getMonth() + 1);
          setSelectedDay(today.getDate());
        }
      } else {
        if (value) {
          const [hour, minute] = value.split(':');
          setSelectedHour(parseInt(hour));
          setSelectedMinute(parseInt(minute));
        } else {
          setSelectedHour(8);
          setSelectedMinute(0);
        }
      }
    }
  }, [show, value, mode]);

  const formatDisplay = () => {
    if (!value) {
      return mode === 'date' ? 'Pilih tanggal' : 'Pilih waktu';
    }
    
    if (mode === 'date') {
      try {
        const date = new Date(value + 'T00:00:00');
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch {
        return value;
      }
    } else {
      return value; // Already in HH:MM format
    }
  };

  const handlePress = () => {
    setShow(true);
  };

  const handleSave = () => {
    if (mode === 'date') {
      const year = selectedYear;
      const month = String(selectedMonth).padStart(2, '0');
      const day = String(selectedDay).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      const hour = String(selectedHour).padStart(2, '0');
      const minute = String(selectedMinute).padStart(2, '0');
      onChange(`${hour}:${minute}`);
    }
    setShow(false);
  };

  // Generate options
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const generateMonths = () => {
    return [
      { value: 1, label: 'Januari' },
      { value: 2, label: 'Februari' },
      { value: 3, label: 'Maret' },
      { value: 4, label: 'April' },
      { value: 5, label: 'Mei' },
      { value: 6, label: 'Juni' },
      { value: 7, label: 'Juli' },
      { value: 8, label: 'Agustus' },
      { value: 9, label: 'September' },
      { value: 10, label: 'Oktober' },
      { value: 11, label: 'November' },
      { value: 12, label: 'Desember' },
    ];
  };

  const generateDays = () => {
    if (!selectedYear || !selectedMonth) return Array.from({ length: 31 }, (_, i) => i + 1);
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const generateHours = () => Array.from({ length: 24 }, (_, i) => i);
  const generateMinutes = () => Array.from({ length: 60 }, (_, i) => i);

  const renderPicker = (items, selectedValue, onSelect, formatItem = (item) => item) => (
    <View style={styles.pickerColumn}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={styles.pickerScrollContent}
      >
        <View style={{ height: ITEM_HEIGHT * 2 }} />
        {items.map((item) => {
          const itemValue = typeof item === 'object' ? item.value : item;
          const itemLabel = typeof item === 'object' ? item.label : formatItem(item);
          const isSelected = selectedValue === itemValue;
          
          return (
            <TouchableOpacity
              key={itemValue}
              style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
              onPress={() => onSelect(itemValue)}
            >
              <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>
                {itemLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: ITEM_HEIGHT * 2 }} />
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
        ]}
        onPress={handlePress}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? theme.colors.error : theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <Text style={[
          styles.inputText,
          !value && styles.placeholderText,
        ]}>
          {formatDisplay()}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.rightIcon}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Modal
        visible={show}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShow(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {mode === 'date' ? 'Pilih Tanggal' : 'Pilih Waktu'}
              </Text>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHighlight} />
              <View style={styles.pickerRow}>
                {mode === 'date' ? (
                  <>
                    {renderPicker(generateDays(), selectedDay, setSelectedDay)}
                    {renderPicker(generateMonths(), selectedMonth, setSelectedMonth)}
                    {renderPicker(generateYears(), selectedYear, setSelectedYear)}
                  </>
                ) : (
                  <>
                    {renderPicker(generateHours(), selectedHour, setSelectedHour, (h) => String(h).padStart(2, '0'))}
                    <Text style={styles.separator}>:</Text>
                    {renderPicker(generateMinutes(), selectedMinute, setSelectedMinute, (m) => String(m).padStart(2, '0'))}
                  </>
                )}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShow(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
  },
  inputText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingLeft: theme.spacing.xs,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  pickerContainer: {
    height: ITEM_HEIGHT * 5,
    position: 'relative',
    paddingVertical: theme.spacing.lg,
  },
  pickerHighlight: {
    position: 'absolute',
    top: '50%',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
    height: '100%',
  },
  pickerScrollContent: {
    paddingHorizontal: theme.spacing.sm,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {
    // Selected item styling handled by highlight
  },
  pickerItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  pickerItemTextSelected: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  separator: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginHorizontal: theme.spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
});

export default DateTimePickerComponent;

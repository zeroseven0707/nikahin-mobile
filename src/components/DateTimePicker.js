/**
 * DateTimePickerComponent
 * Drum-roll scroll picker untuk date dan time.
 * Scroll snap + auto-select saat scroll berhenti.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';

const ITEM_HEIGHT   = 48;
const VISIBLE_ITEMS = 5;                          // ganjil agar tengah = selected
const PICKER_H      = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING       = ITEM_HEIGHT * 2;            // padding atas & bawah agar item bisa ke tengah

// ─── helpers ────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');

const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

// ─── Single drum column ──────────────────────────────────────────────────────
const DrumColumn = ({ items, selected, onSelect, formatLabel }) => {
  const scrollRef = useRef(null);

  const scrollToIndex = useCallback((index, animated = true) => {
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated });
  }, []);

  // Scroll to selected when modal opens or selected changes
  useEffect(() => {
    const idx = items.findIndex((item) => {
      const val = typeof item === 'object' ? item.value : item;
      return val === selected;
    });
    if (idx >= 0) {
      // slight delay so layout is done
      const timer = setTimeout(() => scrollToIndex(idx, false), 60);
      return () => clearTimeout(timer);
    }
  }, [selected, items]);

  const handleScrollEnd = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx     = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    const item    = items[clamped];
    const val     = typeof item === 'object' ? item.value : item;
    onSelect(val);
    // snap back
    scrollToIndex(clamped, true);
  };

  return (
    <View style={col.wrap}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: PADDING }}
        nestedScrollEnabled
      >
        {items.map((item) => {
          const val   = typeof item === 'object' ? item.value : item;
          const label = typeof item === 'object'
            ? item.label
            : (formatLabel ? formatLabel(val) : String(val));
          const isSelected = val === selected;
          return (
            <TouchableOpacity
              key={val}
              style={col.item}
              onPress={() => {
                onSelect(val);
                const idx = items.findIndex((i) => (typeof i === 'object' ? i.value : i) === val);
                scrollToIndex(idx);
              }}
              activeOpacity={0.7}
            >
              <Text style={[col.label, isSelected && col.labelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const col = StyleSheet.create({
  wrap:        { flex: 1, height: PICKER_H, overflow: 'hidden' },
  item:        { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  label:       { fontSize: theme.fontSize.md, color: theme.colors.textTertiary },
  labelActive: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
});

// ─── Main component ──────────────────────────────────────────────────────────
const DateTimePickerComponent = ({
  label,
  value,
  onChange,
  mode = 'date',
  leftIcon,
  error,
  style,
}) => {
  const [show, setShow] = useState(false);

  // Draft state — only committed on "Simpan"
  const [dYear,   setDYear]   = useState(null);
  const [dMonth,  setDMonth]  = useState(null);
  const [dDay,    setDDay]    = useState(null);
  const [dHour,   setDHour]   = useState(null);
  const [dMinute, setDMinute] = useState(null);

  // Initialise draft when opening
  useEffect(() => {
    if (!show) return;
    if (mode === 'date') {
      if (value) {
        const [y, m, d] = value.split('-');
        setDYear(parseInt(y)); setDMonth(parseInt(m)); setDDay(parseInt(d));
      } else {
        const t = new Date();
        setDYear(t.getFullYear()); setDMonth(t.getMonth() + 1); setDDay(t.getDate());
      }
    } else {
      if (value) {
        const [h, m] = value.split(':');
        setDHour(parseInt(h)); setDMinute(parseInt(m));
      } else {
        setDHour(8); setDMinute(0);
      }
    }
  }, [show]);

  // ── Display text ──
  const displayText = () => {
    if (!value) return mode === 'date' ? 'Pilih tanggal' : 'Pilih waktu';
    if (mode === 'date') {
      try {
        const d = new Date(value + 'T00:00:00');
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch { return value; }
    }
    return value; // HH:MM
  };

  // ── Save ──
  const handleSave = () => {
    if (mode === 'date') {
      onChange(`${dYear}-${pad(dMonth)}-${pad(dDay)}`);
    } else {
      onChange(`${pad(dHour)}:${pad(dMinute)}`);
    }
    setShow(false);
  };

  // ── Item lists ──
  const years = (() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, i) => y + i);
  })();

  const months = MONTHS.map((label, i) => ({ value: i + 1, label }));

  const days = (() => {
    const n = dYear && dMonth ? new Date(dYear, dMonth, 0).getDate() : 31;
    return Array.from({ length: n }, (_, i) => i + 1);
  })();

  const hours   = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={value ? theme.colors.primary : theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {displayText()}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShow(false)} />

        <View style={styles.sheet}>
          {/* ── Header ── */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {mode === 'date' ? 'Pilih Tanggal' : 'Pilih Waktu'}
            </Text>
          </View>

          {/* ── Drum picker ── */}
          <View style={styles.drumWrap}>
            {/* Selection highlight */}
            <View style={styles.highlight} pointerEvents="none" />

            {/* Fade overlays */}
            <LinearGradient
              colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
              style={[styles.fade, styles.fadeTop]}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
              style={[styles.fade, styles.fadeBottom]}
              pointerEvents="none"
            />

            <View style={styles.drumRow}>
              {mode === 'date' ? (
                <>
                  <DrumColumn
                    items={days}
                    selected={dDay}
                    onSelect={setDDay}
                    formatLabel={(v) => pad(v)}
                  />
                  <Text style={styles.sep}>/</Text>
                  <DrumColumn
                    items={months}
                    selected={dMonth}
                    onSelect={setDMonth}
                  />
                  <Text style={styles.sep}>/</Text>
                  <DrumColumn
                    items={years}
                    selected={dYear}
                    onSelect={setDYear}
                  />
                </>
              ) : (
                <>
                  <DrumColumn
                    items={hours}
                    selected={dHour}
                    onSelect={setDHour}
                    formatLabel={pad}
                  />
                  <Text style={styles.colon}>:</Text>
                  <DrumColumn
                    items={minutes}
                    selected={dMinute}
                    onSelect={setDMinute}
                    formatLabel={pad}
                  />
                </>
              )}
            </View>
          </View>

          {/* ── Buttons ── */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnCancel} onPress={() => setShow(false)} activeOpacity={0.8}>
              <Text style={styles.btnCancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.85}>
              <LinearGradient
                colors={theme.colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnSaveGrad}
              >
                <Text style={styles.btnSaveText}>Simpan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { marginBottom: theme.spacing.md },
  label:        {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 6,
  },

  // Trigger button
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 13,
    gap: 8,
  },
  triggerError:  { borderColor: theme.colors.error },
  leftIcon:      { flexShrink: 0 },
  triggerText:   { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },
  placeholder:   { color: theme.colors.textTertiary },
  error:         { fontSize: theme.fontSize.xs, color: theme.colors.error, marginTop: 4, marginLeft: 2 },

  // Sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },

  // Drum
  drumWrap: {
    position: 'relative',
    height: PICKER_H,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  highlight: {
    position: 'absolute',
    left: 0, right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '30',
    zIndex: 1,
  },
  fade: {
    position: 'absolute',
    left: 0, right: 0,
    height: ITEM_HEIGHT * 2,
    zIndex: 2,
    pointerEvents: 'none',
  },
  fadeTop:    { top: 0 },
  fadeBottom: { bottom: 0 },
  drumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    zIndex: 0,
  },
  sep: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    paddingHorizontal: 2,
  },
  colon: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  btnCancelText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  btnSave: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  btnSaveGrad: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSaveText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});

export default DateTimePickerComponent;

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settingsService';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(settingsService.getDefaults());
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await settingsService.loadSettings();
      setSettings(result.settings);
      setError(null);
    } catch (err) {
      // settingsService.loadSettings() seharusnya tidak pernah reject,
      // tapi tangani jika terjadi
      setError(err.message || 'Gagal memuat pengaturan aplikasi');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Paksa refresh dari API — bypass cache
   */
  const refreshSettings = useCallback(async () => {
    try {
      const fresh = await settingsService.refreshSettings();
      setSettings(fresh);
      setError(null);
    } catch (err) {
      console.warn('Failed to refresh settings:', err.message);
    }
  }, []);

  /**
   * Ambil nilai setting dengan type-casting dan fallback
   * @param {string} key - setting key
   * @param {*} defaultValue - nilai default jika key tidak ada di settings
   * @returns {*} nilai setting atau defaultValue
   */
  const getSetting = useCallback((key, defaultValue = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }, [settings]);

  /**
   * Shorthand: harga undangan sebagai integer
   */
  const invitationPrice = getSetting('invitation_price', 50000);

  /**
   * Shorthand: apakah aplikasi dalam mode maintenance
   */
  const isMaintenanceMode = getSetting('maintenance_mode', false);

  const value = {
    settings,
    loading,
    error,
    getSetting,
    refreshSettings,
    invitationPrice,
    isMaintenanceMode,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

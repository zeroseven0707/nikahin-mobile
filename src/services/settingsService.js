import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Cache Config ─────────────────────────────────────────────────────────────
const CACHE_KEY           = 'app_settings_cache';
const CACHE_TIMESTAMP_KEY = 'app_settings_cache_timestamp';
const CACHE_TTL           = 5 * 60 * 1000; // 5 menit dalam milliseconds

// ─── Settings Service ─────────────────────────────────────────────────────────
export const settingsService = {
  /**
   * Fetch public settings dari API
   * GET /api/public/settings
   */
  fetchPublicSettings: async () => {
    const response = await api.get('/public/settings');
    return response.data; // { success: true, settings: { key: value } }
  },

  /**
   * Load settings dengan cache-first strategy:
   * 1. Kembalikan cache dari AsyncStorage jika masih fresh (< 5 menit)
   * 2. Jika cache kadaluarsa atau tidak ada, fetch dari API
   * 3. Jika API gagal dan ada cache lama (stale), kembalikan cache
   * 4. Jika API gagal dan tidak ada cache sama sekali, kembalikan defaults
   *
   * Fungsi ini SELALU resolve — tidak pernah reject
   */
  loadSettings: async () => {
    try {
      const [cachedRaw, cachedTimestampRaw] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEY),
        AsyncStorage.getItem(CACHE_TIMESTAMP_KEY),
      ]);

      const cachedSettings  = cachedRaw ? JSON.parse(cachedRaw) : null;
      const cachedTimestamp = cachedTimestampRaw ? parseInt(cachedTimestampRaw, 10) : 0;
      const isCacheFresh    = Date.now() - cachedTimestamp < CACHE_TTL;

      // Cache hit — data masih fresh, langsung kembalikan tanpa network request
      if (cachedSettings && isCacheFresh) {
        return { settings: cachedSettings, fromCache: true };
      }

      // Cache miss atau kadaluarsa — fetch dari API
      const result = await settingsService.fetchPublicSettings();
      await settingsService.saveToCache(result.settings);
      return { settings: result.settings, fromCache: false };
    } catch (error) {
      // Network error atau JSON parse error — fallback ke stale cache atau defaults
      try {
        const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const staleSettings = JSON.parse(cachedRaw);
          return { settings: staleSettings, fromCache: true, stale: true };
        }
      } catch (_) {
        // AsyncStorage error — lanjut ke defaults
      }

      // Tidak ada cache sama sekali — kembalikan defaults
      return { settings: settingsService.getDefaults(), fromCache: false, error: true };
    }
  },

  /**
   * Simpan settings ke AsyncStorage beserta timestamp
   * @param {Object} settings - settings object dari API
   */
  saveToCache: async (settings) => {
    await Promise.all([
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(settings)),
      AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString()),
    ]);
  },

  /**
   * Paksa refresh dari API (bypass cache)
   * Digunakan saat pull-to-refresh atau setelah admin update settings
   */
  refreshSettings: async () => {
    const result = await settingsService.fetchPublicSettings();
    await settingsService.saveToCache(result.settings);
    return result.settings;
  },

  /**
   * Hapus cache lokal dari AsyncStorage
   */
  clearCache: async () => {
    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEY),
      AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY),
    ]);
  },

  /**
   * Default values yang digunakan sebagai fallback ketika API tidak tersedia
   * dan tidak ada cache sama sekali
   */
  getDefaults: () => ({
    invitation_price:  50000,
    app_name:          'Nikahin',
    app_tagline:       'Undangan Digital Pernikahan Premium',
    app_version:       '1.0.0',
    support_email:     'pamudanyiptakarya@gmail.com',
    maintenance_mode:  false,
    midtrans_client_key: null,
  }),
};

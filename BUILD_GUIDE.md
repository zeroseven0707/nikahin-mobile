# 🚀 Panduan Build Aplikasi Nikahin

## 📋 Checklist Sebelum Build

### 1. ✅ Konfigurasi API Production
- [ ] Update `src/config/api.js` dengan URL production
- [ ] Pastikan backend Laravel sudah deploy dan berjalan
- [ ] Test API endpoint dari Postman/browser

### 2. ✅ Konfigurasi EAS (Expo Application Services)
- [ ] Login ke Expo: `npx eas login`
- [ ] Setup project: `npx eas build:configure`
- [ ] Update `app.json` dengan project ID yang benar

### 3. ✅ Verifikasi app.json
- [ ] Package name: `com.nikahin.app`
- [ ] Version: `1.0.0`
- [ ] Version code: `1`
- [ ] Icon & splash screen sudah ada
- [ ] Permissions sudah benar

### 4. ✅ Assets
- [ ] `assets/icon.png` (1024x1024)
- [ ] `assets/adaptive-icon.png` (1024x1024)
- [ ] `assets/splash.png` (1284x2778)

---

## 🔧 Langkah-Langkah Build

### Step 1: Update API URL ke Production

Edit `src/config/api.js`:

```javascript
// PRODUCTION
export const API_BASE_URL = 'https://your-domain.com/api';
export const WEB_BASE_URL = 'https://your-domain.com';

// ATAU jika masih testing dengan IP public
export const API_BASE_URL = 'http://YOUR_PUBLIC_IP:8000/api';
export const WEB_BASE_URL = 'http://YOUR_PUBLIC_IP:8000';
```

### Step 2: Login ke Expo

```bash
cd digital-invitation-mobile
npx eas login
```

Masukkan kredensial Expo account Anda.

### Step 3: Configure EAS Build

```bash
npx eas build:configure
```

Ini akan:
- Membuat/update `eas.json`
- Generate project ID di `app.json`

### Step 4: Build APK untuk Testing (Preview)

```bash
npx eas build --platform android --profile preview
```

**Keuntungan:**
- ✅ Menghasilkan APK (bisa langsung install)
- ✅ Cepat untuk testing
- ✅ Tidak perlu Google Play Console

**Output:** File `.apk` yang bisa di-download dan install langsung

### Step 5: Build AAB untuk Production (Play Store)

```bash
npx eas build --platform android --profile production
```

**Keuntungan:**
- ✅ Menghasilkan AAB (Android App Bundle)
- ✅ Ukuran lebih kecil
- ✅ Optimized untuk Play Store
- ✅ Support dynamic delivery

**Output:** File `.aab` untuk upload ke Google Play Console

---

## 📦 Build Profiles

### 🔵 Preview (APK)
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
- Untuk testing internal
- Install langsung tanpa Play Store
- Cocok untuk QA dan beta testing

### 🟢 Production (AAB)
```json
"production": {
  "android": {
    "buildType": "app-bundle"
  }
}
```
- Untuk upload ke Play Store
- Ukuran optimal
- Support semua device

---

## 🎯 Build Commands Lengkap

### Build APK (Testing)
```bash
# Build APK untuk testing
npx eas build --platform android --profile preview

# Build APK dengan clear cache
npx eas build --platform android --profile preview --clear-cache

# Build APK non-interactive (CI/CD)
npx eas build --platform android --profile preview --non-interactive
```

### Build AAB (Production)
```bash
# Build AAB untuk Play Store
npx eas build --platform android --profile production

# Build AAB dengan auto-submit ke Play Store
npx eas build --platform android --profile production --auto-submit
```

### Build untuk iOS (jika ada Mac)
```bash
# Build untuk iOS
npx eas build --platform ios --profile production
```

### Build untuk Both Platforms
```bash
# Build Android & iOS sekaligus
npx eas build --platform all --profile production
```

---

## 📱 Setelah Build Selesai

### Download Build
1. Buka link yang diberikan di terminal
2. Atau cek di: https://expo.dev/accounts/[username]/projects/nikahin/builds
3. Download file APK/AAB

### Install APK (Testing)
```bash
# Install via ADB
adb install path/to/app.apk

# Atau kirim file APK ke device dan install manual
```

### Upload AAB ke Play Store
1. Login ke [Google Play Console](https://play.google.com/console)
2. Pilih aplikasi Anda
3. Production → Create new release
4. Upload file `.aab`
5. Isi release notes
6. Review dan publish

---

## 🔍 Monitoring Build

### Cek Status Build
```bash
# List semua builds
npx eas build:list

# Cek build tertentu
npx eas build:view [BUILD_ID]
```

### View Build Logs
```bash
# Lihat logs build yang sedang berjalan
npx eas build:view --json
```

---

## ⚠️ Troubleshooting

### Build Failed: "Invalid credentials"
```bash
# Re-login
npx eas login
npx eas whoami
```

### Build Failed: "Out of memory"
```bash
# Build dengan clear cache
npx eas build --platform android --profile preview --clear-cache
```

### Build Failed: "Gradle error"
```bash
# Update dependencies
cd digital-invitation-mobile
npm install
npx expo install --fix
```

### APK tidak bisa install
- Pastikan "Install from Unknown Sources" enabled
- Uninstall versi lama terlebih dahulu
- Cek signature mismatch

---

## 🎨 Update Version

Sebelum build baru, update version di `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",  // Increment version
    "android": {
      "versionCode": 2   // Increment version code
    }
  }
}
```

**Rules:**
- `version`: Semantic versioning (1.0.0 → 1.0.1 → 1.1.0)
- `versionCode`: Integer, harus selalu naik (1 → 2 → 3)

---

## 📊 Build Time Estimates

| Build Type | Duration | Output Size |
|------------|----------|-------------|
| Preview APK | 5-10 min | ~50-80 MB |
| Production AAB | 10-15 min | ~30-50 MB |
| iOS | 15-25 min | ~40-60 MB |

---

## 🔐 Signing & Credentials

EAS Build otomatis handle:
- ✅ Keystore generation
- ✅ App signing
- ✅ Credential management

Credentials disimpan di Expo servers (encrypted).

### Manual Keystore (Optional)
```bash
# Generate keystore
keytool -genkeypair -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Configure di eas.json
"production": {
  "android": {
    "buildType": "app-bundle",
    "credentialsSource": "local"
  }
}
```

---

## 📝 Checklist Final

Sebelum submit ke Play Store:

- [ ] Test APK di berbagai device
- [ ] Test semua fitur utama
- [ ] Test payment flow (Midtrans)
- [ ] Test offline behavior
- [ ] Cek crash reports
- [ ] Update screenshots
- [ ] Update store listing
- [ ] Siapkan privacy policy URL
- [ ] Siapkan terms of service URL
- [ ] Content rating questionnaire
- [ ] Target audience & category

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Login
npx eas login

# 2. Configure (first time only)
npx eas build:configure

# 3. Build APK untuk testing
npx eas build --platform android --profile preview

# 4. Build AAB untuk Play Store
npx eas build --platform android --profile production
```

---

## 📞 Support

- Expo Docs: https://docs.expo.dev/build/introduction/
- EAS Build: https://docs.expo.dev/build/setup/
- Play Store: https://support.google.com/googleplay/android-developer/

---

**Happy Building! 🎉**

# 🚀 Quick Start - Build Aplikasi Nikahin

## ⚡ Super Cepat (3 Langkah)

### 1️⃣ Update API URL Production

Edit `src/config/api.js`:
```javascript
export const API_BASE_URL = 'https://your-domain.com/api';
export const WEB_BASE_URL = 'https://your-domain.com';
```

### 2️⃣ Login & Configure (Pertama Kali Saja)

```bash
cd digital-invitation-mobile

# Login ke Expo
npx eas login

# Configure project (akan generate project ID)
npx eas build:configure
```

### 3️⃣ Build!

**Untuk Testing (APK):**
```bash
npx eas build --platform android --profile preview
```

**Untuk Play Store (AAB):**
```bash
npx eas build --platform android --profile production
```

---

## 📱 Atau Gunakan Build Script

```bash
# Make script executable
chmod +x build.sh

# Run script
./build.sh
```

Script akan menampilkan menu interaktif:
1. Build APK (Testing)
2. Build AAB (Play Store)
3. Build Both
4. Check Status
5. List Builds
6. Configure EAS
7. Update Version

---

## ⏱️ Estimasi Waktu

- **APK Build**: 5-10 menit
- **AAB Build**: 10-15 menit

---

## 📥 Download Build

Setelah build selesai:
1. Buka link di terminal
2. Atau kunjungi: https://expo.dev
3. Download file APK/AAB

---

## 🎯 Next Steps

### Setelah Build APK (Testing):
1. Download APK
2. Install di device Android
3. Test semua fitur
4. Fix bugs jika ada
5. Build ulang jika perlu

### Setelah Build AAB (Production):
1. Download AAB
2. Upload ke [Google Play Console](https://play.google.com/console)
3. Isi store listing
4. Submit for review
5. Publish! 🎉

---

## 🆘 Troubleshooting

**Build gagal?**
```bash
# Clear cache dan build ulang
npx eas build --platform android --profile preview --clear-cache
```

**Tidak bisa login?**
```bash
# Re-login
npx eas logout
npx eas login
```

**Perlu update version?**
Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",     // Increment
    "android": {
      "versionCode": 2      // Increment
    }
  }
}
```

---

## 📚 Dokumentasi Lengkap

Lihat `BUILD_GUIDE.md` untuk panduan detail.

---

**That's it! Happy building! 🎉**

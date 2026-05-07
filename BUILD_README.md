# 🚀 Build Nikahin App - README

## 📁 File-File Build

| File | Deskripsi |
|------|-----------|
| `BUILD_QUICK_START.md` | ⚡ Panduan super cepat (3 langkah) |
| `BUILD_GUIDE.md` | 📚 Panduan lengkap & detail |
| `PRE_BUILD_CHECKLIST.md` | ✅ Checklist sebelum build |
| `build.sh` | 🛠️ Script interaktif untuk build |
| `update-api-url.sh` | 🔧 Script update API URL |

---

## 🎯 Pilih Panduan Sesuai Kebutuhan

### 🏃 Saya Buru-Buru!
→ Baca: **BUILD_QUICK_START.md**
- 3 langkah sederhana
- Langsung ke inti
- Estimasi: 5 menit baca

### 📖 Saya Ingin Paham Detail
→ Baca: **BUILD_GUIDE.md**
- Penjelasan lengkap
- Troubleshooting
- Best practices
- Estimasi: 15 menit baca

### ✅ Saya Mau Pastikan Semua Siap
→ Baca: **PRE_BUILD_CHECKLIST.md**
- 45+ checklist items
- Verification commands
- Common issues
- Estimasi: 10 menit check

---

## ⚡ Super Quick Start

```bash
# 1. Update API URL
chmod +x update-api-url.sh
./update-api-url.sh

# 2. Login & Configure
npx eas login
npx eas build:configure

# 3. Build APK
npx eas build --platform android --profile preview
```

---

## 🛠️ Menggunakan Build Script

```bash
# Make executable
chmod +x build.sh

# Run
./build.sh
```

Menu interaktif akan muncul:
```
1) Build APK (Preview/Testing)
2) Build AAB (Production/Play Store)
3) Build Both (APK + AAB)
4) Check Build Status
5) List All Builds
6) Configure EAS
7) Update Version
8) Exit
```

---

## 📱 Build Types

### APK (Preview)
- **Untuk**: Testing, QA, Beta
- **Command**: `npx eas build --platform android --profile preview`
- **Output**: File `.apk` (bisa install langsung)
- **Waktu**: 5-10 menit
- **Ukuran**: ~50-80 MB

### AAB (Production)
- **Untuk**: Google Play Store
- **Command**: `npx eas build --platform android --profile production`
- **Output**: File `.aab` (upload ke Play Store)
- **Waktu**: 10-15 menit
- **Ukuran**: ~30-50 MB (lebih kecil)

---

## 🔄 Workflow Recommended

### Development → Testing → Production

```
1. Development
   ↓
2. Build APK (preview)
   ↓
3. Test di device
   ↓
4. Fix bugs
   ↓
5. Build APK lagi (jika perlu)
   ↓
6. Semua OK?
   ↓
7. Build AAB (production)
   ↓
8. Upload ke Play Store
   ↓
9. Submit for review
   ↓
10. Publish! 🎉
```

---

## 📋 Checklist Cepat

Sebelum build, pastikan:

- [ ] API URL sudah production (bukan localhost)
- [ ] Backend sudah deploy dan running
- [ ] Sudah login Expo: `npx eas whoami`
- [ ] Version sudah benar di `app.json`
- [ ] Assets (icon, splash) sudah ada
- [ ] Sudah test di development mode

---

## 🆘 Troubleshooting Cepat

**Build gagal?**
```bash
npx eas build --platform android --profile preview --clear-cache
```

**Tidak bisa login?**
```bash
npx eas logout
npx eas login
```

**API URL salah?**
```bash
./update-api-url.sh
```

**Version error?**
Edit `app.json`, increment `version` dan `versionCode`

---

## 📞 Resources

- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Play Console**: https://play.google.com/console
- **Midtrans Docs**: https://docs.midtrans.com

---

## 🎓 Tips

1. **Selalu test APK dulu** sebelum build AAB production
2. **Increment version** setiap kali build baru
3. **Backup keystore** jika generate manual
4. **Test payment** di sandbox dulu
5. **Siapkan screenshots** untuk Play Store
6. **Baca review guidelines** Play Store

---

## 📊 Build Status

Cek status build:
```bash
# Via command
npx eas build:list

# Via web
https://expo.dev
```

---

## 🎉 Setelah Build Berhasil

### APK (Testing)
1. Download dari Expo dashboard
2. Transfer ke device Android
3. Install (enable "Unknown Sources")
4. Test semua fitur
5. Report bugs jika ada

### AAB (Production)
1. Download dari Expo dashboard
2. Login ke Google Play Console
3. Create new release
4. Upload AAB
5. Fill release notes
6. Submit for review
7. Wait for approval (1-7 hari)
8. Publish!

---

## 🔐 Security Notes

- Jangan commit `google-service-account.json`
- Jangan share keystore password
- Gunakan HTTPS untuk production
- Enable ProGuard/R8 (otomatis di production)
- Review permissions di `app.json`

---

## 📈 Version Management

```json
// First release
"version": "1.0.0",
"versionCode": 1

// Bug fix
"version": "1.0.1",
"versionCode": 2

// Minor update
"version": "1.1.0",
"versionCode": 3

// Major update
"version": "2.0.0",
"versionCode": 4
```

**Rules:**
- `version`: Semantic versioning (user-facing)
- `versionCode`: Integer, always increment (internal)

---

## 🎯 Next Steps

1. ✅ Baca checklist
2. 🔧 Update API URL
3. 🚀 Build APK
4. 🧪 Test thoroughly
5. 📦 Build AAB
6. 📱 Upload to Play Store
7. 🎉 Launch!

---

**Happy Building! 🚀**

*Jika ada pertanyaan, cek dokumentasi lengkap di BUILD_GUIDE.md*

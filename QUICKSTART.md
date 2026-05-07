# Quick Start Guide - Digital Invitation Mobile App

Panduan cepat untuk menjalankan aplikasi mobile dalam 5 menit!

## 📋 Prerequisites

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) (v16 atau lebih baru)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app di smartphone (untuk testing)

## 🚀 Langkah 1: Clone & Install

```bash
# Masuk ke folder mobile app
cd digital-invitation-mobile

# Install dependencies
npm install

# Atau menggunakan yarn
yarn install
```

## ⚙️ Langkah 2: Konfigurasi Backend

Edit file `src/config/api.js`:

```javascript
// Ganti dengan URL backend Laravel Anda
export const API_BASE_URL = 'http://192.168.1.100:8000';
// Untuk testing lokal, gunakan IP address komputer Anda
// JANGAN gunakan 'localhost' atau '127.0.0.1'
```

**Cara mendapatkan IP Address:**

**Windows:**
```bash
ipconfig
# Cari "IPv4 Address"
```

**Mac/Linux:**
```bash
ifconfig
# Atau
ip addr show
```

## 🔧 Langkah 3: Setup Backend Laravel

### 3.1 Update Routes

File `routes/api-mobile.php` sudah dibuat. Pastikan sudah ter-register di `bootstrap/app.php`.

### 3.2 Update Controllers

File controller sudah diupdate dengan method `showMobile`, `storeMobile`, dan `latestMobile`.

### 3.3 Enable CORS

Install CORS package:
```bash
cd digital-invitation
composer require fruitcake/laravel-cors
```

Publish config:
```bash
php artisan vendor:publish --tag="cors"
```

Edit `config/cors.php`:
```php
return [
    'paths' => ['api/*', 'i/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Untuk development
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### 3.4 Storage Link

```bash
php artisan storage:link
```

### 3.5 Jalankan Backend

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## 📱 Langkah 4: Jalankan Mobile App

```bash
# Kembali ke folder mobile
cd digital-invitation-mobile

# Start Expo
npm start

# Atau
expo start
```

Akan muncul QR code di terminal.

## 📲 Langkah 5: Test di Smartphone

### Android:
1. Install **Expo Go** dari Play Store
2. Buka Expo Go
3. Scan QR code dari terminal
4. App akan loading dan running

### iOS:
1. Install **Expo Go** dari App Store
2. Buka Camera app
3. Scan QR code dari terminal
4. Tap notifikasi untuk buka di Expo Go

## 🧪 Langkah 6: Testing

### Test dengan Kode Undangan

1. Buka app di smartphone
2. Masukkan kode undangan (unique_url dari database)
3. Tap "Buka Undangan"
4. Explore semua fitur:
   - Lihat detail undangan
   - Play music
   - Lihat gallery
   - Buka maps
   - Kirim RSVP

### Mendapatkan Kode Undangan

Dari database Laravel:
```sql
SELECT unique_url FROM invitations WHERE status = 'published' LIMIT 1;
```

Atau buat undangan baru melalui web admin.

## 🐛 Troubleshooting

### Problem: "Network Error" atau "Cannot connect"

**Solution:**
1. Pastikan smartphone dan komputer di network WiFi yang sama
2. Cek IP address sudah benar di `api.js`
3. Pastikan backend Laravel running
4. Cek firewall tidak block port 8000
5. Test API di browser: `http://YOUR_IP:8000/api/mobile/invitations/test-code`

### Problem: "Invitation not found"

**Solution:**
1. Pastikan kode undangan benar
2. Cek status undangan = 'published' di database
3. Test API endpoint langsung

### Problem: Images tidak muncul

**Solution:**
1. Jalankan `php artisan storage:link`
2. Cek file ada di `storage/app/public/`
3. Cek permissions folder storage
4. Pastikan `FILESYSTEM_DISK=public` di `.env`

### Problem: CORS Error

**Solution:**
1. Install laravel-cors package
2. Clear config cache: `php artisan config:clear`
3. Restart Laravel server

### Problem: Expo tidak bisa start

**Solution:**
```bash
# Clear cache
expo start -c

# Atau
rm -rf node_modules
npm install
expo start
```

## 📝 Testing Checklist

- [ ] App bisa dibuka
- [ ] Input kode undangan berfungsi
- [ ] Detail undangan tampil lengkap
- [ ] Countdown timer berjalan
- [ ] Music player berfungsi
- [ ] Gallery bisa dibuka
- [ ] Maps bisa dibuka
- [ ] Form RSVP bisa submit
- [ ] List RSVP tampil
- [ ] Pull to refresh berfungsi
- [ ] Navigation smooth
- [ ] No crash atau error

## 🎯 Next Steps

Setelah testing berhasil:

1. **Customize Design**:
   - Edit `src/config/theme.js` untuk colors
   - Ganti icon & splash screen di `assets/`

2. **Add Features**:
   - Lihat `FEATURES.md` untuk ide fitur tambahan
   - Implement sesuai kebutuhan

3. **Prepare for Production**:
   - Update API_BASE_URL ke production URL
   - Build APK/IPA (lihat `DEPLOYMENT.md`)
   - Submit ke Play Store / App Store

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Laravel Documentation](https://laravel.com/docs)

## 💡 Tips

1. **Development Speed**: Gunakan Expo Go untuk testing cepat
2. **Debugging**: Shake device untuk buka dev menu
3. **Hot Reload**: Save file untuk auto-reload
4. **Console Logs**: Lihat di terminal atau Expo Dev Tools
5. **Network Inspector**: Gunakan React Native Debugger

## 🆘 Need Help?

Jika masih ada masalah:
1. Cek error message di terminal
2. Cek error di Expo Go app
3. Lihat Laravel logs: `storage/logs/laravel.log`
4. Google error message
5. Check Stack Overflow

---

**Happy Coding! 🎉**

Jika berhasil, Anda sudah punya aplikasi mobile undangan digital yang berfungsi!

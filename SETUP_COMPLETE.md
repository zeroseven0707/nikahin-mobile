# Setup Complete - Ready to Use! 🎉

## ✅ Backend Laravel

**Status**: ✅ Running  
**URL**: `http://192.168.100.144:8000`  
**API Base URL**: `http://192.168.100.144:8000/api`

### Backend is running on:
```
Terminal ID: 11
Command: php artisan serve --host=0.0.0.0 --port=8000
```

## ✅ Mobile App

**Status**: ✅ Running  
**Framework**: React Native + Expo SDK 52  
**API URL**: `http://192.168.100.144:8000/api` (sudah dikonfigurasi)

### Mobile app is running on:
```
Terminal ID: 9
Command: npm start
```

## 🎨 Design

**Theme**: Pink & Gold 💗✨
- Primary: Pink (#E91E63)
- Secondary: Dark Pink (#C2185B)
- Accent: Gold (#FFD700)
- Logo: ✅ Copied from admin

## 📱 Cara Menggunakan

### 1. Buka Mobile App
1. Buka **Expo Go** di smartphone
2. Scan QR code dari terminal
3. App akan loading

### 2. Register Akun Baru
1. Tap "Daftar" di login screen
2. Isi:
   - Nama: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Konfirmasi Password: `password123`
3. Tap "Daftar"
4. Otomatis login

### 3. Buat Undangan Pertama
1. Di Dashboard, tap tombol **+** (kanan atas)
2. Isi form:
   - **Mempelai Wanita**:
     - Nama: `Jane Doe`
     - Nama Ayah: `Mr. Doe`
     - Nama Ibu: `Mrs. Doe`
   
   - **Mempelai Pria**:
     - Nama: `John Smith`
     - Nama Ayah: `Mr. Smith`
     - Nama Ibu: `Mrs. Smith`
   
   - **Akad Nikah**:
     - Tanggal: `2026-12-25`
     - Waktu Mulai: `10:00`
     - Waktu Selesai: `11:00`
     - Lokasi: `Masjid Al-Ikhlas`
   
   - **Resepsi**:
     - Tanggal: `2026-12-25`
     - Waktu Mulai: `18:00`
     - Waktu Selesai: `21:00`
     - Lokasi: `Grand Ballroom Hotel XYZ`
   
   - **Alamat**:
     - Alamat: `Jl. Sudirman No. 123, Jakarta Pusat`
     - Latitude: `-6.200000`
     - Longitude: `106.816666`

3. Tap "Buat Undangan"
4. Undangan berhasil dibuat!

### 4. Manage Undangan
- **Edit**: Tap card undangan → Tap "Edit"
- **Tambah Tamu**: Tap card → Tap "Tamu" → Tap "+"
- **Lihat RSVP**: Tap card → Tap "RSVP"
- **Lihat Stats**: Tap card → Tap "Stats"
- **Publish**: Tap card → Tap "Publish"
- **Share**: Tap card → Tap icon share (kanan atas)

## 🔧 Troubleshooting

### Mobile App tidak bisa connect ke backend

**Cek:**
1. Backend running? → Lihat terminal ID 11
2. IP address benar? → `192.168.100.144`
3. Smartphone dan komputer di WiFi yang sama?
4. Firewall tidak block port 8000?

**Test backend:**
```bash
# Di browser, buka:
http://192.168.100.144:8000
```

### Error "Network Error"

**Solusi:**
1. Restart backend:
   ```bash
   # Stop: Ctrl+C di terminal backend
   # Start: php artisan serve --host=0.0.0.0 --port=8000
   ```

2. Restart mobile app:
   - Shake device → Reload

### Error "Unauthenticated"

**Solusi:**
- Logout dan login ulang
- Token mungkin expired

## 📊 API Endpoints Available

### Authentication
- ✅ `POST /api/register` - Register
- ✅ `POST /api/login` - Login
- ✅ `POST /api/logout` - Logout
- ✅ `GET /api/user` - Get user info

### Invitations
- ✅ `GET /api/invitations` - List all
- ✅ `POST /api/invitations` - Create
- ✅ `GET /api/invitations/{id}` - Get detail
- ✅ `PUT /api/invitations/{id}` - Update
- ✅ `DELETE /api/invitations/{id}` - Delete
- ✅ `POST /api/invitations/{id}/publish` - Publish
- ✅ `POST /api/invitations/{id}/unpublish` - Unpublish

### Guests
- ✅ `GET /api/invitations/{id}/guests` - List
- ✅ `POST /api/invitations/{id}/guests` - Add
- ✅ `PUT /api/invitations/{id}/guests/{guestId}` - Update
- ✅ `DELETE /api/invitations/{id}/guests/{guestId}` - Delete

### RSVPs
- ✅ `GET /api/invitations/{id}/rsvps` - List

### Statistics
- ✅ `GET /api/invitations/{id}/statistics` - Get stats

## 🎯 Features Checklist

### ✅ Implemented
- [x] Authentication (Register/Login/Logout)
- [x] Dashboard with invitation list
- [x] Create invitation
- [x] Edit invitation
- [x] Delete invitation
- [x] Publish/Unpublish
- [x] Guest management (Add/Edit/Delete)
- [x] View RSVPs
- [x] Statistics
- [x] Share invitation link
- [x] Profile & settings
- [x] Pink & Gold theme
- [x] Logo from admin

### ⏳ Not Yet Implemented
- [ ] Upload photos (gallery)
- [ ] Upload music
- [ ] Template selection
- [ ] Preview invitation in app
- [ ] Export guest list
- [ ] Import guest list
- [ ] WhatsApp blast

## 📝 Important Notes

1. **Mobile app = Dashboard only** (untuk client yang buat undangan)
2. **Web = Public invitation** (untuk tamu yang lihat undangan)
3. **Admin tidak bisa login di mobile app**
4. **Database harus sudah di-migrate**

## 🚀 Next Steps

1. ✅ Test register & login
2. ✅ Test create invitation
3. ✅ Test all features
4. ⏳ Fix bugs if any
5. ⏳ Deploy to production
6. ⏳ Build APK/IPA

## 📞 Support

Jika ada masalah:
1. Check terminal output (backend & mobile)
2. Check error di Expo Go app
3. Restart backend & mobile app
4. Clear cache: `npm start -- --clear`

---

**Status**: ✅ **READY TO USE!**  
**Last Updated**: 2026-05-06  
**Backend**: Running on `192.168.100.144:8000`  
**Mobile**: Running on Expo Go

# Fitur Bagikan Undangan 🎊

Fitur untuk membagikan undangan pernikahan dengan 2 cara:
1. **Bagikan Umum** - Link general untuk semua orang
2. **Bagikan ke Tamu** - Link personal dengan nama tamu

## 📱 Cara Menggunakan

### 1. Akses Fitur Share

**Dari Dashboard:**
- Tap card undangan
- Tap tombol "Share" di quick actions

**Dari Detail Undangan:**
- Buka detail undangan
- Tap "Bagikan" di quick actions

### 2. Bagikan Umum

**Fitur:**
- Link undangan general tanpa nama tamu
- Format: `http://domain.com/i/unique-url`
- Bisa dibagikan ke siapa saja

**Cara:**
1. Tap "Share" untuk membuka share sheet
2. Pilih aplikasi (WhatsApp, Telegram, Email, dll)
3. Atau tap "Copy Link" untuk copy URL

**Pesan yang dibagikan:**
```
🎊 Undangan Pernikahan 🎊

Jane Doe & John Smith

📅 25 Desember 2026

🔗 http://domain.com/i/jane-john-abc123

Kami mengundang Anda untuk hadir di acara pernikahan kami. Terima kasih! 💕
```

### 3. Bagikan ke Tamu Spesifik

**Fitur:**
- Link personal dengan nama tamu
- Format: `http://domain.com/i/unique-url?to=Nama%20Tamu`
- Nama tamu akan muncul di undangan web
- Search tamu by name
- 3 opsi share per tamu:
  - **Share**: Share via aplikasi lain
  - **WhatsApp**: Langsung ke WhatsApp (jika ada nomor)
  - **Copy**: Copy link personal

**Cara:**
1. Scroll ke section "Bagikan ke Tamu"
2. Cari nama tamu (optional)
3. Pilih tamu
4. Pilih cara share:

**a. Share General:**
- Tap "Share"
- Pilih aplikasi
- Pesan otomatis include nama tamu

**b. Share via WhatsApp:**
- Tap "WhatsApp"
- Otomatis buka WhatsApp
- Jika ada nomor WA, langsung ke chat tamu
- Jika tidak ada nomor, buka WhatsApp dengan pesan siap kirim

**c. Copy Link:**
- Tap "Copy"
- Link personal tersalin
- Paste manual ke aplikasi lain

**Pesan untuk tamu spesifik:**
```
🎊 Undangan Pernikahan 🎊

Kepada Yth.
Budi Santoso

Jane Doe & John Smith

📅 25 Desember 2026

🔗 http://domain.com/i/jane-john-abc123?to=Budi%20Santoso

Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami. Terima kasih! 💕
```

## 🎯 Keuntungan Link Personal

### Untuk Host (Pembuat Undangan):
1. **Tracking**: Tahu siapa yang buka undangan
2. **Personalisasi**: Nama tamu muncul di undangan
3. **Profesional**: Lebih formal dan personal
4. **Organized**: Mudah manage per tamu

### Untuk Tamu:
1. **Personal**: Merasa lebih dihargai
2. **Clear**: Jelas undangan untuk siapa
3. **Easy**: Langsung buka tanpa input nama

## 🔍 Search Tamu

**Fitur:**
- Real-time search
- Search by nama tamu
- Case-insensitive
- Clear button untuk reset

**Cara:**
1. Tap search box
2. Ketik nama tamu
3. List tamu ter-filter otomatis
4. Tap X untuk clear search

## 📲 WhatsApp Integration

**Fitur:**
- Langsung buka WhatsApp
- Auto-fill nomor (jika ada)
- Auto-fill pesan
- Siap kirim

**Requirements:**
- WhatsApp harus terinstall
- Nomor WA tamu harus diisi di guest list

**Format Pesan WhatsApp:**
```
🎊 *Undangan Pernikahan* 🎊

Kepada Yth.
*Budi Santoso*

Jane Doe & John Smith

📅 25 Desember 2026

🔗 http://domain.com/i/jane-john-abc123?to=Budi%20Santoso

Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami. Terima kasih! 💕
```

## 💡 Tips & Best Practices

### 1. Kapan Pakai Link Umum?
- Share di social media
- Share di grup WhatsApp besar
- Share ke orang yang belum pasti datang
- Share untuk info general

### 2. Kapan Pakai Link Personal?
- Undangan formal ke tamu VIP
- Undangan ke keluarga dekat
- Undangan ke teman dekat
- Tracking siapa yang sudah buka

### 3. Workflow Recommended:
1. **Buat undangan** di app
2. **Tambah semua tamu** dengan nomor WA
3. **Publish undangan**
4. **Share personal** ke tamu satu per satu via WhatsApp
5. **Share umum** di social media untuk reach lebih luas

### 4. Template Pesan Custom:
Anda bisa edit pesan sebelum kirim:
- Tambah info tambahan
- Ubah bahasa
- Tambah emoji
- Sesuaikan tone

## 🎨 UI/UX Features

### Visual Elements:
- ✅ Icon yang jelas untuk setiap action
- ✅ Color coding (WhatsApp = green)
- ✅ Card layout yang clean
- ✅ Search box yang prominent
- ✅ Empty state yang helpful

### Interactions:
- ✅ Tap to share
- ✅ Long press to copy (optional)
- ✅ Swipe to dismiss (optional)
- ✅ Pull to refresh guest list

### Feedback:
- ✅ Toast notification saat copy
- ✅ Loading state saat load guests
- ✅ Error handling
- ✅ Success confirmation

## 🔧 Technical Details

### URL Format:

**General:**
```
http://domain.com/i/{unique_url}
```

**Personal:**
```
http://domain.com/i/{unique_url}?to={guest_name}
```

### API Calls:
- `GET /api/invitations/{id}/guests` - Load guest list
- No additional API needed for share

### Dependencies:
- `expo-clipboard` - Copy to clipboard
- `react-native Share API` - Native share
- `react-native Linking` - Open WhatsApp

## 📊 Analytics (Future)

Track share metrics:
- [ ] Berapa kali link di-share
- [ ] Via aplikasi apa
- [ ] Ke tamu mana
- [ ] Conversion rate (share → view)

## 🐛 Troubleshooting

### WhatsApp tidak buka:
- Pastikan WhatsApp terinstall
- Check nomor WA format benar
- Restart app

### Link tidak bisa di-copy:
- Check permission clipboard
- Restart app
- Update Expo Go

### Tamu tidak muncul:
- Check koneksi internet
- Refresh guest list
- Check tamu sudah ditambahkan

## 🎉 Summary

Fitur share ini memberikan:
- ✅ 2 cara share (umum & personal)
- ✅ WhatsApp integration
- ✅ Copy to clipboard
- ✅ Search tamu
- ✅ Beautiful UI
- ✅ Easy to use

**Perfect untuk membagikan undangan dengan mudah dan profesional!** 💕

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-06

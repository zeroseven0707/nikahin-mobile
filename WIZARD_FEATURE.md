# Wizard Multi-Step - Buat Undangan

## ✨ Fitur Wizard Terstruktur

### Mengapa Wizard?
- **User-Friendly**: Tidak overwhelming dengan form panjang
- **Terstruktur**: Step-by-step yang jelas
- **Validasi Per Step**: Error handling lebih baik
- **Progress Tracking**: User tahu sudah sampai mana
- **Better UX**: Fokus pada satu bagian dalam satu waktu

## 🎯 6 Langkah Wizard

### Step 1: Pilih Template
- **Icon**: images-outline
- **Konten**: Grid template cards
- **Validasi**: Template harus dipilih
- **Fitur**:
  - List semua template aktif
  - Preview icon template
  - Nama dan deskripsi template
  - Active state dengan checkmark
  - Border highlight saat dipilih

### Step 2: Mempelai Wanita
- **Icon**: woman-outline
- **Fields**:
  - Nama Lengkap * (required)
  - Nama Ayah (optional)
  - Nama Ibu (optional)
- **Validasi**: Nama lengkap wajib diisi

### Step 3: Mempelai Pria
- **Icon**: man-outline
- **Fields**:
  - Nama Lengkap * (required)
  - Nama Ayah (optional)
  - Nama Ibu (optional)
- **Validasi**: Nama lengkap wajib diisi

### Step 4: Akad Nikah
- **Icon**: heart-outline
- **Fields**:
  - Tanggal Akad * (required)
  - Waktu Mulai (optional)
  - Waktu Selesai (optional)
  - Lokasi Akad * (required)
- **Validasi**: Tanggal dan lokasi wajib diisi

### Step 5: Resepsi
- **Icon**: restaurant-outline
- **Fields**:
  - Tanggal Resepsi * (required)
  - Waktu Mulai (optional)
  - Waktu Selesai (optional)
  - Lokasi Resepsi * (required)
- **Validasi**: Tanggal dan lokasi wajib diisi

### Step 6: Lokasi
- **Icon**: location-outline
- **Fields**:
  - Alamat Lengkap (optional)
  - Latitude (optional)
  - Longitude (optional)
- **Info Box**: Penjelasan manfaat koordinat GPS
- **Validasi**: Semua optional

## 🎨 UI Components

### Header
- **Gradient Background**: Pink to Dark Pink
- **Back Button**: Navigate ke step sebelumnya atau keluar
- **Title**: "Buat Undangan"
- **Subtitle**: "Langkah X dari 6"

### Step Indicator
- **Visual Progress Bar**: 6 circles dengan connecting lines
- **States**:
  - **Not Started**: Gray circle dengan nomor
  - **Current**: Primary color dengan border gold
  - **Completed**: Primary color dengan checkmark icon
- **Connecting Lines**: Gray (not done) / Primary (done)

### Step Content
- **Card Container**: White card dengan padding
- **Step Title**: Bold, large text
- **Step Subtitle**: Descriptive text
- **Form Fields**: Input components dengan icons
- **Info Boxes**: Helpful tips (step 6)

### Navigation Buttons
- **Kembali**: Outline button (muncul dari step 2)
- **Lanjut**: Primary button (step 1-5)
- **Buat Undangan**: Primary button (step 6)
- **Layout**: Side by side dengan gap

## 🔄 User Flow

```
Dashboard
  ↓ (Klik + atau "Buat Undangan")
Step 1: Pilih Template
  ↓ (Pilih template → Lanjut)
Step 2: Mempelai Wanita
  ↓ (Isi nama → Lanjut)
Step 3: Mempelai Pria
  ↓ (Isi nama → Lanjut)
Step 4: Akad Nikah
  ↓ (Isi tanggal & lokasi → Lanjut)
Step 5: Resepsi
  ↓ (Isi tanggal & lokasi → Lanjut)
Step 6: Lokasi
  ↓ (Isi alamat → Buat Undangan)
API Call → Success
  ↓
Dashboard (dengan undangan baru)
```

## 🔒 Validasi

### Per Step Validation:
```javascript
validateStep() {
  switch (currentStep) {
    case 1: return template_id !== null
    case 2: return bride_name.trim() !== ''
    case 3: return groom_name.trim() !== ''
    case 4: return akad_date && akad_location.trim()
    case 5: return reception_date && reception_location.trim()
    case 6: return true // all optional
  }
}
```

### Error Messages:
- Clear dan spesifik
- Alert dialog
- User tidak bisa lanjut jika validasi gagal

## 📱 Backend Integration

### Template API
```
GET /api/templates
Response: {
  success: true,
  templates: [
    {
      id: 1,
      name: "Classic Elegant",
      description: "Template klasik dan elegan",
      is_active: true
    }
  ]
}
```

### Create Invitation API
```
POST /api/invitations
Body: {
  template_id: 1,
  bride_name: "...",
  groom_name: "...",
  akad_date: "2024-12-31",
  akad_location: "...",
  reception_date: "2024-12-31",
  reception_location: "...",
  // ... other fields
}
```

## 💾 State Management

### Form Data State:
```javascript
const [formData, setFormData] = useState({
  template_id: null,
  bride_name: '',
  bride_father_name: '',
  bride_mother_name: '',
  groom_name: '',
  groom_father_name: '',
  groom_mother_name: '',
  akad_date: '',
  akad_time_start: '',
  akad_time_end: '',
  akad_location: '',
  reception_date: '',
  reception_time_start: '',
  reception_time_end: '',
  reception_location: '',
  full_address: '',
  latitude: '',
  longitude: '',
});
```

### Current Step State:
```javascript
const [currentStep, setCurrentStep] = useState(1);
```

### Navigation:
- **Next**: `setCurrentStep(currentStep + 1)`
- **Back**: `setCurrentStep(currentStep - 1)`
- **Submit**: Final step calls API

## 🎯 Advantages

### User Experience:
✅ **Less Overwhelming**: Satu fokus per step
✅ **Clear Progress**: Visual indicator
✅ **Easy Navigation**: Back/Next buttons
✅ **Validation Feedback**: Per step
✅ **Mobile Optimized**: Scroll per section

### Developer Experience:
✅ **Modular Code**: Each step is separate function
✅ **Easy Maintenance**: Add/remove steps easily
✅ **Reusable**: Wizard pattern dapat digunakan lagi
✅ **Testable**: Each step can be tested independently

### Business Benefits:
✅ **Higher Completion Rate**: Structured flow
✅ **Better Data Quality**: Validation per step
✅ **Professional Look**: Modern wizard UI
✅ **User Satisfaction**: Easier to use

## 🧪 Testing Checklist

### Navigation:
- [ ] Back button dari step 2-6
- [ ] Back button di step 1 keluar wizard
- [ ] Next button validasi sebelum lanjut
- [ ] Step indicator update correctly
- [ ] Completed steps show checkmark

### Validation:
- [ ] Step 1: Cannot proceed without template
- [ ] Step 2: Cannot proceed without bride name
- [ ] Step 3: Cannot proceed without groom name
- [ ] Step 4: Cannot proceed without akad date & location
- [ ] Step 5: Cannot proceed without reception date & location
- [ ] Step 6: Can proceed (all optional)

### Data Persistence:
- [ ] Form data retained when going back
- [ ] Selected template stays selected
- [ ] All inputs keep their values

### API Integration:
- [ ] Templates load correctly
- [ ] Create invitation success
- [ ] Error handling works
- [ ] Loading states show
- [ ] Navigate to dashboard after success

### UI/UX:
- [ ] Step indicator visual correct
- [ ] Buttons layout responsive
- [ ] Keyboard handling works
- [ ] ScrollView works properly
- [ ] Icons display correctly

## 📊 Metrics to Track

### Completion Rate:
- How many users complete all 6 steps?
- Which step has highest drop-off?

### Time Spent:
- Average time per step
- Total time to complete wizard

### Errors:
- Most common validation errors
- Which fields cause confusion

## 🚀 Future Enhancements

### Possible Improvements:
1. **Date Picker**: Native date picker instead of text input
2. **Time Picker**: Native time picker
3. **Map Integration**: Pick location from map
4. **Template Preview**: Full preview before selection
5. **Save Draft**: Save progress and continue later
6. **Skip Optional**: Skip button for optional steps
7. **Tooltips**: Help text for each field
8. **Auto-fill**: Suggest based on previous invitations

---

**Created**: May 6, 2026
**Version**: 1.0.0
**Status**: Complete ✅

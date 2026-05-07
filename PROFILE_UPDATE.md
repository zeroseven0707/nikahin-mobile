# Profile & Settings Update - Nikahin

## ✅ Perubahan yang Dilakukan

### 1. Hapus SettingsScreen
- ❌ File `SettingsScreen.js` dihapus
- ✅ Semua menu dipindahkan ke `ProfileScreen`
- ✅ Menu notifikasi dihapus (tidak diperlukan)

### 2. Update ProfileScreen
Menu baru di ProfileScreen:
- **Edit Profil** → Navigate ke EditProfileScreen
- **Ubah Password** → Navigate ke ChangePasswordScreen
- **Bantuan & FAQ** → Navigate ke HelpScreen
- **Tentang Aplikasi** → Navigate ke AboutScreen
- **Keluar** → Logout button

### 3. Screen Baru yang Dibuat

#### EditProfileScreen
- **Path**: `src/screens/EditProfileScreen.js`
- **Fitur**:
  - Edit nama lengkap
  - Edit email
  - Form validation
  - Update ke backend
  - Auto-update user context

#### ChangePasswordScreen
- **Path**: `src/screens/ChangePasswordScreen.js`
- **Fitur**:
  - Input password saat ini
  - Input password baru
  - Konfirmasi password baru
  - Toggle show/hide password
  - Validasi minimal 8 karakter
  - Auto logout setelah berhasil
  - Info box: user akan diminta login kembali

### 4. Backend API Baru

#### Update Profile Endpoint
```
PUT /api/profile
Headers: Authorization: Bearer {token}
Body: {
  name: string,
  email: string
}
Response: {
  success: true,
  message: "Profile updated successfully",
  user: {...}
}
```

#### Change Password Endpoint
```
POST /api/change-password
Headers: Authorization: Bearer {token}
Body: {
  current_password: string,
  new_password: string,
  new_password_confirmation: string
}
Response: {
  success: true,
  message: "Password berhasil diubah. Silakan login kembali."
}
```

### 5. Update AuthController.php
Menambahkan 2 method baru:
- `updateProfile()` - Update nama dan email user
- `changePassword()` - Ubah password dengan validasi

### 6. Update routes/api.php
Menambahkan 2 route baru:
```php
Route::put('/profile', [AuthController::class, 'updateProfile']);
Route::post('/change-password', [AuthController::class, 'changePassword']);
```

### 7. Update invitationService.js
Menambahkan 2 method baru:
```javascript
authService.updateProfile(token, data)
authService.changePassword(token, data)
```

### 8. Update AuthContext
Method `updateUser()` sudah ada dan berfungsi untuk:
- Update user state
- Update AsyncStorage
- Sync dengan backend response

### 9. Update Input Component
- Tambah support `onPressRightIcon` prop
- Untuk toggle show/hide password
- Right icon sekarang bisa di-tap

## 🎯 Flow Lengkap

### Edit Profile Flow:
1. User buka tab Profil
2. Klik "Edit Profil"
3. Form muncul dengan data current user
4. User edit nama/email
5. Klik "Simpan Perubahan"
6. API call ke backend
7. Update user context
8. Kembali ke ProfileScreen
9. Data ter-update

### Change Password Flow:
1. User buka tab Profil
2. Klik "Ubah Password"
3. Input password saat ini
4. Input password baru (min 8 char)
5. Konfirmasi password baru
6. Klik "Ubah Password"
7. API call ke backend
8. Backend validasi password lama
9. Update password baru
10. Delete semua tokens
11. User auto logout
12. Redirect ke login screen

## 🔒 Security Features

### Password Change:
- ✅ Validasi password lama
- ✅ Minimal 8 karakter
- ✅ Konfirmasi password match
- ✅ Auto logout setelah berhasil
- ✅ Delete semua tokens (force re-login)
- ✅ Password di-hash dengan bcrypt

### Profile Update:
- ✅ Email unique validation
- ✅ Required field validation
- ✅ Token authentication
- ✅ User ownership check

## 📱 UI/UX Improvements

### Input Component:
- Toggle password visibility
- Icon kiri dan kanan
- Error states
- Disabled states
- Multiline support

### Form Validation:
- Real-time validation
- Clear error messages
- Loading states
- Success feedback

### User Feedback:
- Alert untuk success
- Alert untuk error
- Info box untuk important notes
- Confirmation dialogs

## 🧪 Testing Checklist

### Edit Profile:
- [ ] Buka Edit Profil
- [ ] Ubah nama
- [ ] Ubah email
- [ ] Submit form
- [ ] Verify data ter-update
- [ ] Check AsyncStorage
- [ ] Check backend database

### Change Password:
- [ ] Buka Ubah Password
- [ ] Input password salah → error
- [ ] Input password benar
- [ ] Password baru < 8 char → error
- [ ] Konfirmasi tidak match → error
- [ ] Submit berhasil
- [ ] Auto logout
- [ ] Login dengan password baru
- [ ] Login dengan password lama → error

### Navigation:
- [ ] ProfileScreen → EditProfile
- [ ] ProfileScreen → ChangePassword
- [ ] ProfileScreen → Help
- [ ] ProfileScreen → About
- [ ] Back button works
- [ ] Tab navigation works

## 📊 File Changes Summary

### Files Created:
1. `src/screens/EditProfileScreen.js`
2. `src/screens/ChangePasswordScreen.js`
3. `PROFILE_UPDATE.md` (this file)

### Files Modified:
1. `src/screens/ProfileScreen.js`
2. `src/navigation/AppNavigator.js`
3. `src/components/Input.js`
4. `src/services/invitationService.js`
5. `app/Http/Controllers/Api/AuthController.php`
6. `routes/api.php`

### Files Deleted:
1. `src/screens/SettingsScreen.js`

## 🚀 Deployment Notes

### Backend:
1. Pull latest code
2. No migration needed (using existing users table)
3. Test API endpoints
4. Deploy to production

### Mobile App:
1. Pull latest code
2. Test all flows
3. Build new version
4. Submit to Play Store

## 📞 Support

Jika ada issue:
- Check API response di console
- Check AsyncStorage data
- Verify token validity
- Check backend logs

---

**Last Updated**: May 6, 2026
**Version**: 1.0.0
**Status**: Complete ✅

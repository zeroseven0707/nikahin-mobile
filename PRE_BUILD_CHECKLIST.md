# ✅ Pre-Build Checklist - Nikahin App

## 🔍 Checklist Sebelum Build

### 📡 Backend & API
- [ ] Backend Laravel sudah deploy dan running
- [ ] API endpoint accessible dari internet
- [ ] Database sudah setup dengan data production
- [ ] Midtrans sudah configured (production keys)
- [ ] CORS sudah configured untuk mobile app
- [ ] SSL certificate installed (HTTPS)

### 🔧 Konfigurasi App

#### `src/config/api.js`
- [ ] `API_BASE_URL` sudah production URL (bukan localhost/192.168.x.x)
- [ ] `WEB_BASE_URL` sudah production URL
- [ ] Timeout sudah sesuai (10000ms = 10 detik)

#### `app.json`
- [ ] `name`: "Nikahin" ✓
- [ ] `slug`: "nikahin" ✓
- [ ] `version`: "1.0.0" (atau versi yang sesuai)
- [ ] `package`: "com.nikahin.app" ✓
- [ ] `versionCode`: 1 (atau increment jika update)
- [ ] `icon.png` exists (1024x1024)
- [ ] `adaptive-icon.png` exists (1024x1024)
- [ ] `splash.png` exists (1284x2778)
- [ ] `bundleIdentifier` (iOS): "com.nikahin.app" ✓
- [ ] Permissions sudah benar ✓

#### `eas.json`
- [ ] Preview profile configured ✓
- [ ] Production profile configured ✓
- [ ] Submit profile configured (optional)

### 🎨 Assets
- [ ] `assets/icon.png` - App icon (1024x1024, PNG)
- [ ] `assets/adaptive-icon.png` - Android adaptive icon (1024x1024, PNG)
- [ ] `assets/splash.png` - Splash screen (1284x2778, PNG)
- [ ] All images optimized (tidak terlalu besar)

### 📝 Legal & Compliance
- [ ] Privacy Policy URL ready
- [ ] Terms of Service URL ready
- [ ] Content rating questionnaire completed
- [ ] Target audience defined
- [ ] App category selected

### 🧪 Testing
- [ ] Login/Register works
- [ ] Create invitation works
- [ ] Payment flow works (Midtrans)
- [ ] QR code generation works
- [ ] Guest management works
- [ ] Gallery upload works
- [ ] Share invitation works
- [ ] All navigation works
- [ ] No console errors
- [ ] No crashes

### 🔐 Security
- [ ] No hardcoded secrets in code
- [ ] API keys in environment variables
- [ ] Sensitive data encrypted
- [ ] HTTPS enforced
- [ ] Input validation implemented

### 📦 Dependencies
- [ ] All npm packages installed
- [ ] No deprecated packages
- [ ] No security vulnerabilities
- [ ] Package.json up to date

### 🚀 Expo & EAS
- [ ] Expo account created
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged in: `npx eas login`
- [ ] Project configured: `npx eas build:configure`
- [ ] Project ID in app.json (auto-generated)

### 📱 Google Play Console (untuk Production)
- [ ] Google Play Developer account ($25 one-time)
- [ ] App created in console
- [ ] Store listing prepared:
  - [ ] App name
  - [ ] Short description (80 chars)
  - [ ] Full description (4000 chars)
  - [ ] Screenshots (min 2, max 8)
  - [ ] Feature graphic (1024x500)
  - [ ] App icon (512x512)
  - [ ] Privacy policy URL
  - [ ] Contact email
  - [ ] Category
  - [ ] Content rating

---

## 🎯 Quick Verification Commands

```bash
# Check if logged in
npx eas whoami

# Check project status
npx eas project:info

# Verify app.json
cat app.json | grep -E "version|versionCode|package"

# Check API URL
cat src/config/api.js | grep BASE_URL

# List dependencies
npm list --depth=0

# Check for vulnerabilities
npm audit

# Test build locally (optional)
npx expo prebuild --clean
```

---

## 🚦 Build Readiness Score

Count your checkmarks:

- **40-45 ✓**: 🟢 Ready to build!
- **30-39 ✓**: 🟡 Almost ready, fix remaining items
- **< 30 ✓**: 🔴 Not ready, complete more items

---

## 📋 Pre-Build Commands

```bash
# 1. Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# 2. Clear Expo cache
npx expo start --clear

# 3. Verify no errors
npx expo doctor

# 4. Update Expo SDK (if needed)
npx expo install --fix
```

---

## ⚠️ Common Issues to Check

### API URL Issues
```javascript
// ❌ WRONG (localhost)
export const API_BASE_URL = 'http://localhost:8000/api';

// ❌ WRONG (local IP)
export const API_BASE_URL = 'http://192.168.1.100:8000/api';

// ✅ CORRECT (production domain)
export const API_BASE_URL = 'https://api.nikahin.com/api';

// ✅ CORRECT (public IP with HTTPS)
export const API_BASE_URL = 'https://123.45.67.89/api';
```

### Version Issues
```json
// ❌ WRONG (same version for update)
"version": "1.0.0",
"versionCode": 1

// ✅ CORRECT (incremented)
"version": "1.0.1",
"versionCode": 2
```

### Package Name Issues
```json
// ❌ WRONG (default/example)
"package": "com.yourcompany.yourapp"

// ✅ CORRECT (unique identifier)
"package": "com.nikahin.app"
```

---

## 🎬 Ready to Build?

If all checks pass, proceed with:

```bash
# For testing
npx eas build --platform android --profile preview

# For production
npx eas build --platform android --profile production
```

Or use the build script:
```bash
./build.sh
```

---

## 📞 Need Help?

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Community: https://forums.expo.dev

---

**Good luck with your build! 🚀**

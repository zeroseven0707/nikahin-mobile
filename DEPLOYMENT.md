# Deployment Guide - Digital Invitation Mobile App

Panduan lengkap untuk deploy aplikasi mobile ke production.

## 📱 Build untuk Android

### 1. Setup EAS Build (Recommended)

Install EAS CLI:
```bash
npm install -g eas-cli
```

Login ke Expo:
```bash
eas login
```

Configure project:
```bash
eas build:configure
```

### 2. Build APK (untuk testing)

```bash
eas build --platform android --profile preview
```

### 3. Build AAB (untuk Google Play Store)

```bash
eas build --platform android --profile production
```

### 4. Build Standalone APK (tanpa Expo)

Update `app.json`:
```json
{
  "expo": {
    "android": {
      "package": "com.digitalinvitation.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

Build:
```bash
expo build:android -t apk
```

## 🍎 Build untuk iOS

### 1. Prerequisites

- Mac dengan Xcode installed
- Apple Developer Account ($99/year)
- iOS device untuk testing

### 2. Setup

Update `app.json`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.digitalinvitation.app",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    }
  }
}
```

### 3. Build dengan EAS

```bash
eas build --platform ios --profile production
```

### 4. Submit ke App Store

```bash
eas submit --platform ios
```

## 🔧 Configuration untuk Production

### 1. Update API URL

Edit `src/config/api.js`:
```javascript
export const API_BASE_URL = 'https://your-production-domain.com';
```

### 2. Update App Version

Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    },
    "ios": {
      "buildNumber": "1.0.0"
    }
  }
}
```

### 3. Add App Icons

Buat icon dengan ukuran:
- `icon.png`: 1024x1024px
- `adaptive-icon.png`: 1024x1024px (Android)
- `splash.png`: 1242x2436px

Tools untuk generate icons:
- https://www.appicon.co/
- https://makeappicon.com/

### 4. Configure Splash Screen

Edit `app.json`:
```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#C9A86A"
    }
  }
}
```

## 📦 Google Play Store Deployment

### 1. Create Google Play Console Account

- Daftar di https://play.google.com/console
- Bayar one-time fee $25

### 2. Create App

1. Login ke Google Play Console
2. Click "Create app"
3. Fill in app details:
   - App name: Digital Invitation
   - Default language: Indonesian
   - App type: App
   - Category: Lifestyle

### 3. Prepare Store Listing

**Required assets:**
- App icon: 512x512px
- Feature graphic: 1024x500px
- Screenshots: minimal 2 (phone), max 8
  - Portrait: 1080x1920px atau 1440x2560px
  - Landscape: 1920x1080px atau 2560x1440px

**Store listing info:**
- Short description (80 chars max)
- Full description (4000 chars max)
- Privacy policy URL
- Contact email

### 4. Upload APK/AAB

1. Go to "Production" > "Create new release"
2. Upload AAB file
3. Fill in release notes
4. Review and rollout

### 5. Content Rating

1. Go to "Content rating"
2. Fill questionnaire
3. Submit for rating

### 6. Pricing & Distribution

1. Set app as Free or Paid
2. Select countries
3. Accept terms

## 🍎 App Store Deployment

### 1. Create App Store Connect Account

- Enroll in Apple Developer Program ($99/year)
- Access https://appstoreconnect.apple.com

### 2. Create App

1. Click "My Apps" > "+"
2. Fill in app information:
   - Name: Digital Invitation
   - Primary Language: Indonesian
   - Bundle ID: com.digitalinvitation.app
   - SKU: unique identifier

### 3. Prepare App Store Listing

**Required assets:**
- App icon: 1024x1024px
- Screenshots:
  - iPhone 6.5": 1242x2688px (3 required)
  - iPhone 5.5": 1242x2208px (3 required)
  - iPad Pro 12.9": 2048x2732px (optional)

**App information:**
- Description
- Keywords
- Support URL
- Marketing URL (optional)
- Privacy Policy URL

### 4. Upload Build

Using EAS:
```bash
eas submit --platform ios
```

Or using Xcode:
1. Open project in Xcode
2. Product > Archive
3. Upload to App Store Connect

### 5. Submit for Review

1. Fill in App Review Information
2. Add test account credentials
3. Submit for review

## 🔐 Security Checklist

- [ ] API menggunakan HTTPS
- [ ] API_BASE_URL sudah diupdate ke production
- [ ] Rate limiting enabled di backend
- [ ] CORS configured dengan benar
- [ ] Input validation di semua form
- [ ] Error handling yang proper
- [ ] Sensitive data tidak di-log
- [ ] App permissions minimal

## 📊 Analytics & Monitoring

### Setup Firebase Analytics (Optional)

1. Install Firebase:
```bash
expo install @react-native-firebase/app @react-native-firebase/analytics
```

2. Configure Firebase in `app.json`

3. Track events:
```javascript
import analytics from '@react-native-firebase/analytics';

await analytics().logEvent('invitation_viewed', {
  invitation_id: invitation.id
});
```

### Setup Sentry (Error Tracking)

1. Install Sentry:
```bash
npm install @sentry/react-native
```

2. Initialize in `App.js`:
```javascript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

## 🚀 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/build.yml`:
```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: eas build --platform android --non-interactive
```

## 📝 Post-Deployment

### 1. Monitor Crashes

- Check Google Play Console / App Store Connect
- Setup crash reporting (Sentry/Firebase)

### 2. Gather Feedback

- Monitor app reviews
- Setup in-app feedback form
- Track analytics

### 3. Plan Updates

- Fix bugs based on feedback
- Add new features
- Improve performance

## 🔄 Update Process

### Version Bump

1. Update `version` in `app.json`
2. Update `versionCode` (Android) / `buildNumber` (iOS)
3. Build new version
4. Upload to stores
5. Add release notes

### Over-the-Air (OTA) Updates

Untuk update minor tanpa rebuild:
```bash
eas update --branch production --message "Bug fixes"
```

## 📞 Support

Jika ada masalah:
1. Check Expo documentation: https://docs.expo.dev
2. Check React Native documentation: https://reactnative.dev
3. Search di Stack Overflow
4. Contact developer

---

**Good luck with your deployment! 🚀**

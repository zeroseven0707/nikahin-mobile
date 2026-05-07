# Google Play Store Submission Checklist

## ✅ Pre-Submission Requirements

### 1. App Configuration
- [x] App name set in app.json
- [x] Unique package name (com.digitalinvitation.app)
- [x] Version code and version name set
- [x] App icon (512x512) created
- [x] Splash screen configured
- [x] Adaptive icon for Android
- [x] Correct permissions declared
- [x] Blocked unnecessary permissions

### 2. Legal Documents
- [x] Privacy Policy created (PRIVACY_POLICY.md)
- [x] Terms of Service created (TERMS_OF_SERVICE.md)
- [ ] Host Privacy Policy on public URL (required by Google)
- [ ] Host Terms of Service on public URL

### 3. Build Configuration
- [x] EAS Build configuration (eas.json)
- [x] Production build settings
- [x] App bundle (AAB) format configured
- [ ] Signing key generated (run: `eas credentials`)

### 4. App Content
- [x] All features working properly
- [x] No crashes or critical bugs
- [x] Proper error handling
- [x] Loading states implemented
- [x] Offline handling (where applicable)
- [x] Responsive design for different screen sizes

### 5. Security & Privacy
- [x] HTTPS for all API calls
- [x] Secure authentication (token-based)
- [x] Password encryption
- [x] No hardcoded secrets
- [x] Proper data validation
- [x] SQL injection prevention (backend)
- [x] XSS prevention (backend)

## 📋 Google Play Console Setup

### 1. Create Developer Account
- [ ] Sign up at https://play.google.com/console
- [ ] Pay one-time $25 registration fee
- [ ] Complete account verification
- [ ] Set up payment profile (for paid apps/IAP)

### 2. Create App in Console
- [ ] Click "Create app"
- [ ] Enter app name: "Digital Invitation"
- [ ] Select default language: English (or Indonesian)
- [ ] Choose app/game: App
- [ ] Choose free/paid: Free
- [ ] Accept declarations

### 3. Store Listing
- [ ] Upload app icon (512x512)
- [ ] Upload feature graphic (1024x500)
- [ ] Upload at least 2 phone screenshots (1080x1920)
- [ ] Upload tablet screenshots (optional)
- [ ] Write short description (80 chars)
- [ ] Write full description (4000 chars)
- [ ] Add app category: Events
- [ ] Add contact email
- [ ] Add privacy policy URL (REQUIRED)
- [ ] Add terms of service URL

### 4. Content Rating
- [ ] Complete content rating questionnaire
- [ ] Answer all questions honestly
- [ ] Expected rating: Everyone or Teen
- [ ] Submit for rating

### 5. App Content
- [ ] Privacy Policy URL (REQUIRED)
- [ ] Ads declaration (No ads)
- [ ] Target audience: 18+
- [ ] Data safety form:
  - [ ] List data collected (email, name, etc.)
  - [ ] Explain data usage
  - [ ] Confirm data encryption
  - [ ] Confirm data deletion option

### 6. Store Settings
- [ ] Select app category: Events
- [ ] Add tags (optional)
- [ ] Set up contact details
- [ ] Add website URL (optional)

### 7. Countries/Regions
- [ ] Select target countries
- [ ] Recommended: Start with Indonesia, US, UK
- [ ] Can expand later

## 🔨 Build & Upload

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure Project
```bash
eas build:configure
```

### 4. Build for Production
```bash
# Build Android App Bundle (AAB)
eas build --platform android --profile production
```

### 5. Download AAB
- [ ] Wait for build to complete
- [ ] Download .aab file from Expo dashboard

### 6. Upload to Play Console
- [ ] Go to Play Console > Your App > Production
- [ ] Click "Create new release"
- [ ] Upload .aab file
- [ ] Add release notes
- [ ] Review and rollout

## 🧪 Testing Requirements

### 1. Internal Testing
- [ ] Upload first build to internal testing track
- [ ] Add internal testers (email addresses)
- [ ] Test all features thoroughly
- [ ] Fix any issues found

### 2. Closed Testing (Optional)
- [ ] Create closed testing track
- [ ] Add beta testers
- [ ] Gather feedback
- [ ] Iterate and improve

### 3. Pre-Launch Report
- [ ] Google will automatically test your app
- [ ] Review pre-launch report
- [ ] Fix any critical issues
- [ ] Address warnings if possible

## 📱 App Requirements

### Technical Requirements
- [x] Target API level 33 (Android 13) or higher
- [x] Support 64-bit architectures
- [x] App size under 150MB (initial download)
- [x] No crashes on startup
- [x] Proper back button handling
- [x] Proper permission requests

### Design Requirements
- [x] Material Design guidelines followed
- [x] Proper touch targets (48dp minimum)
- [x] Readable text (12sp minimum)
- [x] Proper contrast ratios
- [x] Support different screen sizes
- [x] Support different screen densities

### Content Requirements
- [x] No prohibited content
- [x] No copyright violations
- [x] No misleading information
- [x] Accurate app description
- [x] Appropriate content rating

## 🚀 Launch Checklist

### Before Submitting
- [ ] Test on multiple devices
- [ ] Test on different Android versions
- [ ] Verify all links work
- [ ] Check all text for typos
- [ ] Verify privacy policy is accessible
- [ ] Test payment flows (if applicable)
- [ ] Verify analytics are working

### Submission
- [ ] Complete all required fields
- [ ] Upload all required assets
- [ ] Set pricing and distribution
- [ ] Review app content declarations
- [ ] Submit for review

### After Submission
- [ ] Monitor review status
- [ ] Respond to any review feedback
- [ ] Fix issues if rejected
- [ ] Resubmit if necessary

### Post-Launch
- [ ] Monitor crash reports
- [ ] Monitor user reviews
- [ ] Respond to user feedback
- [ ] Plan updates and improvements
- [ ] Monitor analytics

## 📊 Important Notes

### Review Time
- First review: 7-14 days typically
- Updates: 1-3 days typically
- Can be expedited for critical fixes

### Common Rejection Reasons
1. Missing or invalid privacy policy
2. Misleading app description
3. Crashes or critical bugs
4. Inappropriate content
5. Copyright violations
6. Incomplete store listing
7. Missing required permissions explanations

### Tips for Approval
1. Be honest and transparent
2. Provide complete information
3. Test thoroughly before submitting
4. Follow all Google policies
5. Respond quickly to review feedback
6. Keep app updated regularly

## 🔗 Useful Links

- Google Play Console: https://play.google.com/console
- Play Store Policies: https://play.google.com/about/developer-content-policy/
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Android App Bundle: https://developer.android.com/guide/app-bundle
- Content Rating: https://support.google.com/googleplay/android-developer/answer/9859655

## 📞 Support

If you need help:
- Expo Discord: https://chat.expo.dev
- Expo Forums: https://forums.expo.dev
- Google Play Support: https://support.google.com/googleplay/android-developer

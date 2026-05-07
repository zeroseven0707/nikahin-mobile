# Digital Invitation Mobile App

A beautiful and modern mobile application for creating and managing digital wedding invitations.

## 📱 Features

- **User Authentication**: Secure login and registration
- **Invitation Management**: Create, edit, and delete wedding invitations
- **Guest List**: Add and manage wedding guests
- **RSVP Tracking**: Monitor guest responses and messages
- **Statistics**: View invitation analytics and engagement metrics
- **Share Invitations**: Share via WhatsApp, social media, or direct links
- **Real-time Updates**: Instant status updates and notifications
- **Beautiful UI**: Modern, elegant design with pink and gold theme

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Custom components with Expo Vector Icons
- **Authentication**: Token-based (Laravel Sanctum)
- **Storage**: AsyncStorage for local data

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`) for building
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd digital-invitation-mobile
npm install
```

### 2. Configure API URL

Edit `src/config/api.js` and set your backend URL:

```javascript
export const API_BASE_URL = 'http://your-backend-url:8000';
```

### 3. Start Development Server

```bash
npm start
```

### 4. Run on Device/Emulator

- **Android**: Press `a` or scan QR code with Expo Go app
- **iOS**: Press `i` or scan QR code with Expo Go app (iOS only)

## 🏗️ Building for Production

### Android (AAB for Play Store)

```bash
# Login to Expo
eas login

# Configure build
eas build:configure

# Build production AAB
eas build --platform android --profile production
```

### Android (APK for testing)

```bash
eas build --platform android --profile preview
```

### iOS (IPA for App Store)

```bash
eas build --platform ios --profile production
```

## 📁 Project Structure

```
digital-invitation-mobile/
├── assets/                 # Images, icons, fonts
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   └── Input.js
│   ├── config/           # Configuration files
│   │   ├── api.js        # API configuration
│   │   └── theme.js      # Theme colors and styles
│   ├── context/          # React Context
│   │   └── AuthContext.js
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── screens/          # App screens
│   │   ├── auth/         # Authentication screens
│   │   ├── DashboardScreen.js
│   │   ├── CreateInvitationScreen.js
│   │   ├── EditInvitationScreen.js
│   │   ├── InvitationDetailScreen.js
│   │   ├── GuestListScreen.js
│   │   ├── RsvpListScreen.js
│   │   ├── StatisticsScreen.js
│   │   ├── ShareInvitationScreen.js
│   │   └── ProfileScreen.js
│   └── services/         # API services
│       └── invitationService.js
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
├── package.json          # Dependencies
└── App.js               # Entry point
```

## 🎨 Theme Customization

Edit `src/config/theme.js` to customize colors:

```javascript
export const theme = {
  colors: {
    primary: '#D4526E',      // Dusty Rose
    secondary: '#B83B5E',    // Deep Rose
    accent: '#F7B731',       // Warm Gold
    // ... more colors
  },
  // ... spacing, fonts, etc.
};
```

## 🔐 Environment Variables

Create `.env` file (optional):

```env
API_URL=http://192.168.1.100:8000
```

## 📱 Google Play Store Submission

See [PLAY_STORE_CHECKLIST.md](./PLAY_STORE_CHECKLIST.md) for complete submission guide.

### Quick Steps:

1. **Prepare Assets**
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (1080x1920)

2. **Legal Documents**
   - Host Privacy Policy online
   - Host Terms of Service online

3. **Build AAB**
   ```bash
   eas build --platform android --profile production
   ```

4. **Upload to Play Console**
   - Create app in Google Play Console
   - Complete store listing
   - Upload AAB file
   - Submit for review

## 🧪 Testing

### Run on Physical Device

1. Install Expo Go app from Play Store/App Store
2. Run `npm start`
3. Scan QR code with Expo Go

### Run on Emulator

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

## 📄 Documentation

- [Privacy Policy](./PRIVACY_POLICY.md)
- [Terms of Service](./TERMS_OF_SERVICE.md)
- [Play Store Listing](./PLAY_STORE_LISTING.md)
- [Play Store Checklist](./PLAY_STORE_CHECKLIST.md)

## 🐛 Troubleshooting

### Common Issues

**1. Metro bundler cache issues**
```bash
npm start -- --clear
```

**2. Module not found errors**
```bash
rm -rf node_modules
npm install
```

**3. Build fails**
```bash
eas build:configure
eas build --platform android --profile production --clear-cache
```

**4. API connection issues**
- Check API_BASE_URL in `src/config/api.js`
- Ensure backend is running
- Check network connectivity
- Verify CORS settings on backend

## 🔄 Updates

### Update App Version

1. Update version in `app.json`:
   ```json
   {
     "version": "1.0.1",
     "android": {
       "versionCode": 2
     }
   }
   ```

2. Build new version:
   ```bash
   eas build --platform android --profile production
   ```

3. Upload to Play Console

## 📊 Analytics (Optional)

To add analytics, install:

```bash
npm install @react-native-firebase/analytics
```

## 🔔 Push Notifications (Optional)

To add push notifications:

```bash
expo install expo-notifications
```

## 🌐 Internationalization (Optional)

To add multiple languages:

```bash
npm install i18next react-i18next
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, email support@digitalinvitation.com

## 🙏 Acknowledgments

- Expo team for amazing framework
- React Native community
- All contributors

## 📈 Roadmap

- [ ] iOS version
- [ ] Push notifications
- [ ] Offline mode
- [ ] Multiple languages
- [ ] Premium templates
- [ ] Payment integration
- [ ] Social media integration
- [ ] Calendar integration
- [ ] Photo gallery for invitations
- [ ] Video invitations

## 🔗 Links

- **Backend Repository**: [Link to backend repo]
- **Website**: https://digitalinvitation.com
- **Support**: support@digitalinvitation.com
- **Privacy Policy**: https://digitalinvitation.com/privacy
- **Terms of Service**: https://digitalinvitation.com/terms

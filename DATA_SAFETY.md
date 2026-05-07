# Data Safety Declaration for Google Play Store

This document outlines the data collection and security practices for Digital Invitation app, as required by Google Play Store's Data Safety section.

## 📊 Data Collection Overview

### Data Collected: YES
We collect the following types of data:

## 1️⃣ Personal Information

### Account Information
- **Data Type**: Email address, Name
- **Purpose**: Account creation and authentication
- **Collection**: Required
- **Sharing**: Not shared with third parties
- **User Control**: Can be deleted by deleting account

### User-Generated Content
- **Data Type**: Wedding invitation details (names, dates, locations)
- **Purpose**: Service functionality
- **Collection**: Required for core functionality
- **Sharing**: Not shared with third parties
- **User Control**: Can be edited or deleted anytime

### Contact Information
- **Data Type**: Guest names and contact details
- **Purpose**: Guest list management
- **Collection**: Optional (user-provided)
- **Sharing**: Not shared with third parties
- **User Control**: Can be edited or deleted anytime

## 2️⃣ App Activity

### App Interactions
- **Data Type**: User actions, feature usage
- **Purpose**: Analytics and app improvement
- **Collection**: Automatic
- **Sharing**: Not shared with third parties
- **User Control**: Cannot be turned off

### In-app Messages
- **Data Type**: RSVP messages from guests
- **Purpose**: Service functionality
- **Collection**: User-provided
- **Sharing**: Not shared with third parties
- **User Control**: Can be deleted

## 3️⃣ Device Information

### Device ID
- **Data Type**: Device identifiers
- **Purpose**: Security and fraud prevention
- **Collection**: Automatic
- **Sharing**: Not shared with third parties
- **User Control**: Cannot be turned off

### App Performance
- **Data Type**: Crash logs, diagnostics
- **Purpose**: App stability and bug fixes
- **Collection**: Automatic
- **Sharing**: Not shared with third parties
- **User Control**: Cannot be turned off

## 🔒 Security Practices

### Data Encryption

**In Transit**
- ✅ YES - All data is encrypted in transit using HTTPS/TLS
- All API communications use secure HTTPS protocol
- No unencrypted data transmission

**At Rest**
- ✅ YES - Data is encrypted at rest on our servers
- Database encryption enabled
- Secure password hashing (bcrypt)

### Data Deletion

**User Can Request Deletion**
- ✅ YES - Users can request data deletion
- Account deletion removes all personal data
- Process: Settings > Delete Account
- Timeframe: Immediate deletion, backups removed within 30 days

### Data Retention

- Active accounts: Data retained while account is active
- Deleted accounts: Data permanently deleted within 30 days
- Backup retention: Maximum 90 days

## 🎯 Data Usage Purposes

### Account Management
- Creating and maintaining user accounts
- Authentication and authorization
- Password recovery

### Service Functionality
- Creating and managing invitations
- Managing guest lists
- Tracking RSVPs
- Generating statistics

### Analytics
- Understanding app usage patterns
- Improving user experience
- Identifying and fixing bugs
- Performance monitoring

### Security
- Fraud prevention
- Abuse prevention
- Security monitoring
- Compliance with legal obligations

## 🚫 What We DON'T Do

❌ **We DO NOT:**
- Sell user data to third parties
- Share data with advertisers
- Use data for marketing without consent
- Track users across other apps or websites
- Collect data from children under 13
- Access device camera or microphone
- Access device location (unless explicitly needed)
- Access device contacts or photos
- Share data with data brokers

## 👥 Data Sharing

### Third-Party Sharing: NO
We do not share your personal data with third parties for their own purposes.

### Service Providers
We may share data with service providers who help us operate the app:
- **Cloud Hosting**: For data storage and app infrastructure
- **Analytics**: For app performance monitoring (anonymized data)

These providers:
- Are contractually obligated to protect your data
- Can only use data for specified purposes
- Must comply with data protection regulations

## 🌍 Data Location

- **Primary Storage**: [Your server location]
- **Backup Storage**: [Backup location]
- **Data Transfer**: Data may be transferred internationally for service operation

## 👶 Children's Privacy

- **Age Restriction**: 13+
- **Parental Consent**: Not required (app not directed at children)
- **Children's Data**: We do not knowingly collect data from children under 13

## 📱 Permissions Required

### Required Permissions

**INTERNET**
- **Purpose**: Connect to backend API
- **Required**: Yes
- **Explanation**: Essential for app functionality

**ACCESS_NETWORK_STATE**
- **Purpose**: Check network connectivity
- **Required**: Yes
- **Explanation**: To provide offline indicators

### Optional Permissions

None currently required.

## 🔐 User Rights

Users have the right to:

1. **Access**: View all personal data we have
2. **Correction**: Update or correct information
3. **Deletion**: Delete account and all data
4. **Export**: Download personal data
5. **Objection**: Object to data processing
6. **Portability**: Receive data in portable format

To exercise these rights:
- Email: privacy@digitalinvitation.com
- In-app: Settings > Privacy > Data Rights

## 📋 Compliance

We comply with:
- ✅ GDPR (General Data Protection Regulation)
- ✅ CCPA (California Consumer Privacy Act)
- ✅ Google Play Data Safety Requirements
- ✅ Android App Privacy Policy Requirements

## 🔄 Updates to Data Practices

- Users will be notified of significant changes
- Updated privacy policy will be posted in-app
- Continued use constitutes acceptance

## 📞 Contact

For data privacy questions:
- **Email**: privacy@digitalinvitation.com
- **Data Protection Officer**: dpo@digitalinvitation.com
- **Response Time**: Within 30 days

## 📝 Google Play Data Safety Form Answers

### Does your app collect or share user data?
**YES**

### Data Types Collected

**Personal Info**
- [x] Name
- [x] Email address
- [ ] User IDs
- [ ] Address
- [ ] Phone number
- [ ] Race and ethnicity
- [ ] Political or religious beliefs
- [ ] Sexual orientation
- [ ] Other info

**Financial Info**
- [ ] User payment info
- [ ] Purchase history
- [ ] Credit score
- [ ] Other financial info

**Health and Fitness**
- [ ] Health info
- [ ] Fitness info

**Messages**
- [x] Emails
- [x] SMS or MMS
- [x] Other in-app messages

**Photos and Videos**
- [ ] Photos
- [ ] Videos

**Audio Files**
- [ ] Voice or sound recordings
- [ ] Music files
- [ ] Other audio files

**Files and Docs**
- [ ] Files and docs

**Calendar**
- [ ] Calendar events

**Contacts**
- [ ] Contacts

**App Activity**
- [x] App interactions
- [ ] In-app search history
- [ ] Installed apps
- [ ] Other user-generated content
- [ ] Other actions

**Web Browsing**
- [ ] Web browsing history

**App Info and Performance**
- [x] Crash logs
- [x] Diagnostics
- [ ] Other app performance data

**Device or Other IDs**
- [x] Device or other IDs

### Data Usage and Handling

For each data type, specify:
- **Collected**: Yes
- **Shared**: No
- **Processed ephemerally**: No
- **Required or Optional**: Required (for most)
- **Purpose**: [As listed above]

### Security Practices

- [x] Data is encrypted in transit
- [x] Data is encrypted at rest
- [x] Users can request data deletion
- [x] Committed to Google Play Families Policy (if applicable)
- [x] Independent security review completed

### Data Retention and Deletion

- Users can request deletion: **YES**
- Deletion method: In-app settings or email request
- Retention period: Until account deletion + 30 days

---

**Last Updated**: May 6, 2026
**Version**: 1.0.0

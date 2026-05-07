#!/bin/bash

# 🚀 Nikahin Build Script
# Automated build script untuk aplikasi Nikahin

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if EAS CLI is installed
check_eas_cli() {
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI not found!"
        print_info "Installing EAS CLI..."
        npm install -g eas-cli
        print_success "EAS CLI installed"
    else
        print_success "EAS CLI found"
    fi
}

# Check if logged in to Expo
check_expo_login() {
    if ! npx eas whoami &> /dev/null; then
        print_warning "Not logged in to Expo"
        print_info "Please login..."
        npx eas login
    else
        EXPO_USER=$(npx eas whoami)
        print_success "Logged in as: $EXPO_USER"
    fi
}

# Show menu
show_menu() {
    print_header "Nikahin Build Menu"
    echo "1) Build APK (Preview/Testing)"
    echo "2) Build AAB (Production/Play Store)"
    echo "3) Build Both (APK + AAB)"
    echo "4) Check Build Status"
    echo "5) List All Builds"
    echo "6) Configure EAS"
    echo "7) Update Version"
    echo "8) Exit"
    echo ""
    read -p "Select option [1-8]: " choice
}

# Build APK
build_apk() {
    print_header "Building APK (Preview)"
    print_info "This will create an APK file for testing..."
    
    read -p "Clear cache? (y/n): " clear_cache
    
    if [ "$clear_cache" = "y" ]; then
        npx eas build --platform android --profile preview --clear-cache
    else
        npx eas build --platform android --profile preview
    fi
    
    print_success "APK build started!"
    print_info "Check progress at: https://expo.dev"
}

# Build AAB
build_aab() {
    print_header "Building AAB (Production)"
    print_info "This will create an AAB file for Play Store..."
    
    read -p "Clear cache? (y/n): " clear_cache
    
    if [ "$clear_cache" = "y" ]; then
        npx eas build --platform android --profile production --clear-cache
    else
        npx eas build --platform android --profile production
    fi
    
    print_success "AAB build started!"
    print_info "Check progress at: https://expo.dev"
}

# Build both
build_both() {
    print_header "Building Both APK & AAB"
    print_warning "This will take longer..."
    
    print_info "Building APK first..."
    npx eas build --platform android --profile preview
    
    print_info "Building AAB..."
    npx eas build --platform android --profile production
    
    print_success "Both builds started!"
}

# Check build status
check_status() {
    print_header "Recent Builds"
    npx eas build:list --limit 5
}

# List all builds
list_builds() {
    print_header "All Builds"
    npx eas build:list
}

# Configure EAS
configure_eas() {
    print_header "Configuring EAS"
    npx eas build:configure
    print_success "EAS configured!"
}

# Update version
update_version() {
    print_header "Update Version"
    
    # Read current version from app.json
    CURRENT_VERSION=$(grep -o '"version": "[^"]*' app.json | cut -d'"' -f4)
    CURRENT_CODE=$(grep -o '"versionCode": [0-9]*' app.json | grep -o '[0-9]*')
    
    print_info "Current version: $CURRENT_VERSION (code: $CURRENT_CODE)"
    
    read -p "Enter new version (e.g., 1.0.1): " new_version
    read -p "Enter new version code (e.g., 2): " new_code
    
    # Update app.json
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$new_version\"/" app.json
    sed -i "s/\"versionCode\": $CURRENT_CODE/\"versionCode\": $new_code/" app.json
    
    print_success "Version updated to $new_version (code: $new_code)"
}

# Main script
main() {
    clear
    print_header "🎉 Nikahin Build Tool"
    
    # Pre-checks
    print_info "Running pre-checks..."
    check_eas_cli
    check_expo_login
    echo ""
    
    # Show menu
    while true; do
        show_menu
        
        case $choice in
            1)
                build_apk
                ;;
            2)
                build_aab
                ;;
            3)
                build_both
                ;;
            4)
                check_status
                ;;
            5)
                list_builds
                ;;
            6)
                configure_eas
                ;;
            7)
                update_version
                ;;
            8)
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        clear
    done
}

# Run main
main

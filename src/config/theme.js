export const theme = {
  colors: {
    // Primary - Deep Purple (Luxury & Elegance)
    primary: '#6B4CE6',        // Royal Purple
    primaryDark: '#5538D4',    // Darker Purple
    primaryLight: '#8B6FF0',   // Light Purple
    
    // Secondary - Gold (Premium & Luxury)
    secondary: '#FFD700',      // Gold
    accent: '#FFA726',         // Warm Orange Gold
    
    // Neutrals
    background: '#F8F9FD',     // Very Light Blue-Gray
    surface: '#FFFFFF',        // Pure White
    surfaceVariant: '#F5F5F7', // Light Gray
    
    // Text
    text: '#1A1A2E',          // Almost Black
    textSecondary: '#6B7280',  // Medium Gray
    textTertiary: '#9CA3AF',   // Light Gray
    
    // Status Colors
    error: '#EF4444',          // Red
    success: '#10B981',        // Green
    warning: '#F59E0B',        // Amber
    info: '#3B82F6',           // Blue
    
    // UI Elements
    border: '#E5E7EB',         // Light Border
    divider: '#F3F4F6',        // Very Light Divider
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Gradients
    gradient: {
      primary: ['#6B4CE6', '#5538D4'],      // Purple gradient
      secondary: ['#FFD700', '#FFA726'],    // Gold gradient
      premium: ['#6B4CE6', '#8B6FF0', '#FFD700'], // Purple to Gold
      dark: ['#1A1A2E', '#2D2D44'],        // Dark gradient
    },
    
    // Shadows
    shadow: {
      sm: 'rgba(107, 76, 230, 0.1)',
      md: 'rgba(107, 76, 230, 0.15)',
      lg: 'rgba(107, 76, 230, 0.2)',
    },
    
    white: '#FFFFFF',
    black: '#000000',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#6B4CE6',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#6B4CE6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#6B4CE6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#6B4CE6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#6B4CE6',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

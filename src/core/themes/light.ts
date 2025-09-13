/* eslint-disable @typescript-eslint/naming-convention */
// noinspection AllyPlainJsInspection
//
import { Theme } from '@lib/ui/types/Theme';

import { IS_ANDROID } from '../constants';

/**
 * Proposed new color palette for light theme with blue replacing orange and black text
 */
const newNavy = {
  50: '#E3F2FD',
  100: '#BBDEFB',
  200: '#90CAF9',
  300: '#64B5F6',
  400: '#42A5F5',
  500: '#2196F3',
  600: '#1E88E5',
  700: '#1976D2',
  800: '#1565C0',
  900: '#0D47A1',
};

const newBlue = {
  50: '#E3F2FD',
  100: '#BBDEFB',
  200: '#90CAF9',
  300: '#64B5F6',
  400: '#42A5F5',
  500: '#2196F3',
  600: '#1E88E5',
  700: '#1976D2',
  800: '#1565C0',
  900: '#0D47A1',
};

const newGray = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#EEEEEE',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

const newRose = {
  50: '#FCE4EC',
  100: '#F8BBD0',
  200: '#F48FB1',
  300: '#F06292',
  400: '#EC407A',
  500: '#E91E63',
  600: '#D81B60',
  700: '#C2185B',
  800: '#AD1457',
  900: '#880E4F',
};

const newRed = {
  50: '#FEE2E2',
  100: '#FECACA',
  200: '#FCA5A5',
  300: '#F87171',
  400: '#EF4444',
  500: '#DC2626',
  600: '#B91C1C',
  700: '#991B1B',
  800: '#7F1D1D',
  900: '#6B1A1A',
};

const newGreen = {
  50: '#E8F5E9',
  100: '#C8E6C9',
  200: '#A5D6A7',
  300: '#81C784',
  400: '#66BB6A',
  500: '#4CAF50',
  600: '#43A047',
  700: '#388E3C',
  800: '#2E7D32',
  900: '#1B5E20',
};

const newTertiary = {
  50: '#F0FDF4',
  100: '#D1FAE5',
  200: '#BBF7D0',
  300: '#6EE7B7',
  400: '#4ADE80',
  500: '#10B981',
  600: '#16A34A',
  700: '#047857',
  800: '#166534',
  900: '#14532D',
};

const newDarkBlue = {
  50: '#E3F2FD',
  100: '#BBDEFB',
  200: '#90CAF9',
  300: '#64B5F6',
  400: '#42A5F5',
  500: '#2196F3',
  600: '#1E88E5',
  700: '#1976D2',
  800: '#1565C0',
  900: '#0D47A1',
};

const newLightBlue = {
  50: '#E1F5FE',
  100: '#B3E5FC',
  200: '#81D4FA',
  300: '#4FC3F7',
  400: '#29B6F6',
  500: '#03A9F4',
  600: '#039BE5',
  700: '#0288D1',
  800: '#0277BD',
  900: '#01579B',
};

const newViolet = {
  50: '#F3E5F5',
  100: '#E1BEE7',
  200: '#CE93D8',
  300: '#BA68C8',
  400: '#AB47BC',
  500: '#9C27B0',
  600: '#8E24AA',
  700: '#7B1FA2',
  800: '#6A1B9A',
  900: '#4A148C',
};

const newBackgroundColor = '#edf3f7';

const navy = {
  50: '#B7E1FF',
  100: '#9BD6FF',
  200: '#62BFFF',
  300: '#2AA8FF',
  400: '#008EF1',
  500: '#006DB9',
  600: '#004C81',
  700: '#002B49',
  800: '#00223A',
  900: '#00192A',
};

const blue = {
  50: '#E3F2FD',
  100: '#BBDEFB',
  200: '#90CAF9',
  300: '#64B5F6',
  400: '#42A5F5',
  500: '#2196F3',
  600: '#1E88E5',
  700: '#1976D2',
  800: '#1565C0',
  900: '#0D47A1',
};

const orange = {
  50: '#E3F2FD',
  100: '#BBDEFB',
  200: '#90CAF9',
  300: '#64B5F6',
  400: '#42A5F5',
  500: '#2196F3',
  600: '#1E88E5',
  700: '#1976D2',
  800: '#1565C0',
  900: '#0D47A1',
};

const gray = {
  50: '#F9FAFB',
  100: '#F3F5F7',
  200: '#E0E6EB',
  300: '#CBD5DC',
  400: '#91A6B6',
  500: '#5C778A',
  600: '#415462',
  700: '#33424D',
  800: '#1F282E',
  900: '#12181C',
};

const rose = {
  50: '#FFF1F2',
  100: '#FFE4E6',
  200: '#FECDD3',
  300: '#FDA4AF',
  400: '#FB7185',
  500: '#F43F5E',
  600: '#E11D48',
  700: '#BE123C',
  800: '#9F1239',
  900: '#881337',
};

const red = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
};

const green = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
};

const tertiary = {
  50: '#F0FDF4',
  100: '#D1FAE5',
  200: '#BBF7D0',
  300: '#6EE7B7',
  400: '#4ADE80',
  500: '#10B981',
  600: '#16A34A',
  700: '#047857',
  800: '#166534',
  900: '#14532D',
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    touchableHighlight: 'rgba(0, 0, 0, .08)',
    background: newBackgroundColor,
    surface: '#FFFFFF',
    surfaceDark: newNavy[700],
    white: '#FFFFFF',
    headersBackground: IS_ANDROID ? '#FFFFFF' : '#EDEEF0',
    heading: '#000000',
    subHeading: newLightBlue[700],
    title: '#000000',
    prose: '#000000',
    disableTitle: '#000000',
    longProse: '#000000',
    secondaryText: newGray[500],
    caption: newGray[500],
    link: newNavy[500],
    divider: newGray[300],
    tabBar: newNavy[200],
    translucentSurface: 'rgba(0, 0, 0, .1)',
    tabBarInactive: newGray[500],
    bookingCardBorder: newGreen[600],
    deadlineCardBorder: newRed[700],
    examCardBorder: newBlue[600],
    lectureCardSecondary: newGray[600],
    errorCardText: newRose[700],
    errorCardBorder: newRose[500],
    black: '#000000',
    yellow: '#FFD700',
    readMore: newNavy[400],
  },
  palettes: {
    navy: newNavy,
    blue: newBlue,
    orange: newBlue,
    gray: newGray,
    rose: newRose,
    red: newRed,
    green: newGreen,
    darkBlue: newDarkBlue,
    lightBlue: newLightBlue,
    violet: newViolet,
    text: newGray,
    primary: newNavy,
    secondary: newBlue,
    danger: newRose,
    error: newRed,
    success: newGreen,
    warning: newBlue,
    muted: newGray,
    info: newLightBlue,
    tertiary: newTertiary,
  },
  fontFamilies: {
    heading: 'Montserrat',
    body: 'Montserrat',
  },
  fontSizes: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  shapes: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
  },
  spacing: {
    [0]: 0,
    [0.5]: 2,
    [1]: 4,
    [1.5]: 6,
    [2]: 8,
    [2.5]: 10,
    [3]: 12,
    [3.5]: 14,
    [4]: 16,
    [5]: 18,
    [6]: 24,
    [7]: 28,
    [8]: 32,
    [9]: 36,
    [10]: 40,
    [12]: 48,
    [16]: 64,
    [20]: 80,
    [24]: 96,
    [32]: 128,
    [40]: 160,
    [48]: 192,
    [56]: 224,
    [64]: 256,
    [72]: 288,
    [80]: 320,
    [96]: 384,
  },
  safeAreaInsets: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

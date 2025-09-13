// noinspection AllyPlainJsInspection
//
import { Platform } from 'react-native';

import { Theme } from '@lib/ui/types/Theme';

import { lightTheme } from './light';

/**
 * Proposed new color palette for dark theme
 */
const newNavy = {
  50: '#0D47A1',
  100: '#1565C0',
  200: '#1976D2',
  300: '#1E88E5',
  400: '#2196F3',
  500: '#42A5F5',
  600: '#64B5F6',
  700: '#90CAF9',
  800: '#BBDEFB',
  900: '#E3F2FD',
};

const newOrange = {
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
  50: '#E65100',
  100: '#EF6C00',
  200: '#F57C00',
  300: '#FB8C00',
  400: '#FF9800',
  500: '#FFA726',
  600: '#FFB74D',
  700: '#FFCC80',
  800: '#FFE0B2',
  900: '#FFF3E0',
};

const newGray = {
  50: '#212121',
  100: '#424242',
  200: '#616161',
  300: '#757575',
  400: '#9E9E9E',
  500: '#BDBDBD',
  600: '#E0E0E0',
  700: '#EEEEEE',
  800: '#F5F5F5',
  900: '#FAFAFA',
};

const newRose = {
  50: '#880E4F',
  100: '#AD1457',
  200: '#C2185B',
  300: '#D81B60',
  400: '#E91E63',
  500: '#EC407A',
  600: '#F06292',
  700: '#F48FB1',
  800: '#F8BBD0',
  900: '#FCE4EC',
};

const newGreen = {
  50: '#1B5E20',
  100: '#2E7D32',
  200: '#388E3C',
  300: '#43A047',
  400: '#4CAF50',
  500: '#66BB6A',
  600: '#81C784',
  700: '#A5D6A7',
  800: '#C8E6C9',
  900: '#E8F5E9',
};

const newLightBlue = {
  50: '#01579B',
  100: '#0277BD',
  200: '#0288D1',
  300: '#039BE5',
  400: '#03A9F4',
  500: '#29B6F6',
  600: '#4FC3F7',
  700: '#81D4FA',
  800: '#B3E5FC',
  900: '#E1F5FE',
};

const newViolet = {
  50: '#4A148C',
  100: '#6A1B9A',
  200: '#7B1FA2',
  300: '#8E24AA',
  400: '#9C27B0',
  500: '#AB47BC',
  600: '#BA68C8',
  700: '#CE93D8',
  800: '#E1BEE7',
  900: '#F3E5F5',
};

const newBackgroundColor = '#121212';

export const darkTheme: Theme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    background: newBackgroundColor,
    surface: '#1E1E1E',
    surfaceDark: newNavy[700],
    headersBackground: '#121212',
    heading: newNavy[100],
    subHeading: newLightBlue[300],
    title: 'white',
    prose: newGray[100],
    disableTitle: newGray[700],
    longProse: newGray[100],
    secondaryText: newGray[400],
    caption: newGray[500],
    link: newNavy[300],
    translucentSurface: Platform.select({
      android: 'rgba(255, 255, 255, .1)',
      ios: 'rgba(0, 0, 0, .1)',
    })!,
    divider: newGray[500],
    touchableHighlight: 'rgba(255, 255, 255, .08)',
    lectureCardSecondary: newGray[300],
    tabBarInactive: newGray[400],
    errorCardText: newRose[200],
    errorCardBorder: newRose[500],
    readMore: newNavy[500],
  },
  palettes: {
    navy: newNavy,
    orange: newOrange,
    gray: newGray,
    rose: newRose,
    green: newGreen,
    lightBlue: newLightBlue,
    violet: newViolet,
    text: newGray,
    primary: newNavy,
    secondary: newOrange,
    danger: newRose,
    error: newRose,
    success: newGreen,
    warning: newOrange,
    muted: newGray,
    info: newLightBlue,
    tertiary: newGreen,
  },
};

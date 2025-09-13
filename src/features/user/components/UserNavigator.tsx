import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { SharedScreens } from '../../../shared/navigation/SharedScreens';
import { DegreeTopTabsNavigator } from '../../offering/navigation/DegreeTopTabsNavigator';
import { OfferingStackParamList } from '../../services/components/ServicesNavigator';
import { AccessibilitySettingsScreen } from '../screens/AccessibilityFontSettingsScreen.tsx';
import { MessageScreen } from '../screens/MessageScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RequestESCScreen } from '../screens/RequestESCScreen.tsx';
import { SettingsScreen } from '../screens/SettingsScreen';

export type UserStackParamList = OfferingStackParamList & {
  Profile: { firstRequest?: boolean };
  Settings: undefined;
  Messages: undefined;
  RequestESC: undefined;
  Message: {
    id: number;
  };
  MessagesModal: undefined;
  Notifications: undefined;
  Person: { id: number };
};
const Stack = createNativeStackNavigator<UserStackParamList>();

export const UserNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
      screenOptions={{
        headerLargeTitle: false,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        headerBlurEffect: 'systemUltraThinMaterial',
        ...useTitlesStyles(theme),
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ firstRequest: false }}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('profileScreen.title'),
        }}
      />
      <Stack.Screen
        name="RequestESC"
        component={RequestESCScreen}
        options={{
          headerTitle: t('escRequestScreen.title'),
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerTitle: t('notificationsScreen.title'),
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: t('settingsScreen.title'),
        }}
      />
      <Stack.Screen
        name="AccessibilitySettings"
        component={AccessibilitySettingsScreen}
        options={{
          headerTitle: t('accessibilitySettingsScreen.fontSettingsTitle'),
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          headerTitle: t('messagesScreen.title'),
        }}
      />
      <Stack.Screen
        name="Message"
        component={MessageScreen}
        getId={({ params }) => `${params.id}`}
        options={{
          headerTitle: t('messageScreen.title'),
          headerBackTitle: t('messageScreen.backTitle'),
        }}
      />
      <Stack.Screen
        name="Degree"
        component={DegreeTopTabsNavigator}
        getId={({ params: { id, year } }) => id + (year ?? '0')}
        options={{
          headerTitle: t('degreeScreen.title'),
          headerLargeTitle: false,
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          headerLargeStyle: {
            backgroundColor: colors.headersBackground,
          },
        }}
      />
      {SharedScreens()}
    </Stack.Navigator>
  );
};

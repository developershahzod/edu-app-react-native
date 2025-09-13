import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Keyboard,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import uuid from 'react-native-uuid';

import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { IconButton } from '@lib/ui/components/IconButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { usePreferencesContext } from '../contexts/PreferencesContext';
import { UnsupportedUserTypeError } from '../errors/UnsupportedUserTypeError';
import { useDeviceLanguage } from '../hooks/useDeviceLanguage';
import { WebviewType, useOpenInAppLink } from '../hooks/useOpenInAppLink';
import { useLogin } from '../queries/authHooks';
import { rest } from 'lodash';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParamList } from '../types/navigation';
import { setCredentials } from '~/utils/keychain';

type LoginScreenRouteProp = RouteProp<
  { Login: { uid: string; key: string } },
  'Login'
>;

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { updatePreference, loginUid } = usePreferencesContext();
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { mutateAsync: login, isPending: isLoading } = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const canLogin = username?.length && password?.length;
  const language = useDeviceLanguage();
  const route = useRoute<LoginScreenRouteProp>();
  const { key } = route.params || {};
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList, any>>();

  const handleLoginError = useCallback(
    async (e: Error) => {
      if (e instanceof UnsupportedUserTypeError) {
        Alert.alert(t('common.error'), t('loginScreen.unsupportedUserType'));
      } else {
        Alert.alert(
          t('loginScreen.authnError'),
          t('loginScreen.authnErrorDescription'),
        );
      }
    },
    [t],
  );

  const sessionOpener = useOpenInAppLink(WebviewType.LOGIN);

  const handleLogin = async () => {
    try {
      const data = await login({
        username,
        password,
      });


      // Navigate to main app screen after successful login
    } catch (error) {
      await handleLoginError(error as Error);
      // Do not navigate to Root on login failure, stay on login screen
    }
  };

  useEffect(() => {
    if (loginUid && key) {
      login({
        uid: loginUid,
        key,
        preferences: { language },
        loginType: 'sso',
      }).catch(handleLoginError);
      updatePreference('loginUid', undefined);
    }
  }, [loginUid, key, login, language, updatePreference, handleLoginError]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Section style={styles.section}>
          <ScreenTitle title={t('loginScreen.title')} style={styles.title} />
          <OverviewList style={styles.sectionList} accessible={false}>
            <TextField
              accessible={true}
              textContentType="username"
              label={t('loginScreen.usernameLabel')}
              value={username}
              accessibilityLabel={t('loginScreen.usernameLabelAccessibility')}
              onChangeText={text => setUsername(text.trim())}
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordRef.current?.focus();
              }}
              style={styles.textFieldInput}
            />
            <Row align="center">
              <TextField
                accessible={true}
                inputRef={passwordRef}
                textContentType="password"
                type="password"
                label={t('loginScreen.passwordLabel')}
                accessibilityLabel={t('loginScreen.passwordLabelAccessibility')}
                onChangeText={setPassword}
                value={password}
                returnKeyType="done"
                secureTextEntry={!passwordVisible}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  if (canLogin) {
                    handleLogin();
                  }
                }}
                editable={!isLoading}
                style={styles.textFieldInput}
              />
              <IconButton
                size={fontSizes.xl}
                icon={passwordVisible ? faEyeSlash : faEye}
                accessibilityLabel={t(
                  passwordVisible
                    ? 'loginScreen.hidePassword'
                    : 'loginScreen.showPassword',
                )}
                color={colors.secondaryText}
                style={styles.passwordToggle}
                onPress={() => setPasswordVisible(old => !old)}
              />
            </Row>
          </OverviewList>
          <CtaButton
            absolute={false}
            title={t('loginScreen.cta')}
            action={handleLogin}
            loading={isLoading}
            disabled={!canLogin}
          />
          {/* <TouchableOpacity
            style={styles.link}
            onPress={() => {
              Linking.openURL(
                'https://idp.polito.it/Chpass/chpassservlet/main.htm?p_reset=Y',
              );
            }}
          >
            <Text variant="link">{t('loginScreen.forgotYourPassword')}</Text>
          </TouchableOpacity> */}
        </Section>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    section: {
      marginTop: spacing[32],
    },
    sectionList: {
      paddingBottom: Platform.select({ android: spacing[4] }),
    },
    title: {
      fontSize: fontSizes['3xl'],
      marginBottom: spacing[3],
      marginHorizontal: spacing[5],
    },
    textFieldInput: {
      flex: 1,
      paddingHorizontal: Platform.select({
        android: spacing[4],
      }),
    },
    link: {
      alignItems: 'flex-end',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      marginVertical: spacing[8],
    },
    passwordToggle: {
      marginRight: spacing[2],
    },
  });

import { Alert, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import uuid from 'react-native-uuid';

import { AuthApi, LoginRequest, SwitchCareerRequest, AppInfoRequest } from '../../lib/api-client';
import { getApp } from '@react-native-firebase/app';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { t } from 'i18next';

import { isEnvProduction } from '../../utils/env';
import {
  getCredentials,
  resetCredentials,
  setCredentials,
} from '../../utils/keychain';
import { pluckData } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { UnsupportedUserTypeError } from '../errors/UnsupportedUserTypeError';
import { asyncStoragePersister } from '../providers/ApiProvider';

export const WEBMAIL_LINK_QUERY_KEY = ['webmailLink'];

const useAuthClient = (): AuthApi => {
  return new AuthApi();
};

export async function getFcmToken(
  catchException: boolean = true,
): Promise<string | undefined> {
  if (!isEnvProduction) return undefined;

  try {
    return await getApp().messaging().getToken();
  } catch (e) {
    if (!catchException) {
      throw e;
    }
    Alert.alert(t('common.error'), t('loginScreen.fcmUnsupported'));
  }

  return undefined;
}

export const getClientId = async (): Promise<string> => {
  try {
    const credentials = await getCredentials();
    if (credentials && credentials.username) {
      return credentials.username;
    }
  } catch (e) {
    console.warn("Keychain couldn't be accessed!", e);
  }
  const clientId = uuid.v4();
  await setCredentials(clientId);
  return clientId;
};

export const useLogin = () => {
  const authClient = useAuthClient();
  const { refreshContext } = useApiContext();
  const { updatePreference } = usePreferencesContext();

  return useMutation({
    mutationFn: async (dto: LoginRequest) => {
      // Remove device, client, preferences from dto as they are not part of LoginRequest
      const loginDto: LoginRequest = {
        username: dto.username,
        password: dto.password,
        grant_type: dto.grant_type,
        scope: dto.scope,
        client_id: dto.client_id,
        client_secret: dto.client_secret,
      };

      const token = await authClient.login(loginDto);

             

      // Optionally, fetch user info here if needed to get user type and username
      // For now, just return the token
      return token;
    },
    onSuccess: async data => {
      const { access_token } = data;
      // Store token and update context as needed
      await setCredentials(access_token);
      // Assuming username is part of token or fetched separately, here we just update preference with username placeholder
      const username = 'user'; // TODO: fetch actual username if needed
      updatePreference('username', username);
      refreshContext({ username, token: access_token });

      
    },
    onError: (error: Error) => {
      // You can add error handling logic here if needed
    },
  });
};

// Commenting out hooks using missing AuthApi methods to avoid errors

/*
export const useSwitchCareer = () => {
  const authClient = useAuthClient();
  const { refreshContext } = useApiContext();
  const { updatePreference } = usePreferencesContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto?: SwitchCareerRequest) =>
      authClient.switchCareer({ switchCareerRequest: dto }).then(pluckData),
    onSuccess: async data => {
      const { token, username, clientId } = data;
      refreshContext({ token, username });
      asyncStoragePersister.removeClient();
      queryClient.invalidateQueries();

      await setCredentials(clientId, token);
      updatePreference('username', username);
    },
  });
};

export const useUpdateAppInfo = () => {
  const authClient = useAuthClient();

  return useMutation({
    mutationFn: async (fcmToken: string | void | null) => {
      return Promise.all([
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getVersion(),
        fcmToken === null ? undefined : fcmToken || getFcmToken(),
      ]).then(([buildNumber, appVersion, fcmRegistrationToken]) => {
        const dto: AppInfoRequest = {
          buildNumber,
          appVersion,
          fcmRegistrationToken,
        };
        return authClient.appInfo({
          appInfoRequest: dto,
        });
      });
    },
  });
};

export const GetWebmailLink = async () => {
  const authClient = useAuthClient();

  return authClient.getMailLink().then(pluckData);
};
*/

export const useLogout = () => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const { refreshContext } = useApiContext();

  return useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: async () => {
      refreshContext();
      asyncStoragePersister.removeClient();
      queryClient.removeQueries();
      await resetCredentials();
    },
  });
};

/* Removed hooks useSwitchCareer, useUpdateAppInfo, and GetWebmailLink due to missing AuthApi methods */

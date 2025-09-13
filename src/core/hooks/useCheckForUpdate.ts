import { useEffect, useState } from 'react';
import { checkVersion } from 'react-native-check-version';

import { GITHUB_URL } from '../constants.ts';
import { useSplashContext } from '../contexts/SplashContext.ts';
import { getFcmToken } from '../queries/authHooks.ts';

type UpdateInfo = {
  needsUpdate?: boolean;
  version?: string;
  url?: string;
  hasMessaging?: boolean;
  source?: 'store' | 'github';
};
export const useCheckForUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({});
  const { isSplashLoaded } = useSplashContext();

  useEffect(() => {
    if (!isSplashLoaded) return;
    async function getLatestVersion() {
      try {
        let token: string | void | null = null;
        try {
          token = await getFcmToken(false);
        } catch (_) {
          // Ignore error
        }
      
        setUpdateInfo({
          needsUpdate: checkVersionResponse.needsUpdate,
          version: checkVersionResponse.version,
          url: token ? checkVersionResponse.url : GITHUB_URL,
          source: token ? 'store' : 'github',
          hasMessaging: !!token,
        });
      } catch (e) {
        console.warn('Error while checking for updates', e);
        setUpdateInfo(prev => ({
          ...prev,
          needsUpdate: false,
        }));
      }
    }
    getLatestVersion();
  }, [isSplashLoaded]);

  return updateInfo;
};

import { API_BASE_PATH } from '@env';
import { BASE_PATH, setGlobalConfiguration } from '../lib/api-client';

/**
 * Updates the global API configuration used by all clients
 */
export const updateGlobalApiConfiguration = ({
  /**
   * Bearer token
   */
  token,
  /**
   * Preferred language
   */
  language = 'en',
}: {
  token?: string;
  language?: string;
}) => {
  const basePath = API_BASE_PATH ?? BASE_PATH;
  console.debug(`Expecting a running API at ${basePath}`);

  // Ensure language header is always applied to bypass device HTTP cache
  const headers: Record<string, string> = {
    'Accept-Language': language,
  };

  setGlobalConfiguration({
    basePath,
    accessToken: token,
    headers,
  });
};

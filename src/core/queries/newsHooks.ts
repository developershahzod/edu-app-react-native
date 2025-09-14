import { NewsApi } from '../../lib/api-client';
import { useQuery } from '@tanstack/react-query';

import { pluckData } from '../../utils/queries';

export const NEWS_ITEM_QUERY_PREFIX = 'news';
export const NEWS_QUERY_KEY = [NEWS_ITEM_QUERY_PREFIX];

const useNewsClient = (): NewsApi => {
  return new NewsApi();
};

export const useGetNews = () => {
  const newsClient = useNewsClient();

  return useQuery({
    queryKey: NEWS_QUERY_KEY,
    queryFn: async () => {
      const data: any[] = await newsClient.getNews().then(pluckData);
      return (data ?? []).map((n: any) => {
        const createdAt =
          n.createdAt ??
          n.publishDate ??
          n.published_at ??
          n.created_at ??
          undefined;
        return {
          ...n,
          // Fields expected by UI
          shortDescription: n.shortDescription ?? n.summary ?? n.description ?? '',
          createdAt: createdAt ? new Date(createdAt) : undefined,
        };
      });
    },
  });
};

export const useGetNewsItem = (newsItemId: number) => {
  const newsClient = useNewsClient();

  return useQuery({
    queryKey: [NEWS_ITEM_QUERY_PREFIX, newsItemId],
    queryFn: async () => {
      const n: any = await newsClient.getNewsItem({ newsId: newsItemId }).then(pluckData);

      const createdAt =
        n.createdAt ??
        n.publishDate ??
        n.published_at ??
        n.created_at ??
        undefined;

      // Normalize fields expected by NewsItemScreen
      return {
        ...n,
        title: n.title ?? n.name ?? '',
        createdAt: createdAt ? new Date(createdAt) : undefined,
        eventStartTime: n.eventStartTime ?? n.starts_at ?? n.start_date ?? n.start,
        htmlContent: n.htmlContent ?? n.content ?? n.description ?? '',
        extras:
          n.extras ??
          n.attachments?.map((a: any) => ({
            type: a.type ?? (a.url ? 'link' : 'file'),
            url: a.url ?? a.file_url,
            description: a.description ?? a.filename ?? 'Attachment',
          })) ??
          [],
      };
    },
  });
};

import { CalendarApi, CalendarEvent } from '../../lib/api-client/apis/CalendarApi';
import { useQuery } from '@tanstack/react-query';
import { pluckData } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';

export const MY_EVENTS_QUERY_KEY = ['myEvents'];

const useCalendarClient = (): CalendarApi => {
  return new CalendarApi();
};

export const useGetMyEvents = () => {
  const { token } = useApiContext();

  return useQuery({
    queryKey: ['my-events'],
    queryFn: async () => {
      const res = await fetch('https://edu-api.qalb.uz/api/v1/calendar/my-events', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }

      return res.json();
    },
  });
};
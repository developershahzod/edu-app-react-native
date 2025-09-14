import { CalendarApi, CalendarEvent } from '../../lib/api-client/apis/CalendarApi';
import { useQuery } from '@tanstack/react-query';
import { pluckData } from '../../utils/queries';

export const MY_EVENTS_QUERY_KEY = ['myEvents'];

const useCalendarClient = (): CalendarApi => {
  return new CalendarApi();
};

export const useGetMyEvents = () => {
  const calendarClient = useCalendarClient();

  // Define date range: from 1 year ago to 1 year in the future
  const fromDate = new Date();
  fromDate.setFullYear(fromDate.getFullYear() - 1);
  const toDate = new Date();
  toDate.setFullYear(toDate.getFullYear() + 1);

  return useQuery({
    queryKey: MY_EVENTS_QUERY_KEY,
    queryFn: async () => {
      const response = await calendarClient.getMyEvents({
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
      });
      const data: CalendarEvent[] = pluckData(response);
      return data.map((event) => {
        // Normalize date fields
        const start =
          event.starts_at ??
          event.start_date ??
          event.start ??
          undefined;
        const end =
          event.ends_at ??
          event.end_date ??
          event.end ??
          undefined;

        return {
          ...event,
          start,
          end,
        };
      });
    },
  });
};
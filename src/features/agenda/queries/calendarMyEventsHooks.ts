import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { DateTime, IANAZone, Interval } from 'luxon';

import { CalendarApi, ApiResponse } from '../../../lib/api-client';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { dateFormatter } from '../../../utils/dates';
import { AgendaDay } from '../types/AgendaDay';
import { AgendaWeek } from '../types/AgendaWeek';
import { AgendaItem, BookingItem, DeadlineItem, ExamItem, LectureItem } from '../types/AgendaItem';

export const AGENDA_CAL_QUERY_PREFIX = 'agenda_calendar';

const timeOptions = { zone: IANAZone.create('Europe/Rome') };
const formatHHmm = dateFormatter('HH:mm');

/**
 * Maps a generic backend calendar event into one of our AgendaItem flavors
 */
function mapCalendarEventToAgendaItem(evt: any): AgendaItem | null {
  const startsISO: string | undefined =
    evt?.starts_at ?? evt?.start_date ?? evt?.start;
  const endsISO: string | undefined =
    evt?.ends_at ?? evt?.end_date ?? evt?.end ?? startsISO;

  if (!startsISO) return null;

  const startDT = DateTime.fromISO(startsISO, timeOptions);
  const endDT = endsISO ? DateTime.fromISO(endsISO, timeOptions) : startDT;

  const date = startDT.toFormat('y-MM-dd');
  const startTimestamp = startDT.toJSDate().valueOf();

  const common = {
    id: String(evt.id ?? `${date}-${evt.title ?? 'event'}`),
    key: (evt.type ? `${evt.type}-` : 'event-') + String(evt.id ?? startTimestamp),
    date,
    start: startDT,
    end: endDT,
    startTimestamp,
    fromTime: formatHHmm(startDT.toJSDate()),
    toTime: formatHHmm(endDT.toJSDate()),
    title: evt.title ?? evt.course_name ?? 'Event',
  };

  const lowerType = String(evt.type ?? '').toLowerCase();

  if (lowerType === 'exam') {
    const examItem: ExamItem = {
      ...common,
      type: 'exam',
      isTimeToBeDefined: false,
      places: evt.place ? [evt.place] : [],
      teacherId: evt.teacher_id,
    };
    return examItem;
  }

  if (lowerType === 'booking') {
    const bookingItem: BookingItem = {
      ...common,
      type: 'booking',
    };
    return bookingItem;
  }

  if (lowerType === 'deadline') {
    const dItem: DeadlineItem = {
      ...common,
      type: 'deadline',
      url: evt.url,
    };
    return dItem;
  }

  // Default: lecture/lesson/other
  const lectureItem: LectureItem = {
    ...common,
    type: 'lecture',
    courseId: evt.course_id ?? evt.courseId,
    place: evt.place,
    teacherId: evt.teacher_id,
    virtualClassrooms: [],
    description: evt.description,
    uniqueShortcode: undefined,
  };
  return lectureItem;
}

function groupItemsByDay(items: AgendaItem[], includesToday: boolean): AgendaDay[] {
  const today = DateTime.now().setZone('Europe/Rome').startOf('day');
  const todayString = today.toFormat('y-MM-dd');

  const daysMap = new Map<string, AgendaDay>();
  for (const item of items) {
    const day = daysMap.get(item.date) ?? {
      key: item.date,
      date: DateTime.fromSQL(item.date),
      isToday: item.date === todayString,
      items: [],
    };
    day.items.push(item);
    daysMap.set(item.date, day);
  }

  if (includesToday && !daysMap.has(todayString)) {
    daysMap.set(todayString, {
      key: todayString,
      date: today,
      isToday: true,
      items: [],
    });
  }

  // Sort items within the day by time
  const result: AgendaDay[] = [];
  for (const [_, day] of daysMap) {
    day.items.sort((a, b) => a.startTimestamp - b.startTimestamp);
    result.push(day);
  }
  // Sort days by key
  return result.sort((a, b) => a.key.localeCompare(b.key));
}

function getWeekKey(prefix: string, startDate: DateTime) {
  return [prefix, startDate.toISODate()];
}

async function fetchWeek(calendarApi: CalendarApi, monday: DateTime): Promise<AgendaWeek> {
  const until = monday.plus({ week: 1 });
  const res = (await calendarApi.getMyEvents({
    fromDate: monday.toISO()!,
    toDate: until.toISO()!,
  })) as ApiResponse<any[]>;

  const items: AgendaItem[] = [];
  for (const evt of res?.data ?? []) {
    const mapped = mapCalendarEventToAgendaItem(evt);
    if (mapped) items.push(mapped);
  }

  const days = groupItemsByDay(items, monday.equals(DateTime.now().startOf('week')));

  return {
    key: monday.toSQLDate()!,
    dateRange: Interval.fromDateTimes(monday, until),
    data: days,
  };
}

/**
 * Single week agenda from /calendar/my-events
 */
export function useGetAgendaWeekFromCalendar(monday: DateTime = DateTime.now().startOf('week')) {
  const calendarApi = useMemo(() => new CalendarApi(), []);
  return useQuery<AgendaWeek>({
    queryKey: getWeekKey(AGENDA_CAL_QUERY_PREFIX, monday),
    queryFn: () => fetchWeek(calendarApi, monday),
    staleTime: 300000,
    networkMode: 'always',
  });
}

/**
 * Multiple weeks agenda from /calendar/my-events
 */
export function useGetAgendaWeeksFromCalendar(mondays: DateTime[]) {
  const calendarApi = useMemo(() => new CalendarApi(), []);

  const queries = useQueries({
    queries: mondays.map(monday => ({
      queryKey: getWeekKey(AGENDA_CAL_QUERY_PREFIX, monday),
      queryFn: () => fetchWeek(calendarApi, monday),
      staleTime: 300000,
    })),
  });

  const isLoading = useMemo(() => {
    if (!mondays?.length) return true;
    return queries.some(q => q.isLoading);
  }, [mondays, queries]);

  return {
    isLoading,
    data: queries.filter(q => q.data).map(q => q.data as AgendaWeek),
  };
}
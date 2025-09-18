// AgendaWeekScreen.tsx (redesigned with Event Detail Modal)
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ScrollView, Dimensions, FlatList, Modal, Pressable } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { faCalendarDay, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { Tabs } from '@lib/ui/components/Tabs';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView, NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime, IANAZone } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { AgendaStackParamList } from '../components/AgendaNavigator';
import { AgendaTypeFilter } from '../components/AgendaTypeFilter';
import { AGENDA_CAL_QUERY_PREFIX } from '../queries/calendarMyEventsHooks';
import { AgendaOption } from '../types/AgendaOption';
import { useGetMyEvents } from '~/core/queries/calendarHooks.ts';

type Props = NativeStackScreenProps<AgendaStackParamList, 'AgendaWeek'>;

interface ProcessedEvent {
  id: string;
  title: string;
  description: string;
  start: DateTime;
  end: DateTime;
  color: string;
  allDay: boolean;
  course?: { id: string; title: string } | null;
}

const { width: screenWidth } = Dimensions.get('window');
const DAY_COLUMN_MIN = Math.max(screenWidth / 7, 120);

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

// ---- Event Card ----
const EventCard = ({ event, compact, onPress }: { event: ProcessedEvent; compact?: boolean; onPress?: () => void }) => {
  const { palettes } = useTheme();

  const durationMillis = event.end.toMillis() - event.start.toMillis();
  const hours = Math.round(durationMillis / (1000 * 60 * 60));

  const typeBackground = useMemo(() => {
    const title = event.course?.title?.toLowerCase() ?? '';
    if (title.includes('program')) return { bg: '#f0f9ff', border: '#0ea5e9' };
    if (title.includes('web')) return { bg: '#f0fdf4', border: '#22c55e' };
    if (title.includes('database')) return { bg: '#fef3c7', border: '#f59e0b' };
    if (title.includes('design')) return { bg: '#fdf2f8', border: '#ec4899' };
    return { bg: '#ffffff', border: event.color || '#3b82f6' };
  }, [event.course, event.color]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[localStyles.eventCard, { backgroundColor: typeBackground.bg, borderLeftColor: typeBackground.border }, compact && localStyles.eventCardCompact]}
    >
      <View style={localStyles.eventTopRow}>
        <Text numberOfLines={2} style={[localStyles.eventTitle, compact ? localStyles.eventTitleCompact : {}]}>
          {event.title}
        </Text>
        <View style={[localStyles.statusDot, { backgroundColor: event.color }]} />
      </View>

      {!compact && event.course?.title ? (
        <View style={localStyles.courseLine}>
          <View style={localStyles.coursePill}>
            <Text style={localStyles.courseText} numberOfLines={1}>{event.course.title}</Text>
          </View>
          <Text style={localStyles.metaText}>{event.allDay ? 'All day' : `${event.start.toFormat('HH:mm')} — ${event.end.toFormat('HH:mm')}`}</Text>
        </View>
      ) : (
        <Text style={localStyles.metaTextCompact}>{event.allDay ? 'All day' : event.start.toFormat('HH:mm')}</Text>
      )}

      {event.description ? <Text numberOfLines={compact ? 1 : 3} style={localStyles.description}>{event.description}</Text> : null}

      <View style={localStyles.eventFooter}>
        <Text style={localStyles.durationText}>{hours <= 0 ? '<1h' : `${hours}h`}</Text>
        <Text style={localStyles.whenText}>{event.start.toFormat('MMM d')}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ---- Day Column ----
const DayColumn = ({ date, events, isToday, onEventPress }: { date: DateTime; events: ProcessedEvent[]; isToday: boolean; onEventPress: (ev: ProcessedEvent) => void }) => {
  const { colors } = useTheme();
  const isWeekend = date.weekday === 6 || date.weekday === 7;

  return (
    <View style={[localStyles.dayColumn, isToday && { borderColor: colors.primary, borderWidth: 1.5 }, isWeekend && { backgroundColor: colors.surfaceVariant }]}>
      <View style={localStyles.dayHeaderCompact}>
        <Text style={[localStyles.dayNameCompact, isToday && { color: colors.primary }]}>{date.toFormat('ccc')}</Text>
        <View style={localStyles.dayNumberWrap}>
          <Text style={[localStyles.dayNumberCompact, isToday && { color: colors.primary, fontWeight: '800' }]}>{date.toFormat('d')}</Text>
          {isToday && <View style={[localStyles.todayDot, { backgroundColor: colors.primary }]} />}
        </View>
      </View>

      {events.length === 0 ? (
        <View style={localStyles.emptyDayCenter}>
          <Text style={localStyles.emptyText}>{isToday ? 'Clear schedule' : 'No events'}</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(it) => it.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={localStyles.eventsList}
          renderItem={({ item, index }) => (
            <View style={[localStyles.eventWrapper, index === events.length - 1 && { marginBottom: 12 }]}>
              <EventCard event={item} compact={events.length > 4} onPress={() => onEventPress(item)} />
            </View>
          )}
        />
      )}
    </View>
  );
};

// ---- Event Detail Modal ----
const EventDetailModal = ({ event, visible, onClose }: { event: ProcessedEvent | null; visible: boolean; onClose: () => void }) => {
  if (!event) return null;

  return (
    <Modal animationType="none" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>{event.title}</Text>
          {event.course?.title && <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>Course: {event.course.title}</Text>}
          <Text style={{ marginBottom: 6 }}>{event.description}</Text>
          <Text style={{ marginBottom: 6 }}>All Day: {event.allDay ? 'Yes' : 'No'}</Text>
  
       

          <Pressable 
            onPress={onClose} 
            style={{ marginTop: 12, padding: 10, backgroundColor: '#0ea5e9', borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export const AgendaWeekScreen = ({ navigation, route }: Props) => {
  const styles = useStylesheet((t: any) => createStyles(t));
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { updatePreference, agendaScreen, language } = usePreferencesContext();

  const { params } = route;
  const initialDate = params?.date ? DateTime.fromISO(params.date) : DateTime.now();
  const [currentWeek, setCurrentWeek] = useState(() => initialDate.startOf('week'));
  const [selectedDate, setSelectedDate] = useState(() => initialDate);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ProcessedEvent | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: weekData, isLoading: isFetching, refetch, error } = useGetMyEvents();

  // process events
  const processedEvents = useMemo(() => {
    if (!weekData) return [] as ProcessedEvent[];
    const arr: any[] = Array.isArray(weekData) ? weekData : Array.isArray(weekData.data) ? weekData.data : Object.values(weekData).find(Array.isArray) || [];
    return arr.map((ev: any) => {
      const start = DateTime.fromISO(ev.start);
      const end = ev.end ? DateTime.fromISO(ev.end) : (ev.allDay ? start.endOf('day') : start.plus({ hours: 1 }));
      return {
        id: String(ev.id),
        title: ev.title || ev.summary || 'Untitled',
        description: ev.description || ev.extendedProps?.description || '',
        start,
        end,
        color: ev.color || '#3b82f6',
        allDay: !!ev.allDay,
        course: ev.extendedProps ? { id: ev.extendedProps.course_id || '', title: ev.extendedProps.course_title || '' } : null,
      } as ProcessedEvent;
    });
  }, [weekData]);

  const weekDates = useMemo(() => {
    const s = currentWeek.startOf('week');
    return Array.from({ length: 7 }, (_, i) => s.plus({ days: i }));
  }, [currentWeek]);

  const eventsByDay = useMemo(() => {
    const grouped: Record<string, ProcessedEvent[]> = {};
    weekDates.forEach(d => grouped[d.toISODate()] = []);
    processedEvents.forEach(ev => {
      const key = ev.start.toISODate();
      if (grouped[key]) grouped[key].push(ev);
    });
    Object.values(grouped).forEach(list => list.sort((a, b) => a.start.toMillis() - b.start.toMillis()));
    return grouped;
  }, [processedEvents, weekDates]);

  const getNextWeek = useCallback(() => setCurrentWeek(w => w.plus({ days: 7 })), []);
  const getPrevWeek = useCallback(() => setCurrentWeek(w => w.minus({ days: 7 })), []);

  const onSelectDate = useCallback((jsDate: Date) => {
    const dt = DateTime.fromJSDate(jsDate, { zone: IANAZone.create('Asia/Tashkent') });
    setDatePickerOpen(false);
    setCurrentWeek(dt.startOf('week'));
    setSelectedDate(dt);
  }, []);

  const screenOptions = useMemo<AgendaOption[]>(() => [{ id: 'refresh', title: 'Refresh' }], []);

  useLayoutEffect(() => {
    const onPressAction = ({ nativeEvent: { event } }: NativeActionEvent) => {
      if (event === 'refresh') refetch();
      if (event === 'daily') {
        updatePreference('agendaScreen', { ...agendaScreen, layout: 'daily' });
        navigation.replace('Agenda', { date: selectedDate.toISODate() });
      }
    };

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon={faCalendarDay} onPress={() => setDatePickerOpen(true)} />
          <MenuView actions={screenOptions} onPressAction={onPressAction}>
            <IconButton icon={faEllipsisVertical} />
          </MenuView>
        </View>
      ),
    });
  }, [navigation, screenOptions, refetch, updatePreference, agendaScreen, selectedDate]);

  const queryClientRef = useQueryClient();
  const isPrevMissing = useCallback(() => queryClientRef.getQueryData([AGENDA_CAL_QUERY_PREFIX, currentWeek.minus({ weeks: 1 }).toISODate()]) === undefined, [currentWeek, queryClientRef]);
  const isNextMissing = useCallback(() => queryClientRef.getQueryData([AGENDA_CAL_QUERY_PREFIX, currentWeek.plus({ weeks: 1 }).toISODate()]) === undefined, [currentWeek, queryClientRef]);
  const isPrevWeekDisabled = useOfflineDisabled(isPrevMissing);
  const isNextWeekDisabled = useOfflineDisabled(isNextMissing);

  const totalEvents = processedEvents.length;
  const weekEventsCount = Object.values(eventsByDay).flat().length;

  return (
    <View style={styles.container}>
      <HeaderAccessory justify="space-between" style={styles.headerRow}>
    

        <View style={styles.weekControls}>
          <View style={styles.weekLabelWrap}>
            <Text style={styles.weekLabel}>{currentWeek.toFormat('MMM d')}</Text>
            <Text style={styles.weekSubLabel}>{`${weekDates[0].toFormat('d')} — ${weekDates[6].toFormat('d, MMM yyyy')}`}</Text>
          </View>
        </View>
      </HeaderAccessory>

      <DatePicker modal locale={language} date={new Date()} mode="date" open={datePickerOpen} onConfirm={onSelectDate} onCancel={() => setDatePickerOpen(false)} />

      <View style={styles.debugStrip}>
        <Text style={styles.debugText}>Week: {currentWeek.toFormat('DD')} • {totalEvents} total • {weekEventsCount} this week</Text>
        {error && <Text style={styles.debugError}>Error: {String((error as any)?.message || error)}</Text>}
      </View>

      {isFetching ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekScroll}>
          {weekDates.map(d => (
            <View key={d.toISODate()} style={{ minWidth: DAY_COLUMN_MIN }}>
              <DayColumn
                date={d}
                events={eventsByDay[d.toISODate()] || []}
                isToday={d.hasSame(DateTime.now(), 'day')}
                onEventPress={(ev) => {
                  setSelectedEvent(ev);
                  setModalVisible(true);
                }}
              />
            </View>
          ))}
        </ScrollView>
      )}

      {!isFetching && totalEvents === 0 && (
        <View style={styles.emptyState}> 
          <Text style={styles.emptyStateTitle}>No events this week</Text>
          <Text style={styles.emptyStateSubtitle}>{error ? `Error: ${(error as any)?.message}` : 'Try refreshing or choose another week'}</Text>
        </View>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal event={selectedEvent} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
};

// ---- Styles ----
const createStyles = ({ spacing, colors, palettes, fontWeights, fontSizes }: any) => ({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { padding: spacing[2], paddingHorizontal: spacing[3], backgroundColor: colors.surface, borderBottomColor: colors.divider, borderBottomWidth: 1 },
  tabs: { alignItems: 'center' },
  weekControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 },
  weekLabelWrap: { alignItems: 'center', paddingHorizontal: 8 },
  weekLabel: { fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.text },
  weekSubLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  debugStrip: { padding: 10, backgroundColor: palettes.neutral?.[50] ?? '#f8fafc', borderBottomWidth: 1, borderBottomColor: palettes.neutral?.[200] ?? '#e6eef6' },
  debugText: { fontSize: fontSizes.xs, color: palettes.neutral?.[700] ?? '#475569' },
  debugError: { marginTop: 6, color: palettes.danger?.[600] ?? '#ef4444', fontSize: fontSizes.xs },
  loader: { marginTop: 30 },
  weekScroll: { paddingVertical: 12, paddingHorizontal: 6 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyStateTitle: { fontSize: fontSizes.lg, color: colors.textSecondary },
  emptyStateSubtitle: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 6 },
});

// Local (component) styles — cards & columns
const localStyles = StyleSheet.create({
  dayColumn: { minHeight: 420, padding: 10, marginHorizontal: 6, borderRadius: 12, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  dayHeaderCompact: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayNameCompact: { fontSize: 12, textTransform: 'uppercase', color: '#6b7280' },
  dayColumn: {
    minHeight: 420,
    padding: 10,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  dayHeaderCompact: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayNameCompact: { fontSize: 12, textTransform: 'uppercase', color: '#6b7280' },
  dayNumberWrap: { flexDirection: 'row', alignItems: 'center' },
  dayNumberCompact: { fontSize: 18, marginLeft: 6, color: '#111827' },
  todayDot: { width: 8, height: 8, borderRadius: 8, marginLeft: 8 },

  emptyDayCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24,  width: 250, },
  emptyEmoji: { fontSize: 28 },
  emptyText: { color: '#6b7280', marginTop: 8 },

  eventsList: { paddingBottom: 12 },
  eventWrapper: { marginBottom: 8 },

  eventCard: {
    width: 250,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  eventCardCompact: { paddingVertical: 8, paddingHorizontal: 10 },

  eventTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  eventTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  eventTitleCompact: { fontSize: 13 },
  statusDot: { width: 10, height: 10, borderRadius: 6, marginLeft: 8 },

  courseLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  coursePill: { backgroundColor: '#f8fafc', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  courseText: { fontSize: 12, color: '#334155', fontWeight: '600' },
  metaText: { color: '#475569', fontSize: 12 },
  metaTextCompact: { color: '#475569', fontSize: 12, marginBottom: 6 },

  description: { color: '#475569', fontSize: 12, marginBottom: 6 },

  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  durationText: { fontSize: 12, fontWeight: '700', color: '#065f46' },
  whenText: { fontSize: 12, color: '#6b7280' },
});

export default AgendaWeekScreen;

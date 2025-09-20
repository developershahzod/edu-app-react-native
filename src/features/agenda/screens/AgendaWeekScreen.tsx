import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ScrollView, Dimensions, Modal, Pressable } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { faCalendarDay, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { DateTime, IANAZone } from 'luxon';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { AgendaStackParamList } from '../components/AgendaNavigator';
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
  laneIndex?: number;
  lanesCount?: number;
  extendedProps?: {room?: string, type: string, course_id: string, course_title: string};
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const DAY_START_MINUTES = 8 * 60;
const { width: screenWidth } = Dimensions.get('window');
const DAY_COLUMN_WIDTH = Math.max(screenWidth / 7, 120);

function computeLanes(events: ProcessedEvent[]): ProcessedEvent[] {
  const sorted = [...events].sort((a, b) => a.start.toMillis() - b.start.toMillis());
  const lanes: ProcessedEvent[][] = [];
  sorted.forEach(event => {
    let placed = false;
    for (const lane of lanes) {
      const lastEvent = lane[lane.length - 1];
      if (lastEvent.end <= event.start) {
        lane.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([event]);
    }
  });
  return lanes.flatMap((lane, laneIndex) => lane.map(ev => ({ ...ev, laneIndex, lanesCount: lanes.length })));
}

const PositionedEventCard = ({ event, onPress }: { event: ProcessedEvent; onPress?: () => void }) => {
  const startMinutes = Math.max(0, (event.start.hour * 60 + event.start.minute) - DAY_START_MINUTES);
  const endMinutes = Math.max(startMinutes + 40, (event.end.hour * 60 + event.end.minute) - DAY_START_MINUTES);
  const top = startMinutes;
  const height = endMinutes - startMinutes;

  const laneIndex = event.laneIndex ?? 0;
  const lanesCount = event.lanesCount ?? 1;
  const widthPercent = 100 / lanesCount;
  const leftPercent = laneIndex * widthPercent;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[localStyles.positionedEvent, {
        backgroundColor: event.color,
        top,
        height,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
      }]}
    >
      <Text numberOfLines={2} style={localStyles.eventTitle}>{event.title}</Text>
      {!event.allDay && <Text style={localStyles.eventTime}>{event.start.toFormat('HH:mm')} - {event.end.toFormat('HH:mm')}</Text>}
      <Text numberOfLines={2} style={localStyles.eventTitle}>Room: {event?.extendedProps?.room}</Text>
    </TouchableOpacity>
  );
};

const DayColumn = ({ date, events, isToday, onEventPress, showTimeLabels, navigation }: { date: DateTime; events: ProcessedEvent[]; isToday: boolean; onEventPress: (ev: ProcessedEvent) => void; showTimeLabels?: boolean; navigation: any }) => {
  const allDayEvents = events.filter(ev => ev.allDay);
  const filtered = events.filter(ev => ev.start.hour >= 8 && ev.start.hour <= 20);
  const timedEvents = computeLanes(filtered.filter(ev => !ev.allDay));

  return (
    <View style={[localStyles.dayColumn, isToday && localStyles.todayHighlight]}> 
      <View style={localStyles.dayHeaderCompact}>
        <Text style={localStyles.dayNameCompact}>{date.toFormat('ccc')}</Text>
        <Text style={localStyles.dayNumberCompact}>{date.toFormat('d')}</Text>
      </View>

      {allDayEvents.length > 0 ? (
        <View style={localStyles.allDayRow}>
          {allDayEvents.map(ev => (
            <TouchableOpacity key={ev.id} style={[localStyles.allDayEvent, { backgroundColor: ev.color }]} onPress={() =>  onEventPress(ev)}>
              <Text style={localStyles.eventTitle}>{ev.title}</Text>
              <Text style={localStyles.eventTitle}>{ev.room}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : <View style={localStyles.allDayRow} />}

      <View style={{flex: 1, position: 'relative'}}>
        {HOURS.map((h) => (
          <View key={h} style={localStyles.hourRow}>
            {showTimeLabels && <Text style={localStyles.hourLabel}>{h.toString().padStart(2, '0')}:00</Text>}
          </View>
        ))}
        {timedEvents.map(ev => (
          <PositionedEventCard key={ev.id} event={ev} onPress={() => ev.extendedProps?.type == 'schedule' ? navigation.navigate('Course', {id: ev.extendedProps.course_id}) : onEventPress(ev)} />
        ))}
      </View>
    </View>
  );
};

const EventDetailModal = ({ event, visible, onClose }: { event: ProcessedEvent | null; visible: boolean; onClose: () => void }) => {
  if (!event) return null;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={localStyles.modalOverlay} onPress={onClose}>
        <View style={localStyles.modalContent}>
          <Text style={localStyles.modalTitle}>{event.title}</Text>
          {event.course && <Text style={localStyles.modalSubtitle}>{event.course.title}</Text>}
          <Text>{event.start.toFormat('DDD HH:mm')} - {event.end.toFormat('HH:mm')}</Text>
          {event.description ? <Text style={{ marginTop: 8 }}>{event.description}</Text> : null}
          <TouchableOpacity style={localStyles.closeButton} onPress={onClose}>
            <Text style={localStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export const AgendaWeekScreen = ({ navigation, route }: Props) => {
  const styles = useStylesheet((t: any) => createStyles(t));
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { agendaScreen, language } = usePreferencesContext();

  const { params } = route;
  const initialDate = params?.date ? DateTime.fromISO(params.date) : DateTime.now();
  const [currentWeek, setCurrentWeek] = useState(() => initialDate.startOf('week'));
  const [selectedDate, setSelectedDate] = useState(() => initialDate);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ProcessedEvent | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: weekData, isLoading: isFetching, refetch } = useGetMyEvents();

  const processedEvents = useMemo(() => {
    if (!weekData) return [] as ProcessedEvent[];
    const arr: any[] = Array.isArray(weekData) ? weekData : Array.isArray(weekData.data) ? weekData.data : Object.values(weekData).find(Array.isArray) || [];
    return arr.map((ev: any) => {
      const start = DateTime.fromISO(ev.start);
      const end = ev.end ? DateTime.fromISO(ev.end) : start.plus({ hours: 1 });
      return {
        id: String(ev.id),
        title: ev.title || 'Untitled',
        description: ev.description || '',
        start,
        end,
        color: ev.color || '#3b82f6',
        allDay: !!ev.allDay,
        extendedProps: {room: ev.extendedProps?.room || '', type: ev.extendedProps?.type || '', course_id: ev.extendedProps?.course_id || '', course_title: ev.extendedProps?.course_title || ''},
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

  const onSelectDate = useCallback((jsDate: Date) => {
    const dt = DateTime.fromJSDate(jsDate, { zone: IANAZone.create('Asia/Tashkent') });
    setDatePickerOpen(false);
    setCurrentWeek(dt.startOf('week'));
    setSelectedDate(dt);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon={faCalendarDay} onPress={() => setDatePickerOpen(true)} />
          <MenuView actions={[{ id: 'refresh', title: 'Refresh' }]} onPressAction={() => refetch()}>
            <IconButton icon={faEllipsisVertical} />
          </MenuView>
        </View>
      ),
    });
  }, [navigation, refetch]);

  return (
    <View style={styles.container}>
      <HeaderAccessory justify="space-between" style={styles.headerRow}>
        <View style={styles.weekControls}>
          <TouchableOpacity onPress={() => setCurrentWeek(currentWeek.minus({ weeks: 1 }))}>
            <Text style={styles.navButton}>{'←'}</Text>
          </TouchableOpacity>
          <View style={styles.weekLabelWrap}>
            <Text style={styles.weekLabel}>{currentWeek.toFormat('MMM d')}</Text>
            <Text style={styles.weekSubLabel}>{`${weekDates[0].toFormat('d')} — ${weekDates[6].toFormat('d, MMM yyyy')}`}</Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentWeek(currentWeek.plus({ weeks: 1 }))}>
            <Text style={styles.navButton}>{'→'}</Text>
          </TouchableOpacity>
        </View>
      </HeaderAccessory>

      <DatePicker modal locale={language} date={new Date()} mode="date" open={datePickerOpen} onConfirm={onSelectDate} onCancel={() => setDatePickerOpen(false)} />

      {isFetching ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekScroll}>
            {weekDates.filter(d => d.weekday !== 6 && d.weekday !== 7).map((d, index) => (
              <View key={d.toISODate()} style={{ width: DAY_COLUMN_WIDTH }}>
                <DayColumn
                  date={d}
                  events={eventsByDay[d.toISODate()] || []}
                  isToday={d.hasSame(DateTime.now(), 'day')}
                  showTimeLabels={index === 0}
                  onEventPress={(ev) => {
                    setSelectedEvent(ev);
                    setModalVisible(true);
                  }}
                  navigation={navigation}
                />
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      )}
      <EventDetailModal event={selectedEvent} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
};

const createStyles = ({ spacing, colors, fontWeights, fontSizes }: any) => ({
  navButton: { fontSize: fontSizes.lg, color: colors.primary, paddingHorizontal: 10 },
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { padding: spacing[2], paddingHorizontal: spacing[3], backgroundColor: colors.surface, borderBottomColor: colors.divider, borderBottomWidth: 1 },
  weekControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  weekLabelWrap: { alignItems: 'center', paddingHorizontal: 8 },
  weekLabel: { fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.text },
  weekSubLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  loader: { marginTop: 30 },
  weekScroll: { paddingVertical: 12, paddingHorizontal: 6, marginLeft: 30 },
});

const localStyles = StyleSheet.create({
  dayColumn: { backgroundColor: '#fff', borderRadius: 0, padding: 6, marginHorizontal: 0, borderRightWidth: 1, borderColor: '#eaeaea', minHeight: 13 * 60 },
  todayHighlight: { borderWidth: 1, borderColor: '#0ea5e9' },
  dayHeaderCompact: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayNameCompact: { fontSize: 12, fontWeight: '700' },
  dayNumberCompact: { fontSize: 16 },
  allDayRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6, height: 100 },
  allDayEvent: { padding: 11, borderRadius: 6, marginRight: 4, marginBottom: 4 },
  hourRow: { height: 60, borderTopWidth: 0.5, borderColor: '#e5e7eb', justifyContent: 'flex-start' },
  hourLabel: { fontSize: 10, color: '#9ca3af', position: 'absolute', left: -40, top: -6, width: 30, textAlign: 'right' },
  positionedEvent: { position: 'absolute', borderRadius: 8, padding: 6, backgroundColor: '#3b82f6' },
  eventTitle: { color: '#fff', fontSize: 12, fontWeight: '600' },
  eventTime: { color: '#f1f5f9', fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  modalSubtitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  closeButton: { marginTop: 12, padding: 10, backgroundColor: '#0ea5e9', borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontWeight: '700' },
});

export default AgendaWeekScreen;
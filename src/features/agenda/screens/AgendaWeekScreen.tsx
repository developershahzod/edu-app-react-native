// AgendaWeekScreen.tsx
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';

import {
  faCalendarDay,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { Tabs } from '@lib/ui/components/Tabs';
import { Calendar } from '@lib/ui/components/calendar/Calendar';
import { CalendarHeader } from '@lib/ui/components/calendar/CalendarHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { WeekNum } from '@lib/ui/types/Calendar.ts';
import { Theme } from '@lib/ui/types/Theme';
import { HOURS } from '@lib/ui/utils/calendar';
import { MenuView, NativeActionEvent } from '@react-native-menu/menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { DateTime, IANAZone } from 'luxon';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { AgendaStackParamList } from '../components/AgendaNavigator';
import { AgendaTypeFilter } from '../components/AgendaTypeFilter';
import { BookingCard } from '../components/BookingCard';
import { DeadlineCard } from '../components/DeadlineCard';
import { ExamCard } from '../components/ExamCard';
import { LectureCard } from '../components/LectureCard';
import { WeekFilter } from '../components/WeekFilter';
import { useProcessedLectures } from '../hooks/useProcessedLectures.ts';
import {
  AGENDA_CAL_QUERY_PREFIX,
  useGetAgendaWeekFromCalendar,
} from '../queries/calendarMyEventsHooks';
import { AgendaItem } from '../types/AgendaItem';
import { AgendaOption } from '../types/AgendaOption';
import { useGetMyEvents } from '~/core/queries/calendarHooks.ts';

type Props = NativeStackScreenProps<AgendaStackParamList, 'AgendaWeek'>;

export const AgendaWeekScreen = ({ navigation, route }: Props) => {
  const styles = useStylesheet(createStyles);
  const queryClient = useQueryClient();

  const { updatePreference, agendaScreen } = usePreferencesContext();
  const { language, accessibility } = usePreferencesContext();
  const { t } = useTranslation();
  const { palettes, fontSizes, colors } = useTheme();

  const { params } = route;
  const date = params?.date ? DateTime.fromISO(params.date) : DateTime.now();
  const today = useMemo(() => new Date(), []);
  const todayDateTime = useMemo(
    () => DateTime.fromJSDate(today, { zone: IANAZone.create('Europe/Rome') }),
    [today],
  );

  const [currentWeek, setCurrentWeek] = useState<DateTime>(
    date ? date.startOf('week') : DateTime.now().startOf('week'),
  );

  const [selectedDate, setSelectedDate] = useState<DateTime>(
    date ?? DateTime.now(),
  );

  const [dataPickerIsOpened, setDataPickerIsOpened] = useState<boolean>(false);

  // ✅ Fetch my-events from API
  const {
    data: weekData,
    isLoading: isFetching,
    refetch,
  } = useGetMyEvents();

  // ✅ Safe extraction of events (flat array)
  const allEvents = useMemo(() => {
    return Array.isArray(weekData?.data) ? weekData.data : [];
  }, [weekData?.data]);

  // ✅ Filter events by currentWeek
  const calendarData = useMemo(() => {
    return allEvents.filter(event => {
      if (!event?.start) return false;
      const eventDate = DateTime.fromISO(event.start);
      return eventDate >= currentWeek.startOf('week') &&
             eventDate < currentWeek.plus({ weeks: 1 }).startOf('week');
    });
  }, [allEvents, currentWeek]);

  // Determine the maximum weekday to decide week length
  const calendarMax = useMemo(() => {
    return (
      calendarData.reduce((max, item) => {
        const eventDate = DateTime.fromISO(item.start);
        return eventDate.weekday > DateTime.fromISO(max.start).weekday ? item : max;
      }, calendarData[0]) ?? null
    );
  }, [calendarData]);

  const filteredCalendarData = useProcessedLectures(calendarData);

  const weekLength = useMemo(() => {
    if (calendarMax) {
      const weekday = DateTime.fromISO(calendarMax.start).weekday;
      if (weekday > 5) return weekday as WeekNum;
    }
    return 5;
  }, [calendarMax]);

  const getNextWeek = useCallback(() => {
    setCurrentWeek(w => {
      const nextWeek = w.plus({ days: 7 });
      if (nextWeek.startOf('week').equals(todayDateTime.startOf('week'))) {
        setSelectedDate(todayDateTime);
      } else {
        setSelectedDate(nextWeek);
      }
      return nextWeek;
    });
  }, [todayDateTime]);

  const getPrevWeek = useCallback(() => {
    setCurrentWeek(w => {
      const prevWeek = w.minus({ days: 7 });
      if (prevWeek.startOf('week').equals(todayDateTime.startOf('week'))) {
        setSelectedDate(todayDateTime);
      } else {
        setSelectedDate(prevWeek);
      }
      return prevWeek;
    });
  }, [todayDateTime]);

  const getSelectedWeek = useCallback((newDateJS: Date) => {
    setDataPickerIsOpened(false);
    const newDate = DateTime.fromJSDate(newDateJS, {
      zone: IANAZone.create('Europe/Rome'),
    });
    const selectedWeek = newDate.startOf('week');
    setCurrentWeek(selectedWeek);
    setSelectedDate(newDate);
  }, []);

  const [calendarHeight, setCalendarHeight] = useState<number | undefined>(
    undefined,
  );

  const screenOptions = useMemo<AgendaOption[]>(
    () => [
      {
        id: 'refresh',
        title: t('agendaScreen.refresh'),
      },
      {
        id: 'daily',
        title: t('agendaScreen.dailyLayout'),
      },
    ],
    [t],
  );

  useLayoutEffect(() => {
    const switchToDaily = () => {
      updatePreference('agendaScreen', {
        ...agendaScreen,
        layout: 'daily',
      });
      navigation.replace('Agenda', {
        date: selectedDate.toISODate() ?? '',
      });
    };

    const onPressOption = ({ nativeEvent: { event } }: NativeActionEvent) => {
      switch (event) {
        case 'daily':
          switchToDaily();
          break;
        case 'refresh':
          refetch();
          break;
      }
    };

    navigation.setOptions({
      headerRight: () => (
        <>
          <IconButton
            icon={faCalendarDay}
            color={palettes.primary[400]}
            size={fontSizes.lg}
            adjustSpacing="left"
            accessibilityLabel={t('agendaScreen.selectDate')}
            onPress={() => setDataPickerIsOpened(true)}
          />
          <MenuView actions={screenOptions} onPressAction={onPressOption}>
            <IconButton
              icon={faEllipsisVertical}
              color={palettes.primary[400]}
              size={fontSizes.lg}
              adjustSpacing="right"
              accessibilityLabel={t('common.options')}
            />
          </MenuView>
        </>
      ),
    });
  }, [
    palettes.primary,
    fontSizes.lg,
    navigation,
    t,
    agendaScreen,
    selectedDate,
    refetch,
    screenOptions,
    updatePreference,
  ]);

  const isPrevMissing = useCallback(
    () =>
      queryClient.getQueryData([
        AGENDA_CAL_QUERY_PREFIX,
        currentWeek.minus({ week: 1 }).toISODate(),
      ]) === undefined,
    [currentWeek, queryClient],
  );

  const isNextMissing = useCallback(
    () =>
      queryClient.getQueryData([
        AGENDA_CAL_QUERY_PREFIX,
        currentWeek.plus({ week: 1 }).toISODate(),
      ]) === undefined,
    [currentWeek, queryClient],
  );

  const isPrevWeekDisabled = useOfflineDisabled(isPrevMissing);
  const isNextWeekDisabled = useOfflineDisabled(isNextMissing);

  return (
    <>
      <HeaderAccessory
        justify="space-between"
        style={[
          styles.headerContainer,
          accessibility?.fontSize && Number(accessibility?.fontSize) > 150
            ? { flexDirection: 'column' }
            : {},
        ]}
      >
        <Tabs contentContainerStyle={styles.tabs}>
          <AgendaTypeFilter />
        </Tabs>
        <WeekFilter
          current={currentWeek}
          getNext={getNextWeek}
          getPrev={getPrevWeek}
          isNextWeekDisabled={isNextWeekDisabled}
          isPrevWeekDisabled={isPrevWeekDisabled}
        />
      </HeaderAccessory>

      <DatePicker
        modal
        locale={language}
        date={today}
        mode="date"
        open={dataPickerIsOpened}
        onConfirm={getSelectedWeek}
        onCancel={() => setDataPickerIsOpened(false)}
        title={t('agendaScreen.selectDate')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
      />

      <View
        style={styles.calendarContainer}
        onLayout={e => {
          const { height } = e.nativeEvent.layout;
          setCalendarHeight(height);
        }}
      >
        {!calendarHeight ||
          (isFetching && (
            <ActivityIndicator size="large" style={styles.loader} />
          ))}

        {calendarHeight && (
          <Calendar<AgendaItem>
            events={filteredCalendarData}
            headerContentStyle={styles.dayHeader}
            weekDayHeaderHighlightColor={colors.background}
            date={currentWeek}
            mode="custom"
            height={calendarHeight}
            hours={HOURS}
            locale={language}
            startHour={8}
            swipeEnabled={false}
            renderHeader={props => (
              <CalendarHeader {...props} cellHeight={-1} />
            )}
            renderEvent={(item: AgendaItem, touchableOpacityProps, key) => {
              return (
                <TouchableOpacity
                  key={key}
                  {...touchableOpacityProps}
                  style={[touchableOpacityProps.style, styles.event]}
                >
                  {item.type === 'booking' && (
                    <BookingCard key={item.key} item={item} compact={true} />
                  )}
                  {item.type === 'deadline' && (
                    <DeadlineCard key={item.key} item={item} compact={true} />
                  )}
                  {item.type === 'exam' && (
                    <ExamCard key={item.key} item={item} compact={true} />
                  )}
                  {item.type === 'lecture' && (
                    <LectureCard key={item.key} item={item} compact={true} />
                  )}
                </TouchableOpacity>
              );
            }}
            weekStartsOn={1}
            weekEndsOn={weekLength}
            isEventOrderingEnabled={false}
            overlapOffset={10000}
          />
        )}
      </View>
    </>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    tabs: {
      alignItems: 'center',
    },
    headerContainer: {
      paddingVertical: spacing[2],
      paddingLeft: spacing[4],
    },
    container: {
      display: 'flex',
      flexDirection: 'row',
      gap: spacing[2],
    },
    calendarContainer: {
      height: '100%',
      width: '100%',
    },
    dayHeader: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    event: {
      backgroundColor: undefined,
      shadowColor: undefined,
      shadowOffset: undefined,
      shadowOpacity: undefined,
      shadowRadius: undefined,
      elevation: undefined,
    },
    loader: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
  });

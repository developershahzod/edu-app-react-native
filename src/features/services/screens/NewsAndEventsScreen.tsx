import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { DateTime } from 'luxon';

import { useGetAgendaWeekFromCalendar } from '../../agenda/queries/calendarMyEventsHooks';
import { Section } from '@lib/ui/components/Section';
import { ListItem } from '@lib/ui/components/ListItem';

export const NewsAndEventsScreen = () => {
  const monday = DateTime.now().startOf('week');
  const { data: agendaWeek, isLoading } = useGetAgendaWeekFromCalendar(monday);

  const days = agendaWeek?.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>News and Events</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
        ) : (
          days.map(day => (
            <Section key={day.key} style={styles.daySection}>
              <Text style={styles.dayTitle}>{day.date.toLocaleString(DateTime.DATE_HUGE)}</Text>
              {day.items.length === 0 ? (
                <Text style={styles.noEventsText}>No events for this day.</Text>
              ) : (
                day.items.map(item => (
                  <ListItem
                    key={item.key}
                    title={item.title}
                    subtitle={
                      'fromTime' in item && 'toTime' in item
                        ? `${item.fromTime} - ${item.toTime}`
                        : undefined
                    }
                    style={styles.listItem}
                  />
                ))
              )}
            </Section>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1A1A1A',
  },
  daySection: {
    marginBottom: 24,
    backgroundColor: '#F0F4F8',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  noEventsText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
  },
  listItem: {
    marginBottom: 12,
  },
  loading: {
    marginTop: 48,
  },
});
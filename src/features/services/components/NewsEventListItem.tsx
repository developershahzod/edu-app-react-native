import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type NewsEventListItemProps = {
  event: {
    id: string | number;
    title?: string;
    description?: string;
    start?: string;
    end?: string;
    color?: string;
  };
  index?: number;
  totalData?: number;
};

export const NewsEventListItem: React.FC<NewsEventListItemProps> = ({
  event,
  index,
  totalData,
}) => {
  const startDate = event.start ? new Date(event.start).toLocaleDateString() : '';
  const endDate = event.end ? new Date(event.end).toLocaleDateString() : '';

  return (
    <View style={styles.container}>
      <View style={[styles.colorBar, { backgroundColor: event.color || '#007bff' }]} />
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        {event.description ? <Text style={styles.description}>{event.description}</Text> : null}
        {(startDate || endDate) && (
          <Text style={styles.date}>
            {startDate}
            {startDate && endDate && ' - '}
            {endDate}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  colorBar: {
    width: 6,
    height: '100%',
    borderRadius: 3,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
});
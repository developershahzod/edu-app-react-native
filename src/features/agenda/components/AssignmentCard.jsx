import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@lib/ui/components/Text';

interface AssignmentItem {
  title: string;
  description: string;
  courseTitle: string;
  dueTime: string;
}

export const AssignmentCard = ({ title, description, courseTitle, dueTime }: AssignmentItem) => {
  return (
    <View style={styles.card}>
      <Text variant="heading">{title}</Text>
      <Text>{courseTitle}</Text>
      <Text>{description}</Text>
      <Text style={styles.dueTime}>Due: {dueTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dueTime: {
    fontWeight: 'bold',
    marginTop: 4,
  },
});

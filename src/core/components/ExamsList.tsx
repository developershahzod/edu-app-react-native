import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { useGetExams } from '../queries/examHooks';

export const ExamsList = () => {
  const { data: exams, isLoading, isError, error } = useGetExams();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading exams...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Error loading exams: {error instanceof Error ? error.message : 'Unknown error'}</Text>
      </View>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No exams found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.courseShortcode} - Module {item.moduleNumber}</Text>
      <Text>Starts at: {item.examStartsAt ? new Date(item.examStartsAt).toLocaleString() : 'TBD'}</Text>
      <Text>Location: {item.location || 'TBD'}</Text>
      <Text>Status: {item.status || 'Unknown'}</Text>
    </View>
  );

  return (
    <FlatList
      data={exams}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  item: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
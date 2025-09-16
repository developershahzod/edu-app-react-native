import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
} from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { OfferingCourseStaff } from '../../lib/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetPersons } from '../../../core/queries/peopleHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { StaffListItem } from '../components/StaffListItem';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TeacherContact'> & {
  route: {
    params: {
      staff: OfferingCourseStaff[];
    };
  };
};

export const TeacherContactScreen = ({ route }: Props) => {
  const { staff } = route.params;
  const [search, setSearch] = useState('');

  const staffIds = useMemo(() => staff.map(s => s.id), [staff]);
  const { queries: staffQueries, isLoading } = useGetPersons(staffIds);

  const staffPeople: OfferingCourseStaff[] = useMemo(() => {
    if (isLoading) return [];

    const staffData: OfferingCourseStaff[] = [];
    staffQueries.forEach((staffQuery, index) => {
      if (!staffQuery.data) return;
      staffData.push({
        ...staffQuery.data,
        ...staff[index],
      });
    });

    return staffData;
  }, [isLoading, staff, staffQueries]);

  // 🔥 Filter staff based on search text
  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staffPeople;

    const lowerSearch = search.toLowerCase();
    return staffPeople.filter(
      p =>
        p?.firstName?.toLowerCase().includes(lowerSearch) ||
        p?.lastName?.toLowerCase().includes(lowerSearch) ||
        `${p?.firstName ?? ''} ${p?.lastName ?? ''}`
          .toLowerCase()
          .includes(lowerSearch)
    );
  }, [search, staffPeople]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔝 Search stays pinned at top */}
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Contacts</Text>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by name..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Scroll only the results */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <Section style={styles.section}>
          <OverviewList loading={isLoading}>
            {filteredStaff.length > 0 ? (
              filteredStaff.map(person => (
                <StaffListItem
                  key={`${person.id}${person.courseId}`}
                  staff={person}
                />
              ))
            ) : (
              !isLoading && (
                <Text style={styles.emptyText}>No matching teachers found</Text>
              )
            )}
          </OverviewList>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  scrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },
  searchContainer: {
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 6,
  },
  section: {
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

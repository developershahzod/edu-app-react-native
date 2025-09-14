import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native';

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

  const staffIds = useMemo(() => staff.map(s => s.id), [staff]);

  const { queries: staffQueries, isLoading } = useGetPersons(staffIds);

  const staffPeople: OfferingCourseStaff[] = useMemo(() => {
      if (isLoading) {
        return [];
      }
  
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Teacher Contacts</Text>
        <Section style={styles.section}>
          <OverviewList loading={isLoading}>
            {staffPeople.map(person => (
              <StaffListItem
                key={`${person.id}${person.courseId}`}
                staff={person}
              />
            ))}
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
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },
  section: {
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});
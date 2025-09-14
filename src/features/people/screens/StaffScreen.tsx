import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetPersons } from '../../../core/queries/peopleHooks';
import { StaffListItem } from '../components/StaffListItem';

type Props = NativeStackScreenProps<any, 'Staff'>;

export const StaffScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const staff = route.params?.staff ?? [];

  const staffIds = useMemo(() => staff.map((s: any) => s.id), [staff]);

  const { queries: staffQueries, isLoading } = useGetPersons(staffIds);

  const staffPeople = useMemo(() => {
    if (isLoading) {
      return [];
    }

    const staffData: any[] = [];

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
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <Section>
          <OverviewList loading={isLoading}>
            {staffPeople.map((person) => (
              <StaffListItem key={`${person.id}${person.courseId}`} person={person} subtitle={t('common.staff')} />
            ))}
          </OverviewList>
        </Section>
      </SafeAreaView>
    </ScrollView>
  );
};
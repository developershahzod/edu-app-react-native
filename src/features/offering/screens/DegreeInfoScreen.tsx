import { useTranslation } from 'react-i18next';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Card } from '@lib/ui/components/Card';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { getHtmlTextContent } from '../../../utils/html';
import { useDegreeContext } from '../contexts/DegreeContext';
import { useApiContext } from '~/core/contexts/ApiContext';

// Fallback auth token function
const getAuthToken = (): string => {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTgxMjMzNDksInN1YiI6ImY2MjJmOGFiLTc1YWEtNGNmOS1hZmFlLWQzYjUzZjEzNWE3YSIsInR5cGUiOiJhY2Nlc3MifQ.ZaVXor-wofxeB6ifDchUDuiLcw_Rm9N2G25WN0aVm-k';
};

// User data fetching hook
const useGetUserData = () => {
  const { token } = useApiContext();

  return useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const response = await fetch('https://edu-api.qalb.uz/api/v1/users/me', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const DegreeInfoScreen = () => {
  const { degreeId, year } = useDegreeContext();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const degreeQuery = useGetOfferingDegree({ degreeId, year });
  const userQuery = useGetUserData();
  
  const degree = degreeQuery?.data;
  const userData = userQuery?.data;
  const isLoading = degreeQuery.isLoading || userQuery.isLoading;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[degreeQuery, userQuery]} manual />}
    >
      <SafeAreaView>
        <LoadingContainer loading={isLoading}>
          <>
            <ScreenTitle
              style={styles.heading}
              title={degree?.name || degree?.id}
            />

            {/* User Information Card */}
            {userData && (
              <Card padded style={styles.overviewCard}>
                <Text variant="subHeading" style={styles.sectionTitle}>Student Information</Text>
                {(userData.name || userData.surname) && (
                  <Text>
                    <Text style={styles.label}>Name: </Text>
                    <Text>{userData.name} {userData.surname}</Text>
                  </Text>
                )}
                {userData.login && (
                  <Text>
                    <Text style={styles.label}>Login: </Text>
                    <Text>{userData.login}</Text>
                  </Text>
                )}
                {userData.email && (
                  <Text>
                    <Text style={styles.label}>Email: </Text>
                    <Text>{userData.email}</Text>
                  </Text>
                )}
                {userData.phone_number && (
                  <Text>
                    <Text style={styles.label}>Phone: </Text>
                    <Text>{userData.phone_number}</Text>
                  </Text>
                )}
                {userData.role_type && (
                  <Text>
                    <Text style={styles.label}>Role: </Text>
                    <Text style={styles.roleText}>{userData.role_type.toUpperCase()}</Text>
                  </Text>
                )}
                {userData.is_active !== undefined && (
                  <Text>
                    <Text style={styles.label}>Status: </Text>
                    <Text style={userData.is_active ? styles.activeStatus : styles.inactiveStatus}>
                      {userData.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </Text>
                )}
              </Card>
            )}

            {/* Study Programs Card */}
            {userData?.study_programs_as_student && userData.study_programs_as_student.length > 0 && (
              <Card padded style={styles.overviewCard}>
                <Text variant="subHeading" style={styles.sectionTitle}>Study Programs</Text>
                {userData.study_programs_as_student.map((program, index) => (
                  <View key={program.id} style={styles.programContainer}>
                    <Text>
                      <Text style={styles.label}>Program: </Text>
                      <Text>{program.title}</Text>
                    </Text>
                    <Text>
                      <Text style={styles.label}>Type: </Text>
                      <Text style={styles.programType}>{program.program_type.toUpperCase()}</Text>
                    </Text>
                    {program.description && (
                      <Text>
                        <Text style={styles.label}>Description: </Text>
                        <Text>{program.description}</Text>
                      </Text>
                    )}
                    {index < userData.study_programs_as_student.length - 1 && (
                      <View style={styles.programSeparator} />
                    )}
                  </View>
                ))}
              </Card>
            )}

            {/* Degree Information Card */}
            {/* <Card padded style={styles.overviewCard}>
              <Text variant="subHeading" style={styles.sectionTitle}>Degree Information</Text>
              {degree?.location && (
                <Text>
                  <Text style={styles.label}>Location: </Text>
                  <Text>{degree?.location}</Text>
                </Text>
              )}
              {degree?.department?.name && (
                <Text>
                  <Text style={styles.label}>Department: </Text>
                  <Text>{degree?.department?.name}</Text>
                </Text>
              )}
              {degree?.faculty?.name && (
                <Text>
                  <Text style={styles.label}>Faculty: </Text>
                  <Text>{degree?.faculty.name}</Text>
                </Text>
              )}
              {degree?.duration && (
                <Text>
                  <Text style={styles.label}>Duration: </Text>
                  <Text>{degree?.duration}</Text>
                </Text>
              )}
              {degree?._class && (
                <Text>
                  <Text style={styles.label}>Degree Class: </Text>
                  <Text>
                    {degree?._class.name} ({degree._class.code})
                  </Text>
                </Text>
              )}
            </Card> */}
          </>

          {/* Notes and Objectives Section */}
          {/* <Section>
            <Card padded gapped>
              <View>
                <Text variant="subHeading">Notes</Text>
                {degree?.notes?.map((note, index) => (
                  <Text key={index} variant="longProse">
                    {getHtmlTextContent(note)}
                  </Text>
                ))}
              </View>
              {degree?.objectives?.content && (
                <View>
                  <Text variant="subHeading">Objectives</Text>
                  <Text variant="longProse">
                    {getHtmlTextContent(degree?.objectives?.content)}
                  </Text>
                </View>
              )}
            </Card>
          </Section> */}
        </LoadingContainer>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, fontWeights, fontSizes }: Theme) =>
  StyleSheet.create({
    overviewCard: {
      gap: spacing[1],
      marginBottom: spacing[2],
    },
    heading: {
      paddingHorizontal: Platform.select({
        android: spacing[2],
        ios: spacing[4],
      }),
      paddingTop: spacing[3],
    },
    label: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    sectionTitle: {
      marginBottom: spacing[2],
    },
    roleText: {
      fontWeight: fontWeights.bold,
      color: '#007AFF',
    },
    activeStatus: {
      color: '#34C759',
      fontWeight: fontWeights.medium,
    },
    inactiveStatus: {
      color: '#FF3B30',
      fontWeight: fontWeights.medium,
    },
    programType: {
      fontWeight: fontWeights.bold,
      color: '#FF9500',
      textTransform: 'uppercase',
    },
    programContainer: {
      gap: spacing[1],
    },
    programSeparator: {
      height: 1,
      backgroundColor: '#E5E5EA',
      marginVertical: spacing[2],
    },
  });
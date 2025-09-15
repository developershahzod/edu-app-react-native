import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { CourseOverview } from '../../../core/types/api';
import { CourseListItem } from '../components/CourseListItem';
import { useGetCourseNotices } from '../../../core/queries/courseHooks';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const CoursesScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const coursesQuery = useGetCourses();
  const { accessibilityListLabel } = useAccessibility();

  // Fetch notices for the first course if available
  const firstCourseId = coursesQuery.data?.[0]?.id;
  const noticesQuery = useGetCourseNotices(firstCourseId ?? '');
  const navigation = useNavigation();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      refreshControl={<RefreshControl queries={[coursesQuery, noticesQuery]} manual />}
    >
      <SafeAreaView>
        {coursesQuery.data &&
          (coursesQuery.data.length > 0 ? (
            <>
              {Object.entries(
                (coursesQuery.data as any[]).reduce(
                  (byPeriod, course) => {
                    (byPeriod[course.teachingPeriod] =
                      byPeriod[course.teachingPeriod] ?? []).push(course);
                    return byPeriod;
                  },
                  {} as Record<string, CourseOverview[]>,
                ) as Record<string, CourseOverview[]>,
              ).map(([period, courses]) => (
                <Section key={period}>
                  <SectionHeader
                    title={
                      period !== 'undefined'
                        ? `${t('common.period')} ${period}`
                        : t('coursesScreen.otherCoursesSectionTitle')
                    }
                    accessibilityLabel={`${
                      period !== 'undefined'
                        ? `${t('common.period')} ${period}`
                        : t('coursesScreen.otherCoursesSectionTitle')
                    }. ${t('coursesScreen.total', { total: courses.length })}`}
                  />
                  <OverviewList indented>
                    {courses.map((course, index) => (
                      <CourseListItem
                        key={course.shortcode + '' + course.id}
                        course={course}
                        accessible={true}
                        accessibilityLabel={accessibilityListLabel(
                          index,
                          courses.length,
                        )}
                      />
                    ))}
                  </OverviewList>
                </Section>
              ))}
              <Section>
                <SectionHeader title={t('coursesScreen.news')} />
                {noticesQuery.isLoading ? (
                  <Text>{t('common.loading')}</Text>
                ) : noticesQuery.isError ? (
                  <Text>{t('common.error')}</Text>
                ) : noticesQuery.data && noticesQuery.data.length > 0 ? (
                  (noticesQuery.data as Array<{ id: string; title: string; content: string }>).map((notice: { id: string; title: string; content: string }) => (
                    <TouchableOpacity
                      key={notice.id}
                      style={{ marginBottom: spacing[3] }}
                      onPress={() =>
                        navigation.navigate('NoticeScreen', {
                          noticeId: notice.id,
                          courseId: firstCourseId,
                        })
                      }
                    >
                      <Text style={{ fontWeight: 'bold' }}>{notice.title}</Text>
                      <Text numberOfLines={3}>{notice.content}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text>{t('coursesScreen.noNews')}</Text>
                )}
              </Section>
            </>
          ) : (
            <OverviewList emptyStateText={t('coursesScreen.emptyState')} />
          ))}
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

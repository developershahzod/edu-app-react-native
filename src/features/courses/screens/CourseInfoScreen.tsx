import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Grid } from '@lib/ui/components/Grid';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { StatefulMenuView } from '@lib/ui/components/StatefulMenuView';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MenuAction } from '@react-native-menu/menu';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useOpenInAppLink } from '../../../core/hooks/useOpenInAppLink.ts';
import {
  CourseSectionEnum,
  getCourseKey,
  useGetCourse,
  useGetCourseEditions,
  useGetCourseExams,
  useGetCourseNotices,
  useGetCourseFilesRecent,
  useGetCourseLectures,
  useGetCourseAssignments,
} from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { LectureCard } from '../../agenda/components/LectureCard';
import { useGetNextLecture } from '../../agenda/queries/lectureHooks';
import { ExamListItem } from '../../teaching/components/ExamListItem';
import { CourseRecentFileListItem } from '../components/CourseRecentFileListItem';
import { CourseAssignmentListItem } from '../components/CourseAssignmentListItem';
import { CourseLectureListItem } from './CourseLecturesScreen';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { CourseStatisticsFilterType } from '../components/CourseStatisticsFilters.tsx';
import { useCourseContext } from '../contexts/CourseContext';
import { RoleType } from '../../../lib/api-client';

type StaffMember = any;

const toPersonShape = (p: any) => {
  return {
    // Required by Person (extends User)
    id: String(p.id ?? p.user_id ?? Math.random().toString(36).slice(2)),
    login: p.login ?? p.email ?? String(p.id ?? ''),
    role_type: p.role_type ?? RoleType.TEACHER,
    is_active: p.is_active ?? true,
    // Person fields
    firstName: p.firstName ?? p.name ?? '',
    lastName: p.lastName ?? p.surname ?? '',
    email: p.email ?? '',
    role: p.role ?? 'teacher',
    department: p.department,
    office: p.office,
    picture: p.picture,
    phone: p.phone,
    courses: p.courses,
  };
};

export const CourseInfoScreen = () => {
  const { t } = useTranslation();
  const courseId = useCourseContext();
  const styles = useStylesheet(createStyles);
  const { spacing, palettes } = useTheme();
  const { getUnreadsCount, getUnreadsCountPerCourse } = useNotifications();
  const { fontSizes } = useTheme();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const { data: editions } = useGetCourseEditions(courseId);
  const courseQuery = useGetCourse(courseId);
  const { courses: coursesPreferences } = usePreferencesContext();
  const {
    nextLecture,
    dayOfMonth,
    weekDay,
    monthOfYear,
    isLoadingNextLecture,
  } = useGetNextLecture(courseId, coursesPreferences);
  const openInAppLink = useOpenInAppLink();
  const courseExamsQuery = useGetCourseExams(
    courseId,
    courseQuery.data?.shortcode,
  );

  // Previews for notices, files, lectures, assignments
  const noticesPreviewQuery = useGetCourseNotices(courseId);

  // Debug log for news API response
  if (noticesPreviewQuery.data) {
    // eslint-disable-next-line no-console
    console.log("Course News API response:", noticesPreviewQuery.data);
  }

  const filesPreviewQuery = useGetCourseFilesRecent(courseId);
  const lecturesPreviewQuery = useGetCourseLectures(courseId);
  const assignmentsPreviewQuery = useGetCourseAssignments(courseId);

  const unreadsCurrentYear = getUnreadsCount(['teaching', 'courses', courseId]);
  const unreadsPrevEditions =
    (getUnreadsCountPerCourse(null, editions) ?? 0) - (unreadsCurrentYear ?? 0);

  const isOffline = useOfflineDisabled();

  const { getParent } = useNavigation();

  const menuActions = useMemo(() => {
    if (!editions) return [];
    return editions.map(e => {
      const editionsCount = getUnreadsCount(['teaching', 'courses', e.id]);
      return {
        id: `${e.id}`,
        title: e.year,
        state: courseId === e.id ? 'on' : undefined,
        image: editionsCount
          ? Platform.select({ ios: 'circle.fill', android: 'circle' })
          : undefined,
        imageColor: editionsCount ? palettes.rose[600] : undefined,
      } as MenuAction;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editions, courseId]);

  useEffect(() => {
    if (!courseQuery.data) return;

    const src: any = courseQuery.data;
    const list: any[] = (src.teachers ?? src.staff ?? []) as any[];

    setStaff(list);
  }, [courseQuery.data]);

  const queryClient = useQueryClient();
  const isGuideDataMissing = useCallback(
    () =>
      queryClient.getQueryData(
        getCourseKey(courseId, CourseSectionEnum.Guide),
      ) === undefined,
    [courseId, queryClient],
  );
  const isGuideDisabled = useOfflineDisabled(isGuideDataMissing);
  const isStatisticsDisabled = !courseQuery.data?.shortcode;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          queries={[courseQuery, courseExamsQuery]}
          manual
        />
      }
    >
      <SafeAreaView>
        <Section style={styles.heading}>
          <ScreenTitle title={courseQuery.data?.name} />
          <Text variant="caption">{courseQuery.data?.shortcode ?? ' '}</Text>
        </Section>
        <Card style={styles.metricsCard} accessible={true}>
          <Grid>
            <View
              style={GlobalStyles.grow}
              importantForAccessibility="yes"
              accessibilityRole="button"
              accessible={true}
            >
              <StatefulMenuView
                actions={menuActions}
                onPressAction={async ({ nativeEvent: { event } }) => {
                  (
                    getParent()! as NativeStackNavigationProp<
                      TeachingStackParamList,
                      'Course'
                    >
                  ).replace('Course', {
                    id: +event,
                    animated: false,
                  });
                }}
              >
                <Row justify="flex-start" align="center">
                  <Metric
                    title={t('common.period')}
                    value={
                      courseQuery.data?.start_date && courseQuery.data?.end_date
                        ? `${new Date(courseQuery.data.start_date).toLocaleDateString()} - ${new Date(courseQuery.data.end_date).toLocaleDateString()}`
                        : `${courseQuery.data?.teachingPeriod ?? '--'} - ${courseQuery.data?.year ?? '--'}`
                    }
                    accessibilityLabel={
                      courseQuery.data?.start_date && courseQuery.data?.end_date
                        ? `${t('common.period')}: ${new Date(courseQuery.data.start_date).toLocaleDateString()} - ${new Date(courseQuery.data.end_date).toLocaleDateString()}`
                        : `${t('degreeCourseScreen.period')}: ${courseQuery.data?.teachingPeriod ?? '--'} - ${courseQuery.data?.year ?? '--'}`
                    }
                    style={styles.periodMetric}
                  />
                  <Col align="center">
                    {unreadsPrevEditions > 0 && (
                      <Icon
                        icon={faCircle}
                        size={8}
                        color={styles.dotIcon.color}
                        style={styles.dotIcon}
                      />
                    )}
                    {(editions?.length ?? 0) > 0 && (
                      <Icon
                        icon={faAngleDown}
                        size={14}
                        style={{
                          marginTop: unreadsPrevEditions
                            ? undefined
                            : spacing[4],
                        }}
                        color={styles.periodDropdownIcon.color}
                      />
                    )}
                  </Col>
                </Row>
              </StatefulMenuView>
            </View>
            <Metric
              title={t('courseInfoTab.creditsLabel')}
              value={t('common.creditsWithUnit', {
                credits: courseQuery.data?.cfu,
              })}
              accessibilityLabel={`${t('courseInfoTab.creditsLabel')}: ${
                courseQuery.data?.cfu
              }`}
              style={GlobalStyles.grow}
            />
          </Grid>
        </Card>

        {/* Students Section */}
          <Section>
          <SectionHeader title={'About'} />
          <OverviewList indented>
            {(() => {
              const c = (courseQuery.data as any) ?? {};
              const details: Array<{ key: string; label: string; value?: string }> = [
                { key: 'description', label: 'Description', value: c.description },
                { key: 'prerequisites', label:  'Prerequisites', value: c.prerequisites },
                { key: 'assessment_info', label:  'Assessment', value: c.assessment_info },
                { key: 'reading_materials', label:   'Reading materials', value: c.reading_materials },
                { key: 'category', label:  'Category', value: c.category },
                { key: 'academic_year', label: 'Year', value: c.academic_year ?? c.year },
                { key: 'semester', label:  'Semester', value: c.semester ?? c.teaching_period },
                { key: 'start_date', label: 'Start date', value: c.start_date },
                { key: 'end_date', label:  'End date', value: c.end_date },
              ].filter(i => !!i.value);

              return details.length
                ? details.map((d, idx) => (
                    <ListItem key={`${d.key}-${idx}`} title={d.label} subtitle={String(d.value)} />
                  ))
                : <></>;
            })()}
          </OverviewList>
        </Section>
     

        {/* Dedicated Course News section */}
        <Section>
          <SectionHeader title={'Course News'} />
          <OverviewList
            indented
            loading={noticesPreviewQuery.isLoading}
            emptyStateText={t('courseNoticesTab.emptyState')}
          >
            {(noticesPreviewQuery.data ?? []).map((n: any) => (
              <ListItem
                key={String(n.id)}
                title={String(n.title ?? '').trim() || ''}
                subtitle={
                  (n.publishedAt
                    ? new Date(n.publishedAt).toLocaleDateString() + ' - '
                    : '') +
                  (typeof n.content === 'string'
                    ? n.content.replace(/<[^>]*>/g, '').slice(0, 120)
                    : '') +
                  (n.author ? ` - ${n.author.name} ${n.author.surname}` : '')
                }
                linkTo={{
                  screen: 'NoticeScreen',
                  params: { noticeId: n.id, courseId },
                }}
              />
            ))}
          </OverviewList>
        </Section>

        {/* Files preview */}
        <Section>
          <SectionHeader title={'Files'} />
          <OverviewList
            indented
            loading={filesPreviewQuery.isLoading}
            emptyStateText={t('courseFilesTab.empty')}
          >
            {(filesPreviewQuery.data ?? []).slice(0, 3).map((file: any) => (
              <CourseRecentFileListItem key={file.id} item={file} />
            ))}
            <ListItem
              title={t('courseFilesTab.title')}
              linkTo={{ screen: 'CourseFilesScreen' }}
              isAction
            />
          </OverviewList>
        </Section>

        {/* Lectures preview */}
        <Section>
          <SectionHeader title={t('courseLecturesTab.title') ?? 'Lectures'} />
          <OverviewList
            indented
            loading={lecturesPreviewQuery.isLoading}
            emptyStateText={t('courseLecturesTab.emptyState')}
          >
            {(lecturesPreviewQuery.data ?? []).slice(0, 3).map((lecture: any) => (
              <CourseLectureListItem
                key={lecture.id}
                courseId={courseId}
                section={{ title: '', type: 'VirtualClassroom', data: [], courseId }}
                lecture={lecture}
              />
            ))}
            <ListItem
              title={t('courseLecturesTab.title')}
              linkTo={{ screen: 'CourseLecturesScreen' }}
              isAction
            />
          </OverviewList>
        </Section>

        

        {/* Assignments preview */}
        <Section>
          <SectionHeader title={t('courseAssignmentsTab.title')} />
          <OverviewList
            indented
            loading={assignmentsPreviewQuery.isLoading}
            emptyStateText={t('courseAssignmentsTab.emptyState')}
          >
            {(assignmentsPreviewQuery.data ?? []).slice(0, 3).map((a: any, index: number) => (
              <CourseAssignmentListItem key={String(a.id)} item={a} />
            ))}
            <ListItem
              title={t('courseAssignmentsTab.title')}
              linkTo={{ screen: 'CourseAssignmentsScreen' }}
              isAction
            />
          </OverviewList>
        </Section>

        {/* Students placeholder */}
        <Section>
          <SectionHeader title={'Students'} />
          <OverviewList
            indented
            loading={false}
            emptyStateText={t('courseInfoTab.studentsEmptyState') ?? 'No students data available.'}
          >
            {/* Placeholder static list */}
            <PersonListItem
              person={{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }}
              subtitle="Student"
            />
            <PersonListItem
              person={{ id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }}
              subtitle="Student"
            />
          </OverviewList>
        </Section>

        {/* Staff */}
        <Section>
          <SectionHeader title={t('courseInfoTab.staffSectionTitle')} />
          <OverviewList
            indented
            loading={
              !courseQuery?.data ||
              ((Array.isArray(staff) ? staff.length : 0) > 0 && staff.length === 0)
            }
          >
            {staff.map((member: any, idx: number) => {
              const courseRole =
                member?.role === 'Titolare' || member?.role === 'Holder'
                  ? 'roleHolder'
                  : 'roleCollaborator';
              const person = toPersonShape(member);
              return (
                <PersonListItem
                  key={`${person.id}-${idx}`}
                  person={person as any}
                  subtitle={t(`common.${courseRole}`)}
                />
              );
            })}
          </OverviewList>
        </Section>

        {/* Exams */}
        <Section>
          <SectionHeader title={t('examsScreen.title')} />
          <OverviewList
            loading={courseExamsQuery.isLoading}
            indented
            emptyStateText={
              courseExamsQuery.isLoading
                ? t('common.cacheMiss')
                : t('examsScreen.emptyState')
            }
          >
            {courseExamsQuery.data?.map(exam => (
              <ExamListItem
                key={`${exam.id}` + exam.moduleNumber}
                exam={exam}
              />
            ))}
          </OverviewList>
        </Section>

        {/* About / Details */}
      

        {/* Links */}
        <Section>
          <SectionHeader title={t('courseInfoTab.linksSectionTitle')} />
          <OverviewList
            indented
            loading={!courseQuery?.data}
            emptyStateText={
              isOffline && courseQuery.isLoading
                ? t('common.cacheMiss')
                : t('courseInfoTab.linksSectionEmptyState')
            }
          >
            {(courseQuery.data?.links as any[])?.map((link: any, index: number) => (
              <ListItem
                key={index}
                leadingItem={<Icon icon={faLink} size={fontSizes.xl} />}
                title={link?.description ?? t('courseInfoTab.linkDefaultTitle')}
                subtitle={link?.url}
                onPress={() => openInAppLink(link?.url)}
              />
            ))}
          </OverviewList>
        </Section>

        <Section>
          <SectionHeader title={t('courseInfoTab.moreSectionTitle')} />
          <OverviewList>
            <ListItem
              title={t('courseGuideScreen.title')}
              linkTo={{ screen: 'CourseGuide', params: { courseId } }}
              disabled={isGuideDisabled}
            />
            <ListItem
              title={t('courseStatisticsScreen.title')}
              subtitle={t('courseStatisticsScreen.subtitle')}
              linkTo={{
                screen: 'CourseStatistics',
                params: {
                  courseShortcode: courseQuery.data?.shortcode,
                  year: courseQuery.data?.year,
                  teacherId: courseQuery.data?.teacherId,
                  filter: CourseStatisticsFilterType.YEAR,
                  nameCourse: courseQuery.data?.name,
                },
              }}
              disabled={isStatisticsDisabled}
            />
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({
  palettes,
  spacing,
  colors,
  fontWeights,
  shapes,
}: Theme) =>
  StyleSheet.create({
    heading: {
      paddingTop: spacing[5],
      paddingHorizontal: spacing[4],
    },
    metricsCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
      marginTop: 0,
      marginBottom: spacing[7],
    },
    periodMetric: {
      marginRight: spacing[2],
    },
    periodDropdownIcon: {
      color: palettes.secondary['500'],
    },
    dotIcon: {
      marginBottom: spacing[2],
      color: palettes.rose['600'],
    },
    dayColumn: {
      width: '15%',
      maxWidth: 200,
    },
    secondaryDay: {
      textTransform: 'capitalize',
      fontWeight: fontWeights.medium,
    },
    dayBox: {
      display: 'flex',
      alignItems: 'center',
      paddingVertical: spacing[2],
    },
    nextLecBox: {
      display: 'flex',
      backgroundColor: colors.heading,
      borderRadius: shapes.lg,
      marginLeft: spacing[1],
      marginTop: spacing[2],
    },
    nextLec: {
      color: colors.surface,
    },
    nextLectureBox: {
      gap: spacing[4],
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
    },
  });

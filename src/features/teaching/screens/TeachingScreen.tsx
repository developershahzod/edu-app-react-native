import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { ExamStatusEnum } from '../../../../src/lib/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateTime } from 'luxon';
import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { useGetSurveyCategories } from '../../../core/queries/surveysHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { formatFinalGrade, formatThirtiethsGrade } from '../../../utils/grades';
import { CourseListItem } from '../../courses/components/CourseListItem';
import { ExamListItem } from '../components/ExamListItem';
import { ProgressChart } from '../components/ProgressChart';
import { SurveyTypesSection } from '../components/SurveyTypesSection';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Home'>;

export const TeachingScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { courses: coursePreferences, hideGrades } = usePreferencesContext();
  const isOffline = useOfflineDisabled();
  const { getUnreadsCountPerCourse } = useNotifications();
  const surveyCategoriesQuery = useGetSurveyCategories();
  const coursesQuery = useGetCourses();
  const examsQuery = useGetExams();
  const studentQuery = useGetStudent();
  const transcriptBadge = null;

  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery]);

  const exams = useMemo(() => {
    if (!coursesQuery.data || !examsQuery.data) return [];
    const hiddenCourses = Object.keys(coursePreferences).filter(
      key => coursePreferences[key].isHidden,
    );
    return (
      examsQuery.data
        .filter(
          e =>
            !hiddenCourses.includes(e.uniqueShortcode) &&
            e.examEndsAt!.valueOf() > DateTime.now().toMillis(),
        )
        .sort((a, b) => {
          const status =
            (a.status === ExamStatusEnum.Booked ? -1 : 0) +
            (b.status === ExamStatusEnum.Booked ? 1 : 0);
          return status !== 0 ? status : a.examStartsAt!.valueOf() - b.examStartsAt!.valueOf();
        })
        .slice(0, 4) ?? []
    );
  }, [coursePreferences, coursesQuery.data, examsQuery.data]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[coursesQuery, examsQuery, studentQuery, surveyCategoriesQuery]} manual />}
    >
      <View style={styles.container}>
        {surveyCategoriesQuery.data?.length ? <SurveyTypesSection types={surveyCategoriesQuery.data} /> : null}

        <Section>
          <SectionHeader title={t('coursesScreen.title')} linkTo={{ screen: 'Courses' }} linkToMoreCount={coursesQuery.data?.length ? coursesQuery.data.length - courses.length : undefined} />
          <OverviewList loading={coursesQuery.isLoading && !isOffline} indented emptyStateText={isOffline ? t('common.cacheMiss') : (coursesQuery.data?.length ?? 0 > 0 ? t('teachingScreen.allCoursesHidden') : t('coursesScreen.emptyState'))}>
            {courses.map(course => (
              <CourseListItem key={course.shortcode + course.id} course={course} badge={getUnreadsCountPerCourse(course.id, course.previousEditions)} />
            ))}
          </OverviewList>
        </Section>

        <Section>
          <SectionHeader title={t('examsScreen.title')} linkTo={{ screen: 'Exams' }} linkToMoreCount={examsQuery.data?.length ? examsQuery.data.length - exams.length : undefined} />
          <OverviewList loading={false} indented emptyStateText={isOffline && examsQuery.isLoading ? t('common.cacheMiss') : t('examsScreen.emptyState')}>
            {exams.map((exam, index) => (
              <ExamListItem key={`${exam.id}${exam.moduleNumber}`} exam={exam} bottomBorder={index < exams.length - 1} />
            ))}
          </OverviewList>
        </Section>

        <Section>
          <SectionHeader title={t('common.transcript')} trailingItem={<HideGrades />} />
          <View style={GlobalStyles.relative}>
            <Card style={styles.transcriptCard}>
              {studentQuery.isLoading ? (
                isOffline ? (
                  <OverviewList emptyStateText={t('common.cacheMiss')} />
                ) : (
                  <ActivityIndicator style={styles.loader} />
                )
              ) : (
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Transcript')}>
                  <Row p={5} gap={5} align="center" justify="space-between">
                    <Col justify="center" flexShrink={1} gap={5}>
                      <Metric title={t('transcriptMetricsScreen.weightedAverage')} value={formatThirtiethsGrade(!hideGrades ? studentQuery.data?.averageGrade : null)} color={colors.title} />
                      <Metric title={t('transcriptMetricsScreen.averageLabel')} value={formatFinalGrade(!hideGrades ? (studentQuery.data?.usePurgedAverageFinalGrade ? studentQuery.data?.estimatedFinalGradePurged : studentQuery.data?.estimatedFinalGrade) : null)} color={colors.title} />
                    </Col>
                    <Col style={styles.graph} flexShrink={1}>
                      <View style={{ alignItems: 'center' }}>
                        <ProgressChart label={studentQuery.data?.totalCredits ? `${hideGrades ? '--' : studentQuery.data?.totalAcquiredCredits}/${studentQuery.data?.totalCredits}\n${t('common.ects')}` : undefined} data={hideGrades ? [] : studentQuery.data?.totalCredits ? [(studentQuery.data?.totalAttendedCredits ?? 0) / studentQuery.data?.totalCredits, (studentQuery.data?.totalAcquiredCredits ?? 0) / studentQuery.data?.totalCredits] : []} boxSize={140} radius={40} thickness={18} colors={[palettes.primary[400], palettes.secondary[500]]} />
                      </View>
                    </Col>
                  </Row>
                </TouchableOpacity>
              )}
            </Card>
            {transcriptBadge && <UnreadBadge text={transcriptBadge} style={styles.badge} />}
          </View>
        </Section>
      </View>
      <BottomBarSpacer />
    </ScrollView>
  );
};

const HideGrades = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const { hideGrades, updatePreference } = usePreferencesContext();

  const label = hideGrades ? t('common.show') : t('common.hide');
  const icon = hideGrades ? faEye : faEyeSlash;

  return (
    <TouchableOpacity style={styles.hideGradesSwitch} onPress={() => updatePreference('hideGrades', !hideGrades)}>
      <Icon icon={icon} color={colors.link} />
      <Text variant="link">{label}</Text>
    </TouchableOpacity>
  );
};

const createStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    container: {
      marginVertical: spacing[5],
      paddingHorizontal: spacing[0],
    },
    loader: {
      marginVertical: spacing[8],
    },
    transcriptCard: {
      marginVertical: spacing[2],
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 10,
    },
    hideGradesSwitch: {
      flexDirection: 'row',
      gap: spacing[1],
      alignItems: 'center',
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2],
      borderRadius: 8,
      backgroundColor: colors.surfaceVariant,
    },
    graph: {
      paddingHorizontal: spacing[4],
    },
  });

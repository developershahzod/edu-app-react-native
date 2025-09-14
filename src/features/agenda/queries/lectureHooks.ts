import { useMemo } from 'react';

import { Lecture as ApiLecture, LecturesApi, ResponseError } from '../../../lib/api-client';
import { useQueries, useQuery } from '@tanstack/react-query';

import { DateTime, IANAZone } from 'luxon';

import { CoursesPreferences } from '../../../core/contexts/PreferencesContext';
import {
  useCoursesClient,
  useGetCourses,
} from '../../../core/queries/courseHooks';
import { CourseOverview } from '../../../core/types/api';
import { isCurrentMonth } from '../../../utils/dates';
import { toOASTruncable } from '../../../utils/dates';
import { pluckData } from '../../../utils/queries';
import { Lecture } from '../types/Lecture';
import { formatNextLecture } from '../utils/formatters';

export const LECTURES_QUERY_PREFIX = 'lectures';

const addUniqueShortcodeToLectures = (
  lectures: ApiLecture[],
  courses: CourseOverview[],
): Lecture[] => {
  return lectures.map(lecture => ({
    ...lecture,
    uniqueShortcode: courses!
      .find(
        course =>
          String(course.id) ===
          String((lecture as any).course_id ?? (lecture as any).courseId),
      )?.uniqueShortcode,
  }));
};

const useLectureClient = (): LecturesApi => {
  return new LecturesApi();
};

/**
 * Visible courses are the ones not hidden in preferences
 * and belonging to the study plan of the active career
 */
const getVisibleCourseIds = (
  courses: CourseOverview[],
  coursesPreferences: CoursesPreferences,
) => {
  if (!courses) return [];

  const hiddenUniqueShortcodes = Object.entries(coursesPreferences)
    .filter(([_, prefs]) => prefs.isHidden)
    .map(([uniqueShortcode]) => uniqueShortcode);

  return courses
    .filter(
      course =>
        course.id !== null &&
        !hiddenUniqueShortcodes.includes(course.uniqueShortcode),
    )
    .map(course => Number(course.id));
};

const getLectureWeekQueryKey = (monday: DateTime) => {
  return [LECTURES_QUERY_PREFIX, monday];
};

const getLectureWeekQueryFn = async (
  lectureClient: LecturesApi,
  monday: DateTime,
  courses: CourseOverview[],
  visibleCourseIds: number[],
) => {
  const until = monday.endOf('week');

  return lectureClient
    .getLectures({
      fromDate: monday.toISO()!,
      toDate: until.toISO()!,
    })
    .then(pluckData)
    .then(l => addUniqueShortcodeToLectures(l, courses!));
};

export const useGetLectureWeek = (
  coursesPreferences: CoursesPreferences,
  since: DateTime = DateTime.now().startOf('week'),
) => {
  const lectureClient = useLectureClient();
  const { data: courses } = useGetCourses();

  const visibleCourseIds = useMemo(() => {
    return getVisibleCourseIds(courses!, coursesPreferences);
  }, [courses, coursesPreferences]);

  return useQuery<Lecture[]>({
    queryKey: getLectureWeekQueryKey(since),
    queryFn: async () =>
      getLectureWeekQueryFn(lectureClient, since, courses!, visibleCourseIds),
    enabled: !!courses && Array.isArray(visibleCourseIds),
    staleTime: Infinity,
  });
};

export const useGetLectureWeeks = (
  coursesPreferences: CoursesPreferences,
  mondays: DateTime[] = [DateTime.now().startOf('week')],
) => {
  const lectureClient = useLectureClient();
  const { data: courses } = useGetCourses();

  const visibleCourseIds = useMemo(() => {
    return getVisibleCourseIds(courses!, coursesPreferences);
  }, [courses, coursesPreferences]);

  const queries = useQueries({
    queries: mondays.map(monday => ({
      queryKey: getLectureWeekQueryKey(monday),
      queryFn: async () =>
        getLectureWeekQueryFn(
          lectureClient,
          monday,
          courses!,
          visibleCourseIds,
        ),
    })),
  });

  const isLoading = useMemo(() => {
    return queries.some(query => query.isLoading);
  }, [queries]);

  return {
    data: queries.map(query => query.data!),
    isLoading,
  };
};

export const useGetNextLecture = (
  _courseId: number,
  _coursesPreferences: CoursesPreferences,
) => {
  // Endpoint not available on the new API; return a stable empty result
  return {
    nextLecture: null as any,
    dayOfMonth: '',
    weekDay: '',
    monthOfYear: '',
    isLoadingNextLecture: false,
    error: undefined as any,
  };
};

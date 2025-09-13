import {
  Degree as ApiDegree,
  CourseStatistics,
  OfferingApi,
} from '../../lib/api-client';
import { GetCourseStatisticsRequest } from '../../lib/api-client/OfferingApi';
import { MenuAction } from '@react-native-menu/menu';
import { useQuery } from '@tanstack/react-query';

import { Degree } from '~/features/offering/types/Degree.ts';
import { getShortYear } from '~/utils/offerings.ts';
import { pluckData } from '~/utils/queries.ts';

import { compact } from 'lodash';

export const OFFERING_QUERY_KEY = ['offering'];
export const DEGREES_QUERY_PREFIX = 'degrees';
export const COURSES_QUERY_PREFIX = 'courses';
export const STATISTICS_QUERY_PREFIX = 'statistics';
const useOfferingClient = (): OfferingApi => {
  return new OfferingApi();
};

export const useGetOffering = () => {
  const offeringClient = useOfferingClient();

  return useQuery({
    queryKey: OFFERING_QUERY_KEY,
    queryFn: () => offeringClient.getOffering().then(pluckData),
  });
};

const mapDegreeToOfferingDegree = (degree: ApiDegree): Degree => ({
  ...degree,
  editions: degree.editions.map(edition => {
    const degreeYear = Number(edition);
    const previousDegreeYear = degreeYear - 1;

    return {
      id: edition,
      title: `${previousDegreeYear}/${getShortYear(degreeYear)}`,
      state: degreeYear === degree.year ? 'on' : undefined,
    } as MenuAction;
  }),
});

export const useGetOfferingDegree = ({
  degreeId,
  year,
}: {
  degreeId: string;
  year?: string;
}) => {
  const offeringClient = useOfferingClient();

  return useQuery({
    queryKey: compact([DEGREES_QUERY_PREFIX, degreeId, year]),
    queryFn: () =>
      offeringClient
        .getOfferingDegree({ degreeId, year })
        .then(pluckData)
        .then(mapDegreeToOfferingDegree),
  });
};

export const useGetOfferingCourse = ({
  courseShortcode,
  year,
}: {
  courseShortcode: string;
  year?: string;
}) => {
  const offeringClient = useOfferingClient();

  return useQuery({
    queryKey: compact([
      DEGREES_QUERY_PREFIX,
      COURSES_QUERY_PREFIX,
      courseShortcode,
      year,
    ]),
    queryFn: () =>
      offeringClient
        .getOfferingCourse({ courseShortcode, year })
        .then(pluckData)
        .then(course => {
          const { teachingPeriod } = course;
          const period = teachingPeriod.split('-');
          if (period.length > 1 && period[0] === period[1]) {
            course.teachingPeriod = period[0];
          }
          return course;
        }),
  });
};

export const useGetCourseStatistics = ({
  courseShortcode,
  teacherId,
  year,
}: GetCourseStatisticsRequest) => {
  const offeringClient = useOfferingClient();

  return useQuery<CourseStatistics>({
    queryKey: compact([
      DEGREES_QUERY_PREFIX,
      COURSES_QUERY_PREFIX,
      STATISTICS_QUERY_PREFIX,
      courseShortcode,
      year,
      teacherId,
    ]),
    queryFn: () =>
      offeringClient
        .getCourseStatistics({ courseShortcode, teacherId, year })
        .then(pluckData),
  });
};

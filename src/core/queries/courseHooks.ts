import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Course as ApiCourse,
  CourseDirectory,
  CourseFileOverview,
  CourseOverview as ApiCourseOverview,
  CoursesApi,
  VideoLecture,
  VirtualClassroom,
} from '../../lib/api-client';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { isCourseDetailed } from '../../features/courses/utils/courses';
import { notNullish } from '../../utils/predicates';
import { courseColors } from '../constants';
import {
  CoursesPreferences,
  usePreferencesContext,
} from '../contexts/PreferencesContext';
import { CourseOverview, Exam } from '../types/api';
import { useApiContext } from '../contexts/ApiContext';
import { useGetExams } from './examHooks';

/**
 * Keys
 */
export const COURSES_QUERY_KEY = ['courses'];
export const COURSE_QUERY_PREFIX = 'course';

/**
 * API client (keep exported for compatibility)
 */
export const useCoursesClient = (): CoursesApi => {
  return new CoursesApi();
};

/**
 * Map API course to legacy CourseOverview
 */
const toCourseOverview = (c: ApiCourse | ApiCourseOverview): CourseOverview => {
  // Api model may be Course (full) or CourseOverview (already minimal)
  const id = (c as any).id;
  const name =
    (c as any).name ??
    (c as any).title ??
    (c as any).course_name ??
    (c as any).courseName ??
    '';
  const shortcode =
    (c as any).shortcode ??
    (c as any).code ??
    (name ? String(name).substring(0, 6).toUpperCase() : '');
  const credits =
    (c as any).credits ??
    (c as any).cfu ??
    (c as any).ects ??
    0;
  const year = (c as any).year ?? (c as any).academic_year ?? '';
  const semester =
    (c as any).semester ??
    (c as any).teaching_period ??
    '';
  return {
    id,
    name,
    shortcode,
    credits,
    year,
    semester,
    uniqueShortcode: shortcode || String(id) || name || '',
  };
};

/**
 * Setup courses and ensure preferences/uniqueShortcode
 */
const setupCourses = (
  courses: (ApiCourse | ApiCourseOverview)[] = [],
  coursePreferences: CoursesPreferences,
  updatePreference: ReturnType<typeof usePreferencesContext>['updatePreference'],
): CourseOverview[] => {
  let hasNewPreferences = false;
  const updatedCourses: CourseOverview[] = [];

  courses.forEach(c => {
    const newC = toCourseOverview(c);
    const hasDetails = isCourseDetailed(newC);
    newC.uniqueShortcode = newC.shortcode;

    if (hasDetails && !(newC.uniqueShortcode in coursePreferences)) {
      const usedColors = Object.values(coursePreferences)
        .map(cp => cp.color)
        .filter(notNullish);
      let colorData: (typeof courseColors)[0] | undefined;
      for (const currentColor of courseColors) {
        if (!usedColors.includes(currentColor.color)) {
          colorData = currentColor;
          break;
        }
      }
      if (!colorData) {
        colorData =
          courseColors[Math.round(Math.random() * (courseColors.length - 1))];
      }
      coursePreferences[newC.uniqueShortcode] = {
        color: colorData.color,
        isHidden: false,
        isHiddenInAgenda: false,
      };
      hasNewPreferences = true;
    }

    updatedCourses.push(newC);
  });

  if (hasNewPreferences) {
    updatePreference('courses', coursePreferences);
  }

  return updatedCourses.sort((a, b) => (a.name > b.name ? 1 : -1));
};

/**
 * Fetch enrolled courses
 */
export const useGetCourses = () => {
  const { token } = useApiContext();
  const { courses: coursePreferences, updatePreference } = usePreferencesContext();

  return useQuery<CourseOverview[]>({
    queryKey: COURSES_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(
        'https://edu-api.qalb.uz/api/v1/courses/?enrolled_to_me=true',
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch courses');

      const json = await res.json();
      return setupCourses(json, coursePreferences, updatePreference);
    },
  });
};

/**
 * Sections enums
 */
export const CourseSectionEnum = {
  Overview: 'overview',
  Editions: 'editions',
  Guide: 'guide',
  Exams: 'exams',
  Notices: 'notices',
  Files: 'files',
  Assignments: 'assignments',
} as const;
export type CourseQueryEnum =
  (typeof CourseSectionEnum)[keyof typeof CourseSectionEnum];

export const getCourseKey = (
  courseId: number | string,
  section: CourseQueryEnum = CourseSectionEnum.Overview,
) => [COURSE_QUERY_PREFIX, courseId, section];

/**
 * Course detail
 */
export const useGetCourse = (courseId: number | string) => {
  const { token } = useApiContext();

  return useQuery({
    queryKey: getCourseKey(courseId),
    queryFn: async () => {
      const res = await fetch(
        `https://edu-api.qalb.uz/api/v1/courses/${courseId}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch course');

      const json = await res.json();

      // Normalize fields used by UI
      json.name = json.name ?? json.title ?? '';
      if (!json.shortcode) {
        const base = json.name || json.title || '';
        json.shortcode = String(base).substring(0, 6).toUpperCase();
      }
      if (json.credits == null && json.cfu != null) {
        json.credits = json.cfu;
      }
      if (json.cfu == null && json.credits != null) {
        json.cfu = json.credits;
      }
      if (!json.year) json.year = json.academic_year ?? json.year;
      if (!json.semester) json.semester = json.teaching_period ?? json.semester;
      if (!json.teachingPeriod) {
        json.teachingPeriod =
          json.semester ?? json.teaching_period ?? undefined;
      }
      const period = json.teachingPeriod?.split?.('-');
      if (period && period.length > 1 && period[0] === period[1]) {
        json.teachingPeriod = period[0];
      }

      return json;
    },
    staleTime: Infinity,
    retry: 2,
  });
};

/**
 * Previous editions (not available on new API) - return empty
 */
export const useGetCourseEditions = (_courseId: number | string) => {
  return useQuery({
    queryKey: getCourseKey(_courseId, CourseSectionEnum.Editions),
    queryFn: async () => {
      return [] as Array<{ id: number; year: string }>;
    },
    staleTime: Infinity,
  });
};

/**
 * Files (recent list uses flat endpoint)
 */
const courseFilesStaleTime = 60000; // 1 minute

export const useGetCourseFiles = (courseId: number | string) => {
  const { token } = useApiContext();

  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Files),
    queryFn: async (): Promise<
      Array<
        CourseFileOverview & {
          // soft-extended for UI
          location?: string;
          uploadDate?: Date | string;
          createdAt?: Date;
        }
      >
    > => {
      const res = await fetch(
        `https://edu-api.qalb.uz/api/v1/courses/${courseId}/files`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch course files');

      const json = await res.json();

      // Normalize file fields for UI compatibility (flat recent list)
      return (json ?? []).map((f: any) => {
        const uploadDate =
          f.uploadDate ?? f.upload_date ?? f.created_at ?? undefined;
        return {
          ...(f as CourseFileOverview),
          id: String(f.id ?? f.file_id ?? f.stored_filename),
          name: f.name ?? f.filename ?? f.stored_filename ?? 'Unnamed',
          mimeType: f.mimeType ?? f.file_type ?? f.mimetype,
          size:
            typeof f.size === 'number'
              ? f.size
              : parseInt(f.file_size, 10) || undefined,
          uploadDate,
          // createdAt only for UI sorting when present
          createdAt: uploadDate ? new Date(uploadDate) : undefined,
          downloadUrl: f.downloadUrl ?? f.file_url ?? f.url,
          location: f.location ?? undefined,
        };
      });
    },
    staleTime: courseFilesStaleTime,
  });
};

export const useGetCourseFilesRecent = (courseId: number | string) => {
  const filesQuery = useGetCourseFiles(courseId);

  const recentFilesQuery = useQuery({
    queryKey: [COURSE_QUERY_PREFIX, courseId, 'recentFiles'],
    queryFn: () => {
      const items = (filesQuery.data as any[]) ?? [];
      return items.slice().sort((a, b) => {
        const ad = new Date(
          a.uploadDate ?? a.createdAt ?? a.upload_date ?? 0,
        ).getTime();
        const bd = new Date(
          b.uploadDate ?? b.createdAt ?? b.upload_date ?? 0,
        ).getTime();
        return bd - ad;
      });
    },
    enabled: !!filesQuery.data && !filesQuery.isRefetching,
    staleTime: courseFilesStaleTime,
  });

  return {
    ...recentFilesQuery,
    refetch: async () => {
      await filesQuery.refetch();
      return recentFilesQuery.refetch();
    },
  };
};

/**
 * Directory navigation (use dedicated endpoint)
 */
export const useGetCourseDirectory = (
  courseId: number | string,
  directoryId?: string,
) => {
  const coursesClient = useCoursesClient();

  const directoryQuery = useQuery({
    queryKey: [
      COURSE_QUERY_PREFIX,
      courseId,
      'directories',
      directoryId ?? 'root',
    ],
    queryFn: async (): Promise<
      Array<
        | ({ type: 'directory' } & CourseDirectory & { files: any[] })
        | ({ type: 'file' } & CourseFileOverview & { createdAt?: Date })
      >
    > => {
      const resp = await coursesClient.getCourseDirectory({
        courseId,
        directoryId,
      });

      // We expect either a directory object or an array of entries
      const toEntries = (dir: any): any[] => {
        const subdirs = (dir.subdirectories ?? []).map((d: CourseDirectory) => ({
          ...d,
          type: 'directory' as const,
          files: [], // filled when navigating inside
        }));
        const files = (dir.files ?? []).map((f: any) => ({
          ...(f as CourseFileOverview),
          type: 'file' as const,
          createdAt: f.uploadDate ? new Date(f.uploadDate) : undefined,
        }));
        return [...subdirs, ...files];
      };

      const data = (resp as any)?.data ?? resp;
      if (Array.isArray(data)) {
        // Already entries
        return data.map((entry: any) => {
          if (entry.subdirectories || entry.files) {
            const d = entry as CourseDirectory;
            return { ...d, type: 'directory' as const, files: [] };
          }
          return {
            ...(entry as CourseFileOverview),
            type: 'file' as const,
            createdAt: (entry as any).uploadDate
              ? new Date((entry as any).uploadDate)
              : undefined,
          };
        });
      } else if (data && (data.subdirectories || data.files)) {
        return toEntries(data);
      }

      return [];
    },
    staleTime: courseFilesStaleTime,
  });

  return {
    ...directoryQuery,
    refetch: async () => {
      return directoryQuery.refetch();
    },
  };
};

/**
 * Assignments
 */
export const useGetCourseAssignments = (courseId: number | string) => {
  const { token } = useApiContext();

  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Assignments),
    queryFn: async () => {
      const res = await fetch(
        `https://edu-api.qalb.uz/api/v1/courses/${courseId}/assignments`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch assignments');

      const json = await res.json();

      return (json ?? []).map((a: any) => ({
        ...a,
        id: String(a.id ?? a.assignment_id),
        description: a.description ?? a.title ?? 'Assignment',
        mimeType: a.mimeType ?? a.file_type,
        sizeInKiloBytes:
          typeof a.sizeInKiloBytes === 'number'
            ? a.sizeInKiloBytes
            : typeof a.size === 'number'
            ? a.size / 1024
            : undefined,
        uploadedAt: a.uploadedAt
          ? new Date(a.uploadedAt)
          : a.created_at
          ? new Date(a.created_at)
          : a.due_date
          ? new Date(a.due_date)
          : undefined,
        url: a.url ?? a.file_url,
        deletedAt: a.deleted_at ? new Date(a.deleted_at) : undefined,
      }));
    },
  });
};

export const useUploadAssignment = (courseId: number | string) => {
  const client = useQueryClient();
  const { token } = useApiContext();

  return useMutation({
    mutationFn: async (dto: any) => {
      // Best-effort upload if assignmentId and file are present
      if (!dto?.assignmentId) return;
      const form = new FormData();
      if (dto?.file) {
        form.append('file', dto.file as any);
      }
      if (dto?.description) {
        form.append('description', dto.description);
      }
      await fetch(
        `https://edu-api.qalb.uz/api/v1/courses/assignments/${dto.assignmentId}/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
          },
          body: form as any,
        },
      );
    },
    onSuccess() {
      return client.invalidateQueries({
        queryKey: getCourseKey(courseId, CourseSectionEnum.Assignments),
      });
    },
  });
};

/**
 * Guide, Notices, VC, Video-lectures
 */
export const useGetCourseGuide = (courseId: number | string) => {
  const coursesClient = useCoursesClient();

  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Guide),
    queryFn: () =>
      coursesClient.getCourseGuide({ courseId: courseId }).then(r => (r as any).data ?? r),
  });
};

/**
 * Upload assignment submission with files
 */
export const useUploadAssignmentSubmissionWithFiles = (assignmentId: string | number) => {
  const client = useQueryClient();
  const coursesClient = useCoursesClient();

  return useMutation({
    mutationFn: async (dto: { files: File[]; description?: string }) => {
      const form = new FormData();
      dto.files.forEach((file, index) => {
        form.append('files', file);
      });
      if (dto.description) {
        form.append('description', dto.description);
      }
      await coursesClient.uploadAssignmentSubmissionWithFiles({
        assignmentId,
        formData: form,
      });
    },
    onSuccess() {
      return client.invalidateQueries({
        queryKey: getCourseKey(assignmentId, CourseSectionEnum.Assignments),
      });
    },
  });
};

export const useGetCourseNotices = (courseId: number | string) => {
  const { token } = useApiContext();

  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Notices),
    queryFn: async () => {
      const res = await fetch(
        `https://edu-api.qalb.uz/api/v1/courses/${courseId}/news/`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      if (!res.ok) throw new Error('Failed to fetch notices');

      const json = await res.json();

      return (json ?? []).map((n: any) => ({
        ...n,
        id: n.id ?? n.notice_id,
        content: n.content ?? n.title ?? '',
        publishedAt: n.publishedAt
          ? new Date(n.publishedAt)
          : n.created_at
          ? new Date(n.created_at)
          : n.publishDate
          ? new Date(n.publishDate)
          : undefined,
      }));
    },
  });
};

export const useGetCourseVirtualClassrooms = (courseId: number | string) => {
  const coursesClient = useCoursesClient();

  return useQuery<VirtualClassroom[]>({
    queryKey: [COURSE_QUERY_PREFIX, courseId, 'virtual-classrooms'],
    queryFn: async () => {
      const r = await coursesClient.getCourseVirtualClassrooms({ courseId });
      return (r as any).data ?? r;
    },
  });
};

export const useGetCourseVideolectures = (courseId: number | string) => {
  const coursesClient = useCoursesClient();

  return useQuery<VideoLecture[]>({
    queryKey: [COURSE_QUERY_PREFIX, courseId, 'videolectures'],
    queryFn: async () => {
      const r = await coursesClient.getCourseVideoLectures({ courseId });
      return (r as any).data ?? r;
    },
  });
};

export type CourseLecture =
  | VirtualClassroom
  | VideoLecture;

export type CourseLectureSection = {
  courseId: number | string;
  title: string;
  type: 'VirtualClassroom' | 'VideoLecture';
  data: CourseLecture[];
  isExpanded?: boolean;
};

export const useGetCourseLectures = (courseId: string | number) => {
  const { token } = useApiContext();
  const { t } = useTranslation();

  return useQuery<CourseLectureSection[]>({
    queryKey: ['course-lectures', courseId],
    queryFn: async () => {
      const response = await fetch(
        `https://edu-api.qalb.uz/api/v1/lectures/?course_id=${courseId}`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch lectures: ${response.statusText}`);
      }

      const data: {
        title: string;
        id: string;
        course_id: string;
        files: any[];
      }[] = await response.json();

      // Transform each lecture section into CourseLectureSection
      return data.map(section => ({
        courseId: section.course_id,
        title: section.title,
        type: 'Lecture',
        data: section.files,
      }));
    },
    enabled: !!token && !!courseId,
  });
};


/**
 * Exams filtered by course shortcode
 */
export const useGetCourseExams = (
  courseId: number | string,
  courseShortcode: string | undefined,
) => {
  const { data: exams } = useGetExams();
  return useQuery({
    queryKey: getCourseKey(courseId, CourseSectionEnum.Exams),
    queryFn: () =>
      (exams as Exam[]).filter(exam => {
        return exam.courseShortcode === courseShortcode;
      }),
    enabled: courseShortcode !== undefined && exams !== undefined,
  });
};

/**
 * Preferences update (no endpoint on new API) - just invalidate course
 */
export const useUpdateCoursePreferences = (courseId: number | string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_preferences: any) => {
      // no-op: keep local preferences through PreferencesContext
      return;
    },
    onSuccess() {
      return queryClient.invalidateQueries({
        queryKey: getCourseKey(courseId),
      });
    },
  });
};


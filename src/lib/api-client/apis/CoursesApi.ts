import { BaseAPI } from '../runtime';
import {
  CourseOverview,
  CourseDirectory,
  CourseFileOverview,
  CourseAssignment,
  CourseStatistics,
  CourseGuideSection,
  VideoLecture,
  GetCourseVirtualClassrooms200ResponseDataInner,
  ApiResponse,
  UploadCourseAssignmentRequest,
} from '../models';

export class CoursesApi extends BaseAPI {
  async getCourses(): Promise<ApiResponse<CourseOverview[]>> {
    return this.request<ApiResponse<CourseOverview[]>>('/courses');
  }

  async getCourse(params: { courseId: string }): Promise<ApiResponse<CourseOverview>> {
    return this.request<ApiResponse<CourseOverview>>(`/courses/${params.courseId}`);
  }

  async getCourseDirectory(params: { courseId: string; directoryId?: string }): Promise<ApiResponse<CourseDirectory>> {
    const path = params.directoryId 
      ? `/courses/${params.courseId}/directories/${params.directoryId}`
      : `/courses/${params.courseId}/directories`;
    return this.request<ApiResponse<CourseDirectory>>(path);
  }

  async getCourseFiles(params: { courseId: string }): Promise<ApiResponse<CourseFileOverview[]>> {
    return this.request<ApiResponse<CourseFileOverview[]>>(`/courses/${params.courseId}/files`);
  }

  async getCourseAssignments(params: { courseId: string }): Promise<ApiResponse<CourseAssignment[]>> {
    return this.request<ApiResponse<CourseAssignment[]>>(`/courses/${params.courseId}/assignments`);
  }

  async uploadCourseAssignment(params: UploadCourseAssignmentRequest): Promise<void> {
    return this.request<void>(`/courses/assignments/${params.assignmentId}/upload`, {
      method: 'POST',
      body: params,
    });
  }

  async getCourseStatistics(params: { courseId: string; year?: string; semester?: string }): Promise<ApiResponse<CourseStatistics>> {
    return this.request<ApiResponse<CourseStatistics>>(`/courses/${params.courseId}/statistics`, {
      query: {
        year: params.year,
        semester: params.semester,
      },
    });
  }

  async getCourseGuide(params: { courseId: string }): Promise<ApiResponse<CourseGuideSection[]>> {
    return this.request<ApiResponse<CourseGuideSection[]>>(`/courses/${params.courseId}/guide`);
  }

  async getCourseVideoLectures(params: { courseId: string }): Promise<ApiResponse<VideoLecture[]>> {
    return this.request<ApiResponse<VideoLecture[]>>(`/courses/${params.courseId}/video-lectures`);
  }

  async getCourseVirtualClassrooms(params: { courseId: string }): Promise<ApiResponse<GetCourseVirtualClassrooms200ResponseDataInner[]>> {
    return this.request<ApiResponse<GetCourseVirtualClassrooms200ResponseDataInner[]>>(`/courses/${params.courseId}/virtual-classrooms`);
  }
}

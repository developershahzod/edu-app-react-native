import { BaseAPI } from '../runtime';
import {
  CourseOverview,
  ApiResponse,
  VideoLecture,
} from '../models';

export class CoursesApi extends BaseAPI {
  async getCourses(): Promise<ApiResponse<CourseOverview[]>> {
    return this.request<ApiResponse<CourseOverview[]>>('/courses');
  }

  async getCourse(params: { courseId: string | number }): Promise<ApiResponse<CourseOverview>> {
    return this.request<ApiResponse<CourseOverview>>(`/courses/${params.courseId}`);
  }

  async getCourseDirectory(params: { courseId: string | number; directoryId?: string }): Promise<ApiResponse<any>> {
    const path = params.directoryId
      ? `/courses/${params.courseId}/directories/${params.directoryId}`
      : `/courses/${params.courseId}/directories`;
    return this.request<ApiResponse<any>>(path);
  }

  async getCourseFiles(params: { courseId: string | number }): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/courses/${params.courseId}/files`);
  }

  async getCourseAssignments(params: { courseId: string | number }): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/courses/${params.courseId}/assignments`);
  }

  async uploadCourseAssignment(params: any): Promise<void> {
    return this.request<void>(`/courses/assignments/${params.assignmentId}/upload`, {
      method: 'POST',
      body: params,
    } as any);
  }

  async getCourseStatistics(params: { courseId: string | number; year?: string; semester?: string }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/courses/${params.courseId}/statistics`,
      {
        query: {
          year: params.year,
          semester: params.semester,
        },
      } as any,
    );
  }

  async getCourseGuide(params: { courseId: string | number }): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/courses/${params.courseId}/guide`);
  }

  async getCourseVideoLectures(params: { courseId: string | number }): Promise<ApiResponse<VideoLecture[]>> {
    return this.request<ApiResponse<VideoLecture[]>>(`/courses/${params.courseId}/video-lectures`);
  }

  async getCourseVirtualClassrooms(params: { courseId: string | number }): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/courses/${params.courseId}/virtual-classrooms`);
  }

  // Course news/notices for detail page
  async getCourseNotices(params: { courseId: string | number }): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/courses/${params.courseId}/news`);
  }
}

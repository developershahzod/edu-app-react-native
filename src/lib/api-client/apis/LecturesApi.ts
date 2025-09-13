import { BaseAPI } from '../runtime';
import {
  Lecture,
  ApiResponse,
} from '../models';

export class LecturesApi extends BaseAPI {
  async getLectures(params?: { courseId?: string; fromDate?: string; toDate?: string }): Promise<ApiResponse<Lecture[]>> {
    return this.request<ApiResponse<Lecture[]>>('/lectures', {
      query: params,
    });
  }

  async getLecture(params: { lectureId: number }): Promise<ApiResponse<Lecture>> {
    return this.request<ApiResponse<Lecture>>(`/lectures/${params.lectureId}`);
  }
}

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

  async downloadLectureFile(params: { lectureId: number; filename: string }): Promise<Blob> {
    // Use fetch directly to handle blob response type
    const response = await fetch(
      `/api/v1/lectures/download/${params.lectureId}/${encodeURIComponent(params.filename)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return await response.blob();
  }
}

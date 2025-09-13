import { BaseAPI } from '../runtime';
import {
  Exam,
  BookExamRequest,
  RescheduleExamRequest,
  ApiResponse,
} from '../models';

export class ExamsApi extends BaseAPI {
  async getExams(): Promise<ApiResponse<Exam[]>> {
    return this.request<ApiResponse<Exam[]>>('/exams');
  }

  async getExam(params: { examId: number }): Promise<ApiResponse<Exam>> {
    return this.request<ApiResponse<Exam>>(`/exams/${params.examId}`);
  }

  async bookExam(params: { examId: number; bookExamRequest: BookExamRequest }): Promise<void> {
    return this.request<void>(`/exams/${params.examId}/book`, {
      method: 'POST',
      body: params.bookExamRequest,
    });
  }

  async deleteExamBookingById(params: { examId: number }): Promise<void> {
    return this.request<void>(`/exams/${params.examId}/booking`, {
      method: 'DELETE',
    });
  }

  async rescheduleExam(params: { examId: number; rescheduleExamRequest: RescheduleExamRequest }): Promise<void> {
    return this.request<void>(`/exams/${params.examId}/reschedule`, {
      method: 'POST',
      body: params.rescheduleExamRequest,
    });
  }
}

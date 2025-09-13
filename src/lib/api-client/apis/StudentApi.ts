import { BaseAPI } from '../runtime';
import {
  Student,
  ExamGrade,
  ProvisionalGrade,
  ProvisionalGradeState,
  Deadline,
  Message,
  GuideSection,
  Notification,
  ApiResponse,
  UpdateDevicePreferencesRequest,
  UpdateNotificationPreferencesRequestData,
} from '../models';

export interface UpdateNotificationPreferencesRequest {
  updateNotificationPreferencesRequest: UpdateNotificationPreferencesRequestData;
}

export type { UpdateDevicePreferencesRequest } from '../models';

export class StudentApi extends BaseAPI {
  async getStudent(): Promise<ApiResponse<Student>> {
    return this.request<ApiResponse<Student>>('/student');
  }

  async getStudentGrades(): Promise<ApiResponse<ExamGrade[]>> {
    return this.request<ApiResponse<ExamGrade[]>>('/student/grades');
  }

  async getStudentProvisionalGrades(): Promise<ApiResponse<ProvisionalGrade[]> & { states: ProvisionalGradeState[] }> {
    return this.request<ApiResponse<ProvisionalGrade[]> & { states: ProvisionalGradeState[] }>('/student/provisional-grades');
  }

  async acceptProvisionalGrade(params: { provisionalGradeId: number }): Promise<void> {
    return this.request<void>(`/student/provisional-grades/${params.provisionalGradeId}/accept`, {
      method: 'POST',
    });
  }

  async rejectProvisionalGrade(params: { provisionalGradeId: number }): Promise<void> {
    return this.request<void>(`/student/provisional-grades/${params.provisionalGradeId}/reject`, {
      method: 'POST',
    });
  }

  async getDeadlines(params: { fromDate: string; toDate: string }): Promise<ApiResponse<Deadline[]>> {
    return this.request<ApiResponse<Deadline[]>>('/student/deadlines', {
      query: {
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
    });
  }

  async updateDevicePreferences(params: UpdateDevicePreferencesRequest): Promise<void> {
    return this.request<void>('/student/device-preferences', {
      method: 'PUT',
      body: params,
    });
  }

  async getMessages(): Promise<ApiResponse<Message[]>> {
    return this.request<ApiResponse<Message[]>>('/student/messages');
  }

  async markMessageAsRead(params: { messageId: number }): Promise<void> {
    return this.request<void>(`/student/messages/${params.messageId}/read`, {
      method: 'POST',
    });
  }

  async getGuides(): Promise<ApiResponse<GuideSection[]>> {
    return this.request<ApiResponse<GuideSection[]>>('/student/guides');
  }

  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/student/notifications');
  }

  async markNotificationAsRead(params: { notificationId: number }): Promise<void> {
    return this.request<void>(`/student/notifications/${params.notificationId}/read`, {
      method: 'POST',
    });
  }

  async getNotificationPreferences(): Promise<ApiResponse<Record<string, boolean>>> {
    return this.request<ApiResponse<Record<string, boolean>>>('/student/notification-preferences');
  }

  async updateNotificationPreferences(params: UpdateNotificationPreferencesRequest): Promise<void> {
    return this.request<void>('/student/notification-preferences', {
      method: 'PUT',
      body: params.updateNotificationPreferencesRequest,
    });
  }

  async getUnreadEmailslNumber(): Promise<ApiResponse<{ count: number }>> {
    return this.request<ApiResponse<{ count: number }>>('/student/unread-emails');
  }
}

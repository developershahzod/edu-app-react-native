import { BaseAPI } from '../runtime';
import { ApiResponse } from '../models';

export type CalendarEvent = {
  id: string | number;
  title?: string;
  type?: string; // lecture | exam | deadline | booking | other
  starts_at?: string; // ISO
  ends_at?: string;   // ISO
  course_id?: string | number;
  course_name?: string;
  place?: string;
  teacher_id?: number;
  // Fallbacks for different backends
  start_date?: string;
  end_date?: string;
  start?: string;
  end?: string;
};

export class CalendarApi extends BaseAPI {
  async getMyEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    return this.request<ApiResponse<CalendarEvent[]>>(
      '/calendar/my-events',
      {
        // The runtime supports init.query passthrough
    
      } as any
    );
  }
}
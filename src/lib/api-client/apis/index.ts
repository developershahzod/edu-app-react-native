import { BaseAPI } from '../runtime';
import {
  PersonOverview,
  Person,
  PlaceOverview,
  Building,
  PlaceCategory,
  Booking,
  BookingSlot,
  BookingSeatCell,
  TicketOverview,
  TicketReply,
  TicketFAQ,
  CreateTicketRequest,
  ReplyToTicketRequest,
  NewsItemOverview,
  JobOfferOverview,
  Survey,
  Degree,
  OfferingCourseOverview,
  OfferingCourseStaff,
  CourseStatistics,
  EuropeanStudentCard,
  ApiResponse,
  GetPlacesRequest,
  GetFreeRoomsRequest,
  GetCourseStatisticsRequest,
} from '../models';

export class PeopleApi extends BaseAPI {
  async searchPeople(params: { query: string }): Promise<ApiResponse<PersonOverview[]>> {
    return this.request<ApiResponse<PersonOverview[]>>('/people/search', {
      query: { q: params.query },
    });
  }

  async getPerson(params: { personId: string }): Promise<ApiResponse<Person>> {
    return this.request<ApiResponse<Person>>(`/people/${params.personId}`);
  }
}

export class PlacesApi extends BaseAPI {
  async getPlaces(params?: GetPlacesRequest): Promise<ApiResponse<PlaceOverview[]>> {
    return this.request<ApiResponse<PlaceOverview[]>>('/places', {
      query: params,
    });
  }

  async getPlace(params: { placeId: string }): Promise<ApiResponse<PlaceOverview>> {
    return this.request<ApiResponse<PlaceOverview>>(`/places/${params.placeId}`);
  }

  async getBuildings(): Promise<ApiResponse<Building[]>> {
    return this.request<ApiResponse<Building[]>>('/places/buildings');
  }

  async getBuilding(params: { buildingId: string }): Promise<ApiResponse<Building>> {
    return this.request<ApiResponse<Building>>(`/places/buildings/${params.buildingId}`);
  }

  async getPlaceCategories(): Promise<ApiResponse<PlaceCategory[]>> {
    return this.request<ApiResponse<PlaceCategory[]>>('/places/categories');
  }

  async getFreeRooms(params: GetFreeRoomsRequest): Promise<ApiResponse<PlaceOverview[]>> {
    return this.request<ApiResponse<PlaceOverview[]>>('/places/free-rooms', {
      query: params,
    });
  }
}

export class BookingsApi extends BaseAPI {
  async getBookings(): Promise<ApiResponse<Booking[]>> {
    return this.request<ApiResponse<Booking[]>>('/bookings');
  }

  async getBooking(params: { bookingId: number }): Promise<ApiResponse<Booking>> {
    return this.request<ApiResponse<Booking>>(`/bookings/${params.bookingId}`);
  }

  async getBookingSlots(params: { topicId: number; date: string }): Promise<ApiResponse<BookingSlot[]>> {
    return this.request<ApiResponse<BookingSlot[]>>('/bookings/slots', {
      query: { topicId: params.topicId, date: params.date },
    });
  }

  async getBookingSeats(params: { slotId: number }): Promise<ApiResponse<BookingSeatCell[]>> {
    return this.request<ApiResponse<BookingSeatCell[]>>(`/bookings/slots/${params.slotId}/seats`);
  }

  async createBooking(params: { slotId: number; seatId?: string }): Promise<ApiResponse<Booking>> {
    return this.request<ApiResponse<Booking>>('/bookings', {
      method: 'POST',
      body: { slotId: params.slotId, seatId: params.seatId },
    });
  }

  async cancelBooking(params: { bookingId: number }): Promise<void> {
    return this.request<void>(`/bookings/${params.bookingId}`, {
      method: 'DELETE',
    });
  }
}

export class TicketsApi extends BaseAPI {
  async getTickets(): Promise<ApiResponse<TicketOverview[]>> {
    return this.request<ApiResponse<TicketOverview[]>>('/tickets');
  }

  async getTicket(params: { ticketId: number }): Promise<ApiResponse<TicketOverview>> {
    return this.request<ApiResponse<TicketOverview>>(`/tickets/${params.ticketId}`);
  }

  async getTicketReplies(params: { ticketId: number }): Promise<ApiResponse<TicketReply[]>> {
    return this.request<ApiResponse<TicketReply[]>>(`/tickets/${params.ticketId}/replies`);
  }

  async createTicket(params: { createTicketRequest: CreateTicketRequest }): Promise<ApiResponse<TicketOverview>> {
    return this.request<ApiResponse<TicketOverview>>('/tickets', {
      method: 'POST',
      body: params.createTicketRequest,
    });
  }

  async replyToTicket(params: { ticketId: number; replyToTicketRequest: ReplyToTicketRequest }): Promise<void> {
    return this.request<void>(`/tickets/${params.ticketId}/replies`, {
      method: 'POST',
      body: params.replyToTicketRequest,
    });
  }

  async closeTicket(params: { ticketId: number }): Promise<void> {
    return this.request<void>(`/tickets/${params.ticketId}/close`, {
      method: 'POST',
    });
  }

  async getTicketFAQs(): Promise<ApiResponse<TicketFAQ[]>> {
    return this.request<ApiResponse<TicketFAQ[]>>('/tickets/faq');
  }
}

export class NewsApi extends BaseAPI {
  async getNews(): Promise<ApiResponse<NewsItemOverview[]>> {
    return this.request<ApiResponse<NewsItemOverview[]>>('/news');
  }

  async getNewsItem(params: { newsId: number }): Promise<ApiResponse<NewsItemOverview>> {
    return this.request<ApiResponse<NewsItemOverview>>(`/news/${params.newsId}`);
  }
}

export class JobOffersApi extends BaseAPI {
  async getJobOffers(): Promise<ApiResponse<JobOfferOverview[]>> {
    return this.request<ApiResponse<JobOfferOverview[]>>('/job-offers');
  }

  async getJobOffer(params: { jobOfferId: number }): Promise<ApiResponse<JobOfferOverview>> {
    return this.request<ApiResponse<JobOfferOverview>>(`/job-offers/${params.jobOfferId}`);
  }
}

export class SurveysApi extends BaseAPI {
  async getSurveys(): Promise<ApiResponse<Survey[]>> {
    return this.request<ApiResponse<Survey[]>>('/surveys');
  }

  async getSurvey(params: { surveyId: number }): Promise<ApiResponse<Survey>> {
    return this.request<ApiResponse<Survey>>(`/surveys/${params.surveyId}`);
  }

  async completeSurvey(params: { surveyId: number; responses: Record<string, any> }): Promise<void> {
    return this.request<void>(`/surveys/${params.surveyId}/complete`, {
      method: 'POST',
      body: { responses: params.responses },
    });
  }
}

export class OfferingApi extends BaseAPI {
  async getDegrees(): Promise<ApiResponse<Degree[]>> {
    return this.request<ApiResponse<Degree[]>>('/offering/degrees');
  }

  async getDegree(params: { degreeId: string }): Promise<ApiResponse<Degree>> {
    return this.request<ApiResponse<Degree>>(`/offering/degrees/${params.degreeId}`);
  }

  async getDegreeCourses(params: { degreeId: string; trackId?: string }): Promise<ApiResponse<OfferingCourseOverview[]>> {
    return this.request<ApiResponse<OfferingCourseOverview[]>>(`/offering/degrees/${params.degreeId}/courses`, {
      query: { trackId: params.trackId },
    });
  }

  async getCourseStaff(params: { courseId: string }): Promise<ApiResponse<OfferingCourseStaff>> {
    return this.request<ApiResponse<OfferingCourseStaff>>(`/offering/courses/${params.courseId}/staff`);
  }

  async getCourseStatistics(params: GetCourseStatisticsRequest): Promise<ApiResponse<CourseStatistics>> {
    return this.request<ApiResponse<CourseStatistics>>(`/offering/courses/${params.courseId}/statistics`, {
      query: { year: params.year, semester: params.semester },
    });
  }
}

export class EscApi extends BaseAPI {
  async getEuropeanStudentCard(): Promise<ApiResponse<EuropeanStudentCard>> {
    return this.request<ApiResponse<EuropeanStudentCard>>('/esc/card');
  }

  async requestEuropeanStudentCard(): Promise<void> {
    return this.request<void>('/esc/card/request', {
      method: 'POST',
    });
  }

  async renewEuropeanStudentCard(): Promise<void> {
    return this.request<void>('/esc/card/renew', {
      method: 'POST',
    });
  }
}

// Re-export individual APIs
export { AuthApi } from './AuthApi';
export { StudentApi } from './StudentApi';
export { CoursesApi } from './CoursesApi';
export { ExamsApi } from './ExamsApi';
export { LecturesApi } from './LecturesApi';

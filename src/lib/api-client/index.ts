// Export runtime
export * from './runtime';

// Export models
export * from './models';

// Export APIs
export * from './apis';

// Re-export specific APIs for convenience
export {
  AuthApi,
  StudentApi,
  CoursesApi,
  ExamsApi,
  LecturesApi,
  PeopleApi,
  PlacesApi,
  BookingsApi,
  TicketsApi,
  NewsApi,
  JobOffersApi,
  SurveysApi,
  OfferingApi,
  EscApi,
} from './apis';

// Export BASE_PATH for compatibility
export { BASE_PATH } from './runtime';

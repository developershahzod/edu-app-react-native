# List of implemented async GET endpoints in API client classes

- CoursesApi
  - getCourses(): GET /courses
  - getCourse(params: { courseId: string }): GET /courses/{courseId}
  - getCourseDirectory(params: { courseId: string; directoryId?: string }): GET /courses/{courseId}/directory/{directoryId?}
  - getCourseFiles(params: { courseId: string }): GET /courses/{courseId}/files
  - getCourseAssignments(params: { courseId: string }): GET /courses/{courseId}/assignments
  - getCourseStatistics(params: { courseId: string; year?: string; semester?: string }): GET /courses/{courseId}/statistics
  - getCourseGuide(params: { courseId: string }): GET /courses/{courseId}/guide
  - getCourseVideoLectures(params: { courseId: string }): GET /courses/{courseId}/video-lectures
  - getCourseVirtualClassrooms(params: { courseId: string }): GET /courses/{courseId}/virtual-classrooms

- PeopleApi
  - searchPeople(params: { query: string }): GET /people/search
  - getPerson(params: { personId: string }): GET /people/{personId}

- PlacesApi
  - getPlaces(params?: GetPlacesRequest): GET /places
  - getPlace(params: { placeId: string }): GET /places/{placeId}
  - getBuildings(): GET /places/buildings
  - getBuilding(params: { buildingId: string }): GET /places/buildings/{buildingId}
  - getPlaceCategories(): GET /places/categories
  - getFreeRooms(params: GetFreeRoomsRequest): GET /places/free-rooms

- BookingsApi
  - getBookings(): GET /bookings
  - getBooking(params: { bookingId: number }): GET /bookings/{bookingId}
  - getBookingSlots(params: { topicId: number; date: string }): GET /bookings/slots
  - getBookingSeats(params: { slotId: number }): GET /bookings/slots/{slotId}/seats

- TicketsApi
  - getTickets(): GET /tickets
  - getTicket(params: { ticketId: number }): GET /tickets/{ticketId}
  - getTicketReplies(params: { ticketId: number }): GET /tickets/{ticketId}/replies
  - getTicketFAQs(): GET /tickets/faq

- NewsApi
  - getNews(): GET /news
  - getNewsItem(params: { newsId: number }): GET /news/{newsId}

- JobOffersApi
  - getJobOffers(): GET /job-offers
  - getJobOffer(params: { jobOfferId: number }): GET /job-offers/{jobOfferId}

- SurveysApi
  - getSurveys(): GET /surveys
  - getSurvey(params: { surveyId: number }): GET /surveys/{surveyId}

- OfferingApi
  - getDegrees(): GET /offering/degrees
  - getDegree(params: { degreeId: string }): GET /offering/degrees/{degreeId}
  - getDegreeCourses(params: { degreeId: string; trackId?: string }): GET /offering/degrees/{degreeId}/courses
  - getCourseStaff(params: { courseId: string }): GET /offering/courses/{courseId}/staff
  - getCourseStatistics(params: GetCourseStatisticsRequest): GET /offering/courses/{courseId}/statistics

- EscApi
  - getEuropeanStudentCard(): GET /esc/card

- LecturesApi
  - getLectures(params?: { courseId?: string; fromDate?: string; toDate?: string }): GET /lectures
  - getLecture(params: { lectureId: number }): GET /lectures/{lectureId}

- AuthApi
  - getMe(): GET /users/me

- ExamsApi
  - getExams(): GET /exams
  - getExam(params: { examId: number }): GET /exams/{examId}

- StudentApi
  - getStudent(): GET /student
  - getStudentGrades(): GET /student/grades
  - getStudentProvisionalGrades(): GET /student/provisional-grades
  - getDeadlines(params: { fromDate: string; toDate: string }): GET /student/deadlines
  - getMessages(): GET /student/messages
  - getGuides(): GET /student/guides
  - getNotifications(): GET /student/notifications
  - getNotificationPreferences(): GET /student/notification-preferences
  - getUnreadEmailslNumber(): GET /student/unread-emails

- UsersApi
  - getUsers(): GET /users/
  - getUsersByRole(params: { role: string }): GET /users/by-role/{role}
  - getUser(params: { userId: string }): GET /users/{userId}
// Base API URL
export const BASE_API_URL = 'https://edu-api.qalb.uz/api/v1';

// Enums
export enum RoleType {
  STUDENT = 'student',
  TEACHER = 'teacher',
  SUPERVISOR = 'supervisor',
  ADMIN = 'admin'
}

export enum ProgramType {
  BACHELOR = 'bachelor',
  MASTER = 'master',
  PHD = 'phd',
  INTERNSHIP = 'internship',
  ONLINE_COURSE = 'online_course',
  CERTIFICATE = 'certificate',
  DIPLOMA = 'diploma'
}

export enum EventType {
  HOLIDAY = 'holiday',
  BREAK_START = 'break_start',
  BREAK_END = 'break_end',
  SEMESTER_START = 'semester_start',
  SEMESTER_END = 'semester_end',
  EXAM_PERIOD = 'exam_period',
  REGISTRATION = 'registration'
}

// User interfaces
export interface User {
  id: string;
  login: string;
  email: string;
  phone_number?: string;
  role_type: RoleType;
  name?: string;
  surname?: string;
  is_active: boolean;
}

export interface UserCreate {
  login: string;
  email: string;
  phone_number?: string;
  role_type: RoleType;
  name?: string;
  surname?: string;
  password: string;
  academic_year?: number;
  semester?: number;
  auto_generate_login?: boolean;
}

export interface UserUpdate {
  login?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  name?: string;
  surname?: string;
  role_type?: RoleType;
  is_active?: boolean;
}

// Authentication interfaces
export interface LoginRequest {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Study Program interfaces
export interface StudyProgram {
  id: string;
  title: string;
  description?: string;
  academic_year: string;
  program_type: ProgramType;
  start_date: string;
  end_date?: string;
  published: boolean;
  supervisor?: User;
  students: User[];
  teachers: User[];
}

export interface StudyProgramCreate {
  title: string;
  description?: string;
  academic_year: string;
  program_type?: ProgramType;
  start_date: string;
  end_date?: string;
  published?: boolean;
}

export interface StudyProgramUpdate {
  title: string;
  description?: string;
  academic_year: string;
  program_type?: ProgramType;
  start_date: string;
  end_date?: string;
  published?: boolean;
}

export interface StudyProgramUserLink {
  user_id: string;
}

export interface StudyProgramUsersLink {
  user_ids: string[];
}

export interface SupervisorAssignment {
  supervisor_id: string;
}

// Course interfaces
export interface Course {
  id: string;
  title: string;
  description?: string;
  prerequisites?: string;
  course_topics?: string;
  assessment_info?: string;
  reading_materials?: string;
  category?: string;
  academic_year?: string;
  semester?: string;
  schedule?: any;
  start_date?: string;
  end_date?: string;
  published?: boolean;
  materials?: string[];
  order?: number;
  study_program_id: string;
  teachers: User[];
  students: User[];
  study_program?: StudyProgram;
}

export interface CourseCreate {
  title: string;
  description?: string;
  prerequisites?: string;
  course_topics?: string;
  assessment_info?: string;
  reading_materials?: string;
  category?: string;
  academic_year?: string;
  semester?: string;
  schedule?: any;
  start_date?: string;
  end_date?: string;
  published?: boolean;
  materials?: string[];
  order?: number;
  study_program_id: string;
}

export interface CourseUpdate {
  title?: string;
  description?: string;
  prerequisites?: string;
  course_topics?: string;
  assessment_info?: string;
  reading_materials?: string;
  category?: string;
  academic_year?: string;
  semester?: string;
  schedule?: any;
  start_date?: string;
  end_date?: string;
  published?: boolean;
  materials?: string[];
  order?: number;
}

export interface CourseUsersLink {
  user_ids: string[];
}

// News interfaces
export interface News {
  id: string;
  title: string;
  content: string;
  course_id: string;
  author: User;
  created_at: string;
}

export interface NewsCreate {
  title: string;
  content: string;
}

export interface NewsUpdate {
  title?: string;
  content?: string;
}

// Forum interfaces
export interface ForumThread {
  id: string;
  title: string;
  course_id: string;
  author_id: string;
  created_at: string;
  author: User;
}

export interface ForumThreadCreate {
  title: string;
  content: string;
}

export interface ForumThreadWithPosts {
  id: string;
  title: string;
  course_id: string;
  author_id: string;
  created_at: string;
  author: User;
  posts: ForumPost[];
}

export interface ForumPost {
  id: string;
  content: string;
  thread_id: string;
  author_id: string;
  created_at: string;
  author: User;
}

export interface ForumPostCreate {
  content: string;
}

// Assignment interfaces
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  course_id: string;
  created_at: string;
}

export interface AssignmentCreate {
  title: string;
  description?: string;
  due_date?: string;
}

export interface AssignmentWithSubmissions {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  course_id: string;
  created_at: string;
  submissions: Submission[];
}

export interface Submission {
  id: string;
  content?: string;
  file_url?: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string;
  student: User;
}

export interface SubmissionCreate {
  content?: string;
  file_url?: string;
}

// Lecture interfaces
export interface Lecture {
  id: string;
  title: string;
  course_id: string;
  files: LectureFile[];
}

export interface LectureCreate {
  title: string;
  course_id: string;
}

export interface LectureUpdate {
  title?: string;
}

export interface LectureFile {
  id: string;
  filename: string;
  folder_name?: string;
  is_folder: boolean;
  stored_filename: string;
  file_size?: string;
  file_type?: string;
  upload_date: string;
  lecture_id: string;
  author?: User;
}

// Academic Event interfaces
export interface AcademicEventResponse {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type: EventType;
  color: string;
  is_active: boolean;
  academic_year?: string;
}

export interface AcademicEventCreate {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type: EventType;
  color?: string;
  academic_year?: string;
}

export interface AcademicEventUpdate {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  event_type?: EventType;
  color?: string;
  academic_year?: string;
  is_active?: boolean;
}

// Admin interfaces
export interface AdminStats {
  total_users: number;
  total_study_programs: number;
  total_courses: number;
  active_students: number;
}

// Error interfaces
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// File upload interfaces
export interface FileUploadBody {
  files: File[];
}

export interface SubmissionWithFilesBody {
  content?: string;
  files: File[];
}

// Utility type guards
export function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.login === 'string';
}

export function isCourse(obj: any): obj is Course {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
}

export function isStudyProgram(obj: any): obj is StudyProgram {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
}

// Legacy compatibility types (for existing app components)
export interface Student extends User {
  username: string;
  firstName: string;
  lastName: string;
  degreeName: string;
  degreeId: string;
  degreeLevel: string;
  status: string;
  isCurrentlyEnrolled: boolean;
  totalCredits: number;
  totalAttendedCredits: number;
  // Additional properties used in the app
  averageGrade?: number;
  estimatedFinalGrade?: number;
  estimatedFinalGradePurged?: number;
  usePurgedAverageFinalGrade?: boolean;
  totalAcquiredCredits?: number;
  firstEnrollmentYear?: number;
  smartCardPicture?: string;
  europeanStudentCard?: {
    canBeRequested: boolean;
    details?: any;
  };
}

export interface CourseOverview {
  id: string;
  name: string;
  shortcode: string;
  credits: number;
  year: string;
  semester: string;
}

// Additional legacy interfaces needed by the app
export interface Person extends User {
  firstName: string;
  lastName: string;
  office?: string;
  picture?: string;
  phone?: PhoneNumber[];
  courses?: PersonCourse[];
}

export interface PersonOverview {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
}

export interface PhoneNumber {
  number: string;
  type: string;
}

export interface PersonCourse {
  id: string;
  name: string;
  role: string;
}

export interface PlaceRef {
  id: string;
  name: string;
  building?: string;
  floor?: string;
}

export interface PlaceOverview {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity?: number;
  category: PlaceCategory;
}

export interface PlaceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Booking {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
}

export interface BookingSlot {
  id: number;
  startTime: Date;
  endTime: Date;
  availableSeats: number;
}

export interface BookingSeatCell {
  id: string;
  row: number;
  column: number;
  isAvailable: boolean;
  isSelected: boolean;
}

export interface Deadline {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  courseId: string;
  courseName: string;
}

export interface Exam {
  id: number;
  courseId: string;
  courseName: string;
  courseShortcode: string;
  moduleNumber: string;
  date: Date;
  examStartsAt: Date | null;
  examEndsAt?: Date | null;
  location: string;
  status: ExamStatusEnum;
  registrationDeadline: Date;
  withdrawalDeadline: Date;
}

export enum ExamStatusEnum {
  AVAILABLE = 'available',
  REGISTERED = 'registered',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn'
}

export interface BookExamRequest {
  examId: number;
  notes?: string;
}

export interface RescheduleExamRequest {
  examId: number;
  newDate: Date;
}

export interface ExamGrade {
  id: number;
  courseId: string;
  courseName: string;
  grade: number;
  date: Date;
  credits: number;
  passed: boolean;
}

export interface ProvisionalGrade {
  id: number;
  courseId: string;
  courseName: string;
  grade: number;
  date: Date;
  credits: number;
  state: ProvisionalGradeStateEnum;
  rejectingExpiresAt?: Date;
  canBeAccepted?: boolean;
  canBeRejected?: boolean;
  isFailure?: boolean;
  isWithdrawn?: boolean;
  teacherMessage?: string;
  teacherId?: number;
}

export enum ProvisionalGradeStateEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CONFIRMED = 'confirmed',
  PUBLISHED = 'published'
}

export interface ProvisionalGradeState {
  id: number;
  state: ProvisionalGradeStateEnum;
  date: Date;
}

export interface Message {
  id: number;
  subject: string;
  content: string;
  date: Date;
  isRead: boolean;
  sender: string;
  type: MessageType;
}

export enum MessageType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

export interface TicketOverview {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  message?: string;
  unreadCount?: number;
  replies?: TicketReply[];
  hasAttachments?: boolean;
  attachments?: TicketAttachment[];
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface TicketReply {
  id: number;
  content: string;
  createdAt: Date;
  author: string;
  isFromSupport: boolean;
  message?: string;
  attachments?: TicketAttachment[];
}

export interface TicketAttachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  downloadUrl: string;
}

export interface TicketFAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: string;
  attachments?: File[];
}

export interface ReplyToTicketRequest {
  content: string;
  attachments?: File[];
}

export interface NewsItemOverview {
  id: number;
  title: string;
  summary: string;
  publishDate: Date;
  category: string;
  imageUrl?: string;
}

export interface JobOfferOverview {
  id: number;
  title: string;
  company: string;
  location: string;
  publishDate: Date;
  expiryDate: Date;
  type: string;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
}

export interface Degree {
  id: string;
  name: string;
  level: string;
  department: string;
}

export interface OfferingCourseOverview {
  id: string;
  name: string;
  shortcode: string;
  credits: number;
  year: string;
  semester: string;
  teachers: Teacher[];
}

export interface OfferingCourseStaff {
  id: string;
  courseId: string;
  courseName: string;
  staff: CourseStaffInner[];
}

export interface CourseStaffInner {
  person: Person;
  role: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface CourseStatistics {
  totalStudents: number;
  passedStudents: number;
  averageGrade: number;
  teacher?: Teacher;
}

export interface CourseDirectory {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  files: CourseFileOverview[];
  subdirectories: CourseDirectory[];
}

export interface CourseFileOverview {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadDate: Date;
  downloadUrl: string;
}

export interface EuropeanStudentCard {
  id: string;
  cardNumber: string;
  status: EuropeanStudentCardDetailsStatusEnum;
  issueDate: Date;
  expiryDate: Date;
}

export enum EuropeanStudentCardDetailsStatusEnum {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  date: Date;
  isRead: boolean;
  type: string;
}

export interface VideoLecture {
  id: number;
  title: string;
  url: string;
  duration: number;
  thumbnail?: string;
}

export interface VirtualClassroom {
  id: number;
  title: string;
  url: string;
  isLive: boolean;
  startTime: Date;
  endTime: Date;
}

// Request interfaces
export interface GetPlacesRequest {
  buildingId?: string;
  category?: string;
  search?: string;
}

export interface GetFreeRoomsRequest {
  buildingId?: string;
  date: Date;
  startTime: string;
  endTime: string;
}

export interface GetCourseStatisticsRequest {
  courseId: string;
  year?: string;
  semester?: string;
}

// Utility functions
export function instanceOfVideoLecture(value: any): value is VideoLecture {
  return value && typeof value.id === 'number' && typeof value.url === 'string';
}

export function instanceOfVirtualClassroom(value: any): value is VirtualClassroom {
  return value && typeof value.id === 'number' && typeof value.url === 'string';
}

export function instanceOfVirtualClassroomLive(value: any): value is VirtualClassroom {
  return instanceOfVirtualClassroom(value) && value.isLive === true;
}

// Convert API User to legacy Student format
export function userToStudent(user: User): Student {
  return {
    ...user,
    username: user.login,
    firstName: user.name || '',
    lastName: user.surname || '',
    degreeName: '',
    degreeId: '',
    degreeLevel: '',
    status: user.is_active ? 'active' : 'inactive',
    isCurrentlyEnrolled: user.is_active,
    totalCredits: 0,
    totalAttendedCredits: 0,
    // Ensure ESC object exists to avoid runtime crashes when reading canBeRequested
    europeanStudentCard: {
      canBeRequested: false,
      details: undefined,
    },
  };
}

// Convert API Course to legacy CourseOverview format
export function courseToCourseOverview(course: Course): CourseOverview {
  return {
    id: course.id,
    name: course.title,
    shortcode: course.title.substring(0, 6).toUpperCase(),
    credits: 6, // Default value
    year: course.academic_year || '',
    semester: course.semester || ''
  };
}

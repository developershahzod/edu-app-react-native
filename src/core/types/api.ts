import { CourseOverview as ApiCourseOverview } from '../../../../src/lib/api-client/CourseOverview';
import { Exam as ApiExam } from '../../../../src/lib/api-client/Exam';

export type SuccessResponse<T> = {
  data: T;
};

export interface Exam extends ApiExam {
  isTimeToBeDefined: boolean;
  uniqueShortcode: string;
}

export interface CourseOverview extends ApiCourseOverview {
  uniqueShortcode: string;
}

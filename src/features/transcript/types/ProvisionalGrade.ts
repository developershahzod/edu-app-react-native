import { ProvisionalGrade as ApiGrade } from '../../lib/api-client/ProvisionalGrade';

export type ProvisionalGrade = ApiGrade & { gradeDescription: string };

import { ProvisionalGrade as ApiGrade } from '../../../../src/lib/api-client/ProvisionalGrade';

export type ProvisionalGrade = ApiGrade & { gradeDescription: string };

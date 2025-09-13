import { Lecture as ApiLecture } from '../../../../src/lib/api-client';

export interface Lecture extends ApiLecture {
  uniqueShortcode?: string;
}
